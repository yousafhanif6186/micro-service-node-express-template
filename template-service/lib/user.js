'use strict';

const LOG_CATEGORY = 'TELEGRAM_USER_MANAGEMENT';
const logger = require('logger').getDefaultLogger(LOG_CATEGORY);
const moduleContext = {};

module.exports.init = function (confHandler, serviveEventProcessor) {

    const serviceConf = confHandler.serviceConf;
    moduleContext.serviceConf = serviceConf;

    serviveEventProcessor.register('users.collection.GET', handleGetUser);
    serviveEventProcessor.register('users.collection.POST', handleSetUser);
    serviveEventProcessor.register('users.instance.GET', handleGetUserById);
    serviveEventProcessor.register('users.instance.PUT', handleUpdateUser);
    serviveEventProcessor.register('users.instance.DELETE', handleDelUser);
}

async function handleGetUser(controllerName, reqData, payload, callback) {
    try {
        logger.info(payload, "payload: ");
        logger.info(reqData, "reqData: ");
        logger.info(controllerName, "controllerName: ");
        const response = { statusCode: 0 };
        callback(undefined, response);
    } catch (err) {

        const errObj = {
            statusCode: 500,
            statusMessage: error.message
        };
        logger.error(error);
        callback(errObj, undefined, undefined);
    }
}

async function handleSetUser(controllerName, reqData, payload, callback) {
    try {
        logger.info(payload, "payload: ");
        logger.info(reqData, "reqData: ");
        logger.info(controllerName, "controllerName: ");
        const response = { statusCode: 0 };
        callback(undefined, response);
    } catch (err) {

        const errObj = {
            statusCode: 500,
            statusMessage: error.message
        };
        logger.error(error);
        callback(errObj, undefined, undefined);
    }
}

async function handleGetUserById(controllerName, reqData, payload, callback) {
    try {
        logger.info(payload, "payload: ");
        logger.info(reqData, "reqData: ");
        logger.info(controllerName, "controllerName: ");
        const response = { statusCode: 0 };
        callback(undefined, response);
    } catch (err) {

        const errObj = {
            statusCode: 500,
            statusMessage: error.message
        };
        logger.error(error);
        callback(errObj, undefined, undefined);
    }
}

async function handleUpdateUser(controllerName, reqData, payload, callback) {
    try {
        logger.info(payload, "payload: ");
        logger.info(reqData, "reqData: ");
        logger.info(controllerName, "controllerName: ");
        const response = { statusCode: 0 };
        callback(undefined, response);
    } catch (err) {

        const errObj = {
            statusCode: 500,
            statusMessage: error.message
        };
        logger.error(error);
        callback(errObj, undefined, undefined);
    }
}

async function handleDelUser(controllerName, reqData, payload, callback) {
    try {
        logger.info(payload, "payload: ");
        logger.info(reqData, "reqData: ");
        logger.info(controllerName, "controllerName: ");
        const response = { statusCode: 0 };
        callback(undefined, response);
    } catch (err) {

        const errObj = {
            statusCode: 500,
            statusMessage: error.message
        };
        logger.error(error);
        callback(errObj, undefined, undefined);
    }
}

