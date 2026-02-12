const express = require('express');
const { requireAuth } = require('../middleware/auth');
const groupsController = require('../controllers/groups');

const router = express.Router();

router.post('/groups/new', requireAuth, groupsController.createGroup);
router.get('/groups/joined', requireAuth, groupsController.getJoinedGroups);
router.get('/groups/:id', groupsController.getGroupById);
router.post('/groups/join', requireAuth, groupsController.joinGroup);
router.put('/groups/:id/edit', requireAuth, groupsController.editGroup);
router.delete('/groups/:id/delete', requireAuth, groupsController.deleteGroup);

module.exports = router;