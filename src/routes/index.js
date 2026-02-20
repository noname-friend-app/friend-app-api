const express = require('express');

const auth = require('./routes/auth.js');
const profile = require('./routes/profile.js');
const groups = require('./routes/groups.js');
const social = require('./routes/social.js');
const lists = require('./routes/lists.js');

const router = express.Router();

router.use(auth);
router.use(profile);
router.use(groups);
router.use(social);
router.use(lists);

module.exports = router;
