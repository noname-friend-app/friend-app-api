const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { checkForGroup } = require('../middleware/lists');
const listsController = require('../controllers/lists');

const router = express.Router();

// Lists
router.get('/group/:groupId/lists', requireAuth, checkForGroup, listsController.getLists);
router.post('/group/:groupId/list', requireAuth, checkForGroup, listsController.createList);
router.put('/group/:groupId/list/:listId', requireAuth, checkForGroup, listsController.updateList);
router.delete('/group/:groupId/list/:listId', requireAuth, checkForGroup, listsController.deleteList);

// List items
router.post('/group/:groupId/list/:listId/item', requireAuth, checkForGroup, listsController.createListItem);
router.get('/group/:groupId/list/:listId/items', requireAuth, checkForGroup, listsController.getListItems);
router.put('/group/:groupId/list/:listId/item/:itemId', requireAuth, checkForGroup, listsController.updateListItem);
router.delete('/group/:groupId/list/:listId/item/:itemId', requireAuth, checkForGroup, listsController.deleteListItem);

// Toggle complete
router.put('/list/:listId/item/:itemId/complete', requireAuth, listsController.toggleItemComplete);
router.put('/list/:listId/complete', requireAuth, listsController.toggleListComplete);

module.exports = router;