const { Router } = require('express');

const profileController = require('../controllers/profile');
const { requireAuth, requireAuthNoProfile } = require('../middleware/auth');

const router = Router();

router.get('/profile', requireAuth, profileController.getProfile);
router.post('/profile', requireAuthNoProfile, profileController.createProfile);
router.put('/profile', requireAuth, profileController.updateProfile);

module.exports = router;