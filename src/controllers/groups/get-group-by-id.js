const prisma = require('../../utils/prisma');

const getGroupById = async (req, res) => {
    let group;
    try {
        group = await prisma.group.findFirst({
            where: {
                id: req.params.id
            },
            include: {
                members: {
                    include: {
                        profile: {
                            select: {
                                id: true,
                                name: true,
                                bio: true,
                                pronouns: true,
                                birthday: true,
                                user: {
                                    select: {
                                        id: true,
                                        username: true,
                                        email: true,
                                    }
                                }
                            },
                        }
                    }
                }
            }
        });
    } catch (err) {
        return res.status(500).send({
            'message': 'Internal server error'
        });
    }

    if (!group) {
        return res.status(404).send({
            'message': 'Group not found'
        });
    }

    return res.status(200).send({
        'message': 'Group retrieved',
        'group': group
    });
};

module.exports = getGroupById;
