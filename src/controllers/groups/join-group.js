const prisma = require('../../utils/prisma');

const joinGroup = async (req, res) => {
    if (!req.body.joinCode) {
        return res.status(400).send({
            'message': 'Join code (joinCode) is required'
        });
    }

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
            profileId: req.user.profile.id,
            groupId: group.id
        }
    });

    if (foundMember) {
        return res.status(400).send({
            'message': 'You are already a member of this group',
            'role': foundMember.role
        });
    }

    const groupMember = await prisma.groupMember.create({
        data: {
            role: 'member',
            profileId: req.user.profile.id,
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
        'message': 'Group joined',
        'group': group,
        'member': groupMember
    });
};

module.exports = joinGroup;