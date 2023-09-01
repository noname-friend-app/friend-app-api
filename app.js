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

app.use(morgan('dev')); 

// custom middlware

const auth = require('./routes/auth.js');
const profile = require('./routes/profile.js');
const groups = require('./routes/groups.js');
const social = require('./routes/social.js');

app.use(auth);
app.use(profile);
app.use(groups);
app.use(social);

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