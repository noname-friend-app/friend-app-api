const express = require('express');

const authController = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/check-session', authController.checkSession);
router.put('/change-password', requireAuth, authController.changePassword);
router.put('/change-email', requireAuth, authController.changeEmail);
        
module.exports = router;