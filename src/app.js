const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./utils/logger');
const { httpLogger } = require('./utils/logger');
require('dotenv').config();

const session = require("express-session");
const connectRedis = require("connect-redis");
const redis = require("redis");

const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server refused connection');
            return new Error('Redis server refused connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            logger.warn('Redis max retry attempts reached, will keep trying with backoff');
        }
        // Reconnect after increasing delay (max 30 seconds)
        return Math.min(options.attempt * 1000, 30000);
    }
});

redisClient.on('error', (err) => {
    logger.error('Redis error:', err.message);
});

redisClient.on('connect', () => {
    logger.info('Redis connected');
});

redisClient.on('reconnecting', () => {
    logger.info('Redis reconnecting');
});

redisClient.on('end', () => {
    logger.warn('Redis connection closed');
});

const app = express();

var validIps = ['https://dev.doink.otterlabs.co', 'https://doink.otterlabs.co']
if (process.env.NODE_ENV === 'development') {
    validIps = ['http://localhost:3000']
}

app.use(cors({
    origin: validIps,
    credentials: true
}));
app.use(bodyParser.json());

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static('static'));
app.use(httpLogger);

// custom middlware

const auth = require('./routes/auth.js');
const profile = require('./routes/profile.js');
const groups = require('./routes/groups.js');
const social = require('./routes/social.js');
const lists = require('./routes/lists.js');

app.use(auth);
app.use(profile);
app.use(groups);
app.use(social);
app.use(lists);

app.get('/', (req, res) => {
    res.send({
        'message': 'Hello World!',
        'docs': 'https://documenter.getpostman.com/view/18191261/UzBto4Zi',
        routes: [
            '/auth',
            '/profile',
            '/groups',
            '/social',
            '/lists'
        ]
    });
});

const port = process.env.PORT || 80;
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

module.exports = app;