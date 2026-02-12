const getQuotes = require('./get-quotes');
const createQuote = require('./create-quote');
const getComments = require('./get-comments');
const createComment = require('./create-comment');
const updateComment = require('./update-comment');
const deleteComment = require('./delete-comment');

module.exports = {
    getQuotes,
    createQuote,
    getComments,
    createComment,
    updateComment,
    deleteComment
};