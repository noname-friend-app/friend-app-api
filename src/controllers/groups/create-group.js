const prisma = require('../../utils/prisma');
const { newGroupCode } = require('../../utils/groups');

const createGroup = async (req, res) => {
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
    
    let group;
    try {
        group = await prisma.group.create({
            data: {
                name: req.body.name,
                description: req.body.description,
                joinCode: groupCode,
                groupImageUrl: req.body.groupImageUrl
            }
        });
    } catch (err) {
        // if it is a PrismaClientKnownRequestError, then the group already exists
        if (err.name === 'PrismaClientKnownRequestError') {
            return res.status(400).send({
                'message': 'Group already exists'
            });
        } else {
            return res.status(500).send({
                'message': 'Internal server error creating group'
            });
        }
    }
    
    let newMember;
    try {
        newMember = await prisma.groupMember.create({
            data: {
                role: 'owner',
                profileId: req.user.profile.id,
                groupId: group.id
            }
        });
    } catch (err) {
        return res.status(500).send({
            'message': 'Internal server error creating member' 
        });
    }

    return res.status(200).send({
        'message': 'Group created',
        'group': group,
        'member': newMember
    });
};

module.exports = createGroup;
