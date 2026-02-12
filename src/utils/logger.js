const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' 
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined
});

const httpLogger = pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    customSuccessMessage: (req, res, responseTime) => {
        return `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`;
    },
    customErrorMessage: (req, res, err) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },
    serializers: {
        req: () => undefined,
        res: () => undefined,
        responseTime: () => undefined
    }
});

module.exports = logger;
module.exports.httpLogger = httpLogger;
