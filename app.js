const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

const auth = require('./routes/auth.js');
const profile = require('./routes/profile.js');

app.use(auth);
app.use(profile);

app.get('/', (req, res) => {
    res.send({
        'message': 'Hello World!',
        routes: [
            '/auth',
            '/profile'
        ]
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;