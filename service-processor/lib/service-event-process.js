const LOG_CATEGORY = 'EVENT-PROCESSOR'
const logger = require('logger').getDefaultLogger(LOG_CATEGORY);
const EventEmitter = require('events').EventEmitter;
const ServiceEventDefs = require('./defs').ServiceEventDefs;
const multer = require('multer');
const util = require('util');
const express = require('express');
const pathModule = require('path');
const queryStrModule = require('querystring');
const urlModule = require('url');
const unidecode = require('unidecode');
const https = require('https');
const fs = require('fs');

class ServiceProcess {

	constructor(config) {

		if (!(this instanceof ServiceProcess))
			return (new ServiceProcess(config));

		let _config;

		if (typeof config != 'object') {
			_config = JSON.parse(config);
		} else {
			_config = config;
		}

		this.app = express();
		this.config = _config;
		this.config.listener.requestTimeout = this.config.listener.requestTimeout || ServiceEventDefs.REQ_TIMEOUT;

		this.app.use(express.urlencoded({ extended: false, limit: '2mb' }));
		this.app.use(express.json({ limit: '2mb' }));
		this.app.use(multer().single('upfile'));
		this.app.use(logMsg);
		this.app.use(setHeaders);
		initHTTPServer(this.app, _config.listener);
		initApiEndpoints(_config, this);

	}

	register(eventName, eventCallback, eventUserData) {
		const _eventData = new EventRegData(eventName, eventCallback, eventUserData);

		this.on(eventName, function (reqMetaData, reqPayload, respCallback) {

			const eventRegData = this;
			logger.info(reqMetaData._context, 'event received: [%s]', eventRegData.eventName);
			eventRegData.eventCallback(eventRegData.eventName, reqMetaData, reqPayload, respCallback);

		}.bind(_eventData));

		return _eventData;
	}
}

function serviceReqHandler(req, res) {

	const that = this;
	const config = that.service_processor.config;
	const reqPayload = req.body;
	const _mwContext = req._context;

	process.nextTick(function () {

		const reqMetaData = new RequestMetaData();
		reqMetaData.url = req.url;
		var reqURL = urlModule.parse(reqMetaData.url);
		reqMetaData.uriParams = queryStrModule.parse(reqURL.query);
		reqMetaData.method = req.method;
		reqMetaData.headers = req.headers;
		reqMetaData.params = req.params;
		reqMetaData.file = req.file;
		reqMetaData._context = req._context;
		reqMetaData.requestTimeout = config.listener.requestTimeout - 5;
		req._context = null;

		that.service_processor.emit(that.event, reqMetaData, reqPayload, function (err, respObj, respMetaData) {
			if (err) {
				const errRespObj = err;
				if (errRespObj.statusCode) {
					res.writeHead(errRespObj.statusCode, errRespObj.statusMessage);
				}

				if (errRespObj) {
					if (errRespObj instanceof Buffer) {
						res.end(errRespObj);
					} else {
						logger.debug(JSON.stringify(errRespObj));
						res.end(JSON.stringify(errRespObj, null, 4));
					}
				} else {
					res.end();
				}
				logger.debug(reqMetaData._context, 'response sent...');
				if (reqPayload && reqPayload.requestId)
					logger.debug(reqMetaData._context, 'requestId: ' + reqPayload.requestId);
			} else {
				if (respMetaData && respMetaData.headers) {
					for (var hdr in respMetaData.headers) {
						res.setHeader(hdr, respMetaData.headers[hdr]);
					}
				}

				let contents;

				if (respObj) {
					if (respObj instanceof Buffer) {
						contents = respObj;
					} else if (typeof respObj == 'string') {
						contents = respObj;
					} else {
						contents = JSON.stringify(respObj);
						contents = unidecode(contents);
						res.setHeader('Content-Type', 'application/json');
					}

					res.setHeader('Content-Length', contents.length);
				}

				if (respMetaData && respMetaData.statusCode) {
					res.writeHead(respMetaData.statusCode, respMetaData.statusMessage);
				}

				if (respObj) {
					res.end(contents);
					logger.debug(reqMetaData._context, 'response sent...');
					if (reqPayload && reqPayload.requestId)
						logger.debug(reqMetaData._context, 'requestId: ' + reqPayload.requestId);
				} else {

					if (false) {//if(respMetaData.filePath) {
						res.setHeader('Content-Type', 'application/octet-stream');
						res.download(respMetaData.filePath, respMetaData.fileName);
					} else {
						res.end();
					}
				}
			}
		});
	});

	res.setTimeout(config.listener.requestTimeout * 1000, function () {
		const errRespObj = {};
		errRespObj.statusCode = 20001;
		logger.error(_mwContext, 'req-timeout, response ', JSON.stringify(errRespObj, null, 4));
		const contents = JSON.stringify(errRespObj, null, 4);
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Length', contents.length);
		res.writeHead(408);
		res.end(contents);
	});
}

class ServiceReqData {

	constructor(service_processor, uri, event, method) {
		if (!(this instanceof ServiceReqData)) {
			return (new ServiceReqData(uri, event, method));
		}

		this.service_processor = service_processor;
		this.uri = uri;
		this.event = event;
		this.method = method;
	}
}

class EventRegData {
	constructor(eventName, eventCallback, eventUserData) {
		if (!(this instanceof EventRegData)) {
			return (new EventRegData(eventName, eventCallback, eventUserData));
		}

		this.eventName = eventName;
		this.eventCallback = eventCallback;
		this.eventUserData = eventUserData;
		this.headers = { optional: {}, required: {} };
	}
}

class RequestMetaData {
	constructor() {
		if (!(this instanceof RequestMetaData)) {
			return (new RequestMetaData());
		}
	}

	getHTTPHeader(hdrName) {
		return (this.headers[hdrName] || this.headers[hdrName.toLowerCase()]);
	}
}

function initHTTPServer(app, listener) {

	const privateKey = fs.readFileSync(listener.tls.key);
	const certificate = fs.readFileSync(listener.tls.cert);
	const credentials = {
		key: privateKey,
		cert: certificate
	};

	const httpsServer = https.createServer(credentials, app);

	httpsServer.listen(listener.tls.port, listener.host, function () {
		if (listener.host) {
			logger.info(util.format('listening on [%s:%d]', listener.host, listener.port));
		} else {
			logger.info(util.format('listening on [%d]', listener.port));
		}
	}).on('error', function (err) {
		logger.error('' + err);
		if (err.code == 'EADDRNOTAVAIL' || err.code == 'EACCES' || err.code == 'EADDRINUSE') {
			process.exit(0);
		}
	});
}

function setHeaders(req, res, next) {

	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE, OPTIONS");
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-API-Key');

	if ('OPTIONS' === req.method) {
		res.sendStatus(200);
		res.end();
	} else {
		next();
	}
}

function initApiEndpoints(_config, that) {
	if (_config.apiEndpoints) {


		for (let key in _config.apiEndpoints) {

			let apiEndpoint = _config.apiEndpoints[key];

			if (apiEndpoint.controllers) {

				for (let controllerIndex = 0; controllerIndex < apiEndpoint.controllers.length; controllerIndex++) {

					let controller = apiEndpoint.controllers[controllerIndex];

					let path = controller.path;
					if (apiEndpoint.basePath) {
						path = pathModule.join(apiEndpoint.basePath, path);
					}
					const eventName = key + '.' + controller.name;
					that.app.get(path, serviceReqHandler.bind(new ServiceReqData(that, path, eventName + '.GET')));
					that.app.post(path, serviceReqHandler.bind(new ServiceReqData(that, path, eventName + '.POST')));
					that.app.put(path, serviceReqHandler.bind(new ServiceReqData(that, path, eventName + '.PUT')));
					that.app.patch(path, serviceReqHandler.bind(new ServiceReqData(that, path, eventName + '.PATCH')));
					that.app.delete(path, serviceReqHandler.bind(new ServiceReqData(that, path, eventName + '.DELETE')));
					logger.info('endpoint defined, uri [' + path + ']');
				}
			} else {

				for (let pathIndex = 0; pathIndex < apiEndpoint.paths.length; pathIndex++) {
					const path = apiEndpoint.paths[pathIndex];

					if (apiEndpoint.basePath) {
						path = pathModule.join(apiEndpoint.basePath, path);
					}

					const reqData = new ServiceReqData(that, path, key);
					that.app.get(path, serviceReqHandler.bind(reqData));
					that.app.post(path, serviceReqHandler.bind(reqData));
					that.app.put(path, serviceReqHandler.bind(reqData));
					that.app.delete(path, serviceReqHandler.bind(reqData));
					logger.info('endpoint defined, uri [' + path + ']');
				}
			}
		}
	}
}

function logMsg(req, res, next) {

	const reqURL = urlModule.parse(req.url);
	const uriParams = queryStrModule.parse(reqURL.query);
	logger.info(req._context, 'reqHeaders: ' + JSON.stringify(req.headers, null, 4));
	logger.debug(req._context, 'reqURL: ' + JSON.stringify(reqURL, null, 4));
	logger.debug(req._context, 'uriParams: ' + JSON.stringify(uriParams, null, 4));
	logger.debug(req._context, 'method: ' + req.method);
	logger.debug(req._context, 'params: ' + JSON.stringify(req.params, null, 4));

	if (req.body) {
		logger.debug(req._context, 'payload: ' + JSON.stringify(req.body, null, 4));
	}

	next();
}

util.inherits(ServiceProcess, EventEmitter);
module.exports.ServiceProcess = ServiceProcess;
