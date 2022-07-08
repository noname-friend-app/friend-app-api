const express = require('express');

const prisma = require('../utils/prisma');
const { getUser } = require('../utils/auth');
const { newGroupCode } = require('../utils/groups');
const { route } = require('./auth');

const router = express.Router();

/**
 * Create a new group x
 * Get joined Groups x
 * Get Group by id x
 * Join a group x
 * Edit a group x
 * Delete a group 
 * Remove User from group
 * Get group info
 * Get group members
 * promote or demote users
 */

// create groups
router.post('/groups/new', getUser, async (req, res) => {
    if (!req.body.name || !req.body.description) {
        return res.status(400).send({
            'message': 'Name and description are required'
        });
    }

    let groupCode = newGroupCode();
    while (await prisma.group.findFirst({ where: { joinCode: groupCode } })) {
        groupCode = newGroupCode();
    }
    
    const group = await prisma.group.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            joinCode: groupCode,
            groupImageUrl: req.body.groupImageUrl
        }
    })
    .catch(err => {
        console.log(err);
        // if it is a PrismaClientKnownRequestError, then the group already exists
        if (err.name === 'PrismaClientKnownRequestError') {
            return res.status(400).send({
                'message': 'Group already exists'
            });
        } else {
            return res.status(500).send({
                'message': 'Internal server error'
            });
        }
    })

    const newMember = await prisma.groupMember.create({
        data: {
            role: 'owner',
            userId: req.user.id,
            groupId: group.id
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    return res.status(200).send({
        'message': 'Group created',
        'group': group,
        'member': newMember
    });
});

// get joined groups
router.get('/groups/joined', getUser, async (req, res) => {
    const groupProfiles = await prisma.groupMember.findMany({
        where: {
            userId: req.user.id
        },
        include: {
            group: true
        }
    });

    let groups = [];
    groupProfiles.forEach(groupProfile => {
        groups.push(groupProfile.group);
    })

    return res.status(200).send({
        message: 'Groups retrieved',
        groups: groups,
        user: req.user
    });

});

// get group by id
router.get('/groups/:id', async (req, res) => {
    const group = await prisma.group.findFirst({
        where: {
            id: req.params.id
        },
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    if (!group) {
        return res.status(404).send({
            'message': 'Group not found'
        });
    }

    return res.status(200).send({
        'message': 'Group retrieved',
        'group': group
    });
});

// join a group
router.post('/groups/join', getUser, async (req, res) => {
    if (!req.body.joinCode) {
        return res.status(400).send({
            'message': 'Join code is required'
        });
    }

    const group = await prisma.Group.findFirst({
        where: {
            joinCode: req.joinCode
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    if (!group) {
        return res.status(404).send({
            'message': 'Group not found'
        });
    }

    const member = await prisma.Member.findFirst({
        where: {
            userId: req.user.id,
            groupId: group.id
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    if (member) {
        return res.status(400).send({
            'message': 'You are already a member of this group'
        });
    }

    const newMember = await prisma.Member.create({
        data: {
            role: 'member',
            userId: req.user.id,
            groupId: group.id
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    return res.status(200).send({
        'message': 'You have joined the group',
        'group': group,
        'member': newMember
    });
});

// edit a group
router.put('/groups/:id/edit', getUser, async (req, res) => {
    const id = req.params.id;
    
    const foundMember = await prisma.groupMember.findFirst({
        where: {
            userId: req.user.id,
            groupId: id
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    if (!foundMember) {
        return res.status(404).send({
            message: 'You are not a member of this group'
        });
    }

    if (foundMember.role !== 'owner') {
        return res.status(403).send({
            'message': 'You are not the owner of this group'
        });
    }

    const group = await prisma.group.update({
        where: {
            id: id
        },
        data: req.body
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    return res.status(200).send({
        'message': 'Group updated',
        'group': group
    });
});

// delete a group (owner only)
router.delete('/groups/:id/delete', getUser, async (req, res) => {
    const id = req.params.id;
    
    const foundMember = await prisma.groupMember.findFirst({
        where: {
            userId: req.user.id,
            groupId: id
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    if (!foundMember) {
        return res.status(404).send({
            message: 'You are not a member of this group'
        });
    }

    if (foundMember.role !== 'owner') {
        return res.status(403).send({
            'message': 'You are not the owner of this group'
        });
    }

    const group = await prisma.group.delete({
        where: {
            id: id
        }
    })
    .catch(err => {
        console.log(err);
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    return res.status(200).send({
        'message': 'Group deleted',
        'group': group
    });
});


module.exports = router;