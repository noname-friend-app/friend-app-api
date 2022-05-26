const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

const auth = require('./routes/auth.js');

app.use(auth);

app.get('/', (req, res) => {
    res.send({'message': 'Hello World!'});
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});