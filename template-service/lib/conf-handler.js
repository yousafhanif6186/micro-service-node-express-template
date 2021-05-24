'use strict';
const fs = require('fs');
let confFile = 'conf/serviceConf.json';
let confHandler;

module.exports.initConfHandler = function () {
	if (!confHandler) {
		confHandler = {};
		confHandler.serviceConf = JSON.parse(fs.readFileSync(confFile));
	}
	return confHandler;
};

module.exports.getConfHandler = function () {
	if (!confHandler) {
		throw new Error('config not initialized, first initialize by calling initConfHandler()...');
	}
	return confHandler;
};

module.exports.readConfFile = function () {
	const _confHandler = {};
	_confHandler.serviceConf = JSON.parse(fs.readFileSync(confFile));
	return _confHandler;
};
