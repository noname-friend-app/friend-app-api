const prisma = require('../../utils/prisma');

const editGroup = async (req, res) => {
    const id = req.params.id;
    
    const foundMember = await prisma.groupMember.findFirst({
        where: {
            profile: req.user.profile,
            groupId: id
        }
    })
    .catch(err => {
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
        return res.status(500).send({
            'message': 'Internal server error'
        });
    });

    return res.status(200).send({
        'message': 'Group updated',
        'group': group
    });
};

module.exports = editGroup;