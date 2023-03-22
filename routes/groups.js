const express = require('express');

const prisma = require('../utils/prisma');
const { requireAuth } = require('../utils/auth');
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
router.post('/groups/new', requireAuth, async (req, res) => {
    if (!req.body.name || !req.body.description) {
        return res.status(400).send({
            'message': 'Name and description are required'
        });
    }

    let groupCode = newGroupCode();
    while (await prisma.group.findFirst({ where: { joinCode: groupCode } })) {
        groupCode = newGroupCode();
    }

    // see if group already exists with separate query
    const groupExists = await prisma.group.findFirst({
        where: {
            name: req.body.name
        }
    });

    if (groupExists) {
        return res.status(400).send({
            'message': 'Group already exists'
        });
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
router.get('/groups/joined', requireAuth, async (req, res) => {
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
                    user: {
                        select: {
                            username: true,
                            email: true,
                            profile: {
                                select: {
                                    id: true,
                                    name: true,
                                    bio: true,
                                    pronouns: true,
                                    birthday: true
                                }
                            }
                        },
                    }
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
router.post('/groups/join', requireAuth, async (req, res) => {
    if (!req.body.joinCode) {
        return res.status(400).send({
            'message': 'Join code (joinCode) is required'
        });
    }

    // console.log(req.body.joinCode);

    const group = await prisma.group.findFirst({
        where: {
            joinCode: req.body.joinCode
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

    const foundMember = await prisma.groupMember.findFirst({
        where: {
            userId: req.user.id,
            groupId: group.id
        }
    });
    // console.log('foundMember ', foundMember);

    if (foundMember) {
        // console.log('point')
        return res.status(400).send({
            'message': 'You are already a member of this group',
            'role': foundMember.role
        });
    }

    
    const groupMember = await prisma.groupMember.create({
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
    })

    return res.status(200).send({
        'message': 'Group joined',
        'group': group,
        'member': groupMember
    });
});

// edit a group
router.put('/groups/:id/edit', requireAuth, async (req, res) => {
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
router.delete('/groups/:id/delete', requireAuth, async (req, res) => {
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