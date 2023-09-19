const express = require('express');
const { requireAuth } = require('../utils/auth');

const router = express.Router();
const prisma = require('../utils/prisma');

// extra auth middleware to check if user is in group

const checkForGroup = async (req, res, next) => {
    const { groupId } = req.params;
    const group = await prisma.group.findUnique({ 
        where: { 
            id: groupId 
        },
        include: {
            members: {
                select: {
                    profile: true
                }
            }
        }
    });

    if (!group) {
        return res.status(404).send({
            message: 'Group not found'
        });
    }

    console.log(group);

    // check if user is in group
    const userInGroup = group.members.find(member => member.profile.id === req.user.profile.id);
    if (!userInGroup) {
        return res.status(401).send({
            message: 'You are not in this group'
        });
    }

    req.group = group;
    
    next();
};

router.get('/group/:groupId/lists', requireAuth, checkForGroup, async (req, res) => {
    
    const lists = await prisma.list.findMany({
        where: {
            groupId: req.group.id
        },
        include: {
            listItems: true
        }
    })

    return res.status(200).send({
        lists,
        group: req.group
    })
});

router.post('/group/:groupId/list', requireAuth, checkForGroup, async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send({
            message: "please provide name"
        })
    }

    const list = await prisma.list.create({
        data: {
            name: name,
            profileId: req.session.user.profile.id,
            groupId: req.group.id
        }
    });

    return res.status(200).send({
        message: "list created",
        list: list
    });
});

router.put('/group/:groupId/list/:listId', requireAuth, checkForGroup, async (req, res) => {
    const { listId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).send({
            message: "please provide name"
        })
    }

    const list = await prisma.list.update({
        where: {
            id: listId
        },
        data: {
            name: name
        }
    });

    return res.status(200).send({
        message: "list updated",
        list: list
    });

});

router.delete('/group/:groupId/list/:listId', requireAuth, checkForGroup, async (req, res) => {
    const { listId } = req.params;

    const list = await prisma.list.delete({
        where: {
            id: listId
        }
    });

    return res.status(200).send({
        message: "list deleted",
        list: list
    });
});

// list items

router.post('/group/:groupId/list/:listId/item', requireAuth, checkForGroup, async (req, res) => {
    const { listId } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).send({
            message: "please provide text"
        })
    }

    const listItem = await prisma.listItem.create({
        data: {
            text: text,
            listId: listId
        }
    });

    return res.status(200).send({
        message: "list item created",
        listItem: listItem
    });
});

router.get('/group/:groupId/list/:listId/items', requireAuth, checkForGroup, async (req, res) => {
    const { listId } = req.params;

    const listItems = await prisma.listItem.findMany({
        where: {
            listId: listId
        }
    });

    return res.status(200).send({
        message: "list items found",
        listItems: listItems
    });
});

router.put('/group/:groupId/list/:listId/item/:itemId', requireAuth, checkForGroup, async (req, res) => {
    const { listId, itemId } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).send({
            message: "please provide text"
        })
    }

    const listItem = await prisma.listItem.update({
        where: {
            id: itemId
        },
        data: {
            text: text
        }
    });

    return res.status(200).send({
        message: "list item updated",
        listItem: listItem
    });
});

router.delete('/group/:groupId/list/:listId/item/:itemId', requireAuth, checkForGroup, async (req, res) => {
    const { listId, itemId } = req.params;

    const listItem = await prisma.listItem.delete({
        where: {
            id: itemId
        }
    });

    return res.status(200).send({
        message: "list item deleted",
        listItem: listItem
    });
});

// toggle item complete
router.put('/list/:listId/item/:itemId/complete', requireAuth, async (req, res) => {
    const { listId, itemId } = req.params;
    const { checked } = req.body;

    const item = await prisma.listItem.findFirst({
        where: {
            id: itemId
        }
    });

    if (!item) {
        return res.status(404).send({
            message: "item not found"
        })
    }

    if (checked != true && checked != false) {
        return res.status(400).send({
            message: "please provide checked (true or false)"
        })
    }

    const listItem = await prisma.listItem.update({
        where: {
            id: itemId
        },
        data: {
            checked: checked
        }
    });

    return res.status(200).send({
        message: "list item updated",
        listItem: listItem
    });
});


module.exports = router;