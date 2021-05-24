'use strict';
const LOG_CATEGORY = 'TEMPLATE SERVICE';
const confHandler = require('./conf-handler').initConfHandler();
const parentLogger = require('logger').initDefaultLogger(confHandler.serviceConf.logging);
const logger = parentLogger.child({ filename: LOG_CATEGORY });
const serviveProcessModule = require('service-processor');
const userModule = require('./user');

initService();

function initService() {
    const serviveProcessor = new serviveProcessModule.ServiceProcess(confHandler.serviceConf);
    userModule.init(confHandler, serviveProcessor);
    logger.info("Server intialized..");
}

process.on('uncaughtException', function (err) {
    logger.error(err);
    logger.error(err.stack);
});

process.on('unhandledRejection', function (err) {
    logger.error(err);
    logger.error(err.stack);
});

process.on('SIGINT', function () {
    logger.info("process exit!");
    process.exit(0);
});
