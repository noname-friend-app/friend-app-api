const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan'); //Logger for requests
const session = require('express-session');

require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*'
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
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

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;