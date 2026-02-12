const prisma = require('../../utils/prisma');

const createComment = async (req, res) => {
    const { groupId, quoteId } = req.params;
    const { text } = req.body;

    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    });

    if (!group) {
        return res.status(404).send({
            message: 'Group not found'
        });
    }

    if (!text) {
        return res.status(400).send({
            message: 'Please provide text'
        });
    }

    const quote = await prisma.quote.findFirst({
        where: {
            id: quoteId
        }
    });

    if (!quote) {
        return res.status(404).send({
            message: 'Quote not found'
        });
    }

    const comment = await prisma.quoteComments.create({
        data: {
            text,
            quoteId,
            profileId: req.user.profile.id
        }
    });

    return res.status(200).send({
        message: 'Comment created',
        comment: comment
    });
};

module.exports = createComment;