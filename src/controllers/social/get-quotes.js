const prisma = require('../../utils/prisma');

const getQuotes = async (req, res) => {
    const groupId = req.params.groupId;
    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        },
        include: {
            quotes: {
                include: {
                    profile: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    email: true,
                                }
                            }
                        }
                    },
                    comments: {
                        include: {
                            profile: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            username: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    }
                }
            }
        }
    });

    if (!group) {
        return res.status(404).send({
            message: 'Group not found'
        });
    }

    const quotes = group.quotes;

    return res.status(200).send({
        message: 'Quotes retrieved',
        quotes: quotes,
        group: group
    });
};

module.exports = getQuotes;