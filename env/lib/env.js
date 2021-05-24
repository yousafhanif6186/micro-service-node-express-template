'use strict';

const path = require('path');
const servEnvPath = path.join(__dirname, '../vars/service.env');
const servEnv = require('dotenv').config({ path: servEnvPath });
const dotenvExpand = require('dotenv-expand');
dotenvExpand(servEnv);

const conf = {};
buildConf();
function buildConf() {
    conf.DB_CONF = buildDBConf();
}

function buildDBConf() {
    let dbconfig = {};
    if (process.env.DB_CLIENT) {
        dbconfig.client = process.env.DB_CLIENT;
        let connection = {};
        connection.host = process.env.DB_HOST;
        connection.port = parseInt(process.env.DB_PORT);
        connection.user = process.env.DB_USER;
        connection.password = process.env.DB_PASSWORD;
        connection.database = process.env.DB_NAME;
        dbconfig.connection = connection;

        let pool = {};
        pool.min = parseInt(process.env.DB_POOL_SIZE_MIN);
        pool.max = parseInt(process.env.DB_POOL_SIZE_MAX);
        dbconfig.pool = pool;
        dbconfig.acquireConnectionTimeout = parseInt(process.env.DB_CONN_TIMEOUT);

        return dbconfig;
    }
}

module.exports.getConf = function (confType) {
    return conf[confType];
}
