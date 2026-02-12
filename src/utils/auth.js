const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const generateHash = async (password) => {
    return bcrypt.hash(password, 10);
}

const isValidPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
}

module.exports = { generateToken, generateHash, isValidPassword };