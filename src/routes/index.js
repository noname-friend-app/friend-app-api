const express = require('express');

const auth = require('./auth');
const profile = require('./profile');
const groups = require('./groups');
const social = require('./social');
const lists = require('./lists');

const router = express.Router();

router.use(auth);
router.use(profile);
router.use(groups);
router.use(social);
router.use(lists);

module.exports = router;
