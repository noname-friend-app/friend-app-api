const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); //Logger for requests
require('dotenv').config();

const session = require("express-session");
const connectRedis = require("connect-redis");
const redis = require("redis");

const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

const app = express();

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(bodyParser.json());

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

app.use(morgan('dev')); 

// custom middlware

const auth = require('./routes/auth.js');
const profile = require('./routes/profile.js');
const groups = require('./routes/groups.js');

app.use(auth);
app.use(profile);
app.use(groups);

app.get('/', (req, res) => {
    res.send({
        'message': 'Hello World!',
        'docs': 'https://documenter.getpostman.com/view/18191261/UzBto4Zi',
        routes: [
            '/auth',
            '/profile',
            '/groups'
        ]
    });
});

const port = process.env.PORT || 80;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;