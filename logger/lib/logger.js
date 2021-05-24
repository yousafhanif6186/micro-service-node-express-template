'use strict';

const pino = require('pino');
const pinoms = require('pino-multi-stream');
const pinoPretty = require('pino-pretty');
const childProcess = require('child_process');
const stream = require('stream');
const cwd = process.cwd();
const { env } = process;

let defaultLogger;

const initDefaultLogger = function (loggerConf) {
	if (!defaultLogger) {
		defaultLogger = createLogger(loggerConf);
	}

	return defaultLogger;
};

const createLogger = function (loggerConf) {

	const fileLogLevel = (loggerConf.console.level && loggerConf.console.level.length > 0) ?
		loggerConf.console.level : 'debug';

	let logpath = loggerConf.file.logpath || 'logs/';

	const defaultPrettyOptions = loggerConf.console.prettyOptions;

	const prettyOptions = {
		colorize: defaultPrettyOptions.colorize || true,
		messageFormat: '{filename}: {msg}',
		translateTime: defaultPrettyOptions.translateTime || "yyyy-dd-mm, h:MM:ss TT", // add 'time format' to remove timestamp
		ignore: defaultPrettyOptions.ignore || "hostname,pid,filename"
	};

	const logThrough = new stream.PassThrough();

	const prettyStream = pinoms.prettyStream(
		{
			prettyPrint: prettyOptions,
			prettifier: pinoPretty
		}
	);

	const streams = [];

	if (loggerConf.file.enable) {
		streams.push({ stream: logThrough });
	}

	if (loggerConf.console.enable) {
		streams.push({ stream: prettyStream });
	}

	// Create a logging instance
	const logger = pino({
		level: fileLogLevel,
	}, pinoms.multistream(streams));

	if (loggerConf.file.enable) {
		const child = childProcess.spawn(process.execPath, [
			require.resolve('pino-tee'),
			'error', `${logpath}/output`,
			'info', `${logpath}/output`
		], { cwd, env });

		logThrough.pipe(child.stdin);
	}

	logger.info('logger initialized...');

	process.on('uncaughtException', pino.final(logger, (err, finalLogger) => {
		finalLogger.error(err, 'uncaughtException')
		process.exit(1)
	}));

	process.on('unhandledRejection', pino.final(logger, (err, finalLogger) => {
		finalLogger.error(err, 'unhandledRejection')
		process.exit(1)
	}));

	return logger;
};

const getDefaultLogger = function (LOG_CATEGORY) {
	if (!defaultLogger) {
		throw new Error('no default logger found, first initialze the default logger');
	}

	if (LOG_CATEGORY) {
		return defaultLogger.child({ filename: LOG_CATEGORY });
	}
	return defaultLogger;
};

module.exports.initDefaultLogger = initDefaultLogger;
module.exports.getDefaultLogger = getDefaultLogger;
