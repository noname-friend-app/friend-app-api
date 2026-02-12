const signup = require('./signup');
const login = require('./login');
const logout = require('./logout');
const checkSession = require('./check-session');
const changePassword = require('./change-password');
const changeEmail = require('./change-email');

module.exports = { signup, login, logout, checkSession, changePassword, changeEmail };