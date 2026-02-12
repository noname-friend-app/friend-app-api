const prisma = require('../../utils/prisma');

const getComments = async (req, res) => {
    const { groupId, quoteId } = req.params;

    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    });

    if (!group) {
        console.log('group not found');
        return res.status(404).send({
            message: 'Group not found'
        });
    }

    const quote = await prisma.quote.findFirst({
        where: {
            id: quoteId
        },
    });

    if (!quote) {
        console.log('quote not found');
        return res.status(404).send({
            message: 'Quote not found'
        });
    }

    const comments = await prisma.quoteComments.findMany({
        where: {
            quoteId
        },
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
            }
        }
    });
    
    return res.status(200).send({
        quote: quote,
        comments: comments
    });
};

module.exports = getComments;