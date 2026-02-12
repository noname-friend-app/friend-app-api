const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const socialController = require('../controllers/social');

const router = Router();

// Quotes
router.get('/group/:groupId/quotes', requireAuth, socialController.getQuotes);
router.post('/group/:groupId/quotes', requireAuth, socialController.createQuote);

// Comments
router.get('/group/:groupId/quotes/:quoteId/comments', requireAuth, socialController.getComments);
router.post('/group/:groupId/quotes/:quoteId/comments', requireAuth, socialController.createComment);
router.put('/group/:groupId/quotes/:quoteId/comments/:commentId', requireAuth, socialController.updateComment);
router.delete('/group/:groupId/quotes/:quoteId/comments/:commentId', requireAuth, socialController.deleteComment);

module.exports = router;