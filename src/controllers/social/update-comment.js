const prisma = require('../../utils/prisma');

const updateComment = async (req, res) => {
    const quoteId = req.params.quoteId;
    const commentId = req.params.commentId;
    const { text } = req.body;

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

    const comment = await prisma.quoteComments.findFirst({
        where: {
            id: commentId
        }
    });

    if (!comment) {
        return res.status(404).send({
            message: 'Comment not found'
        });
    }

    const updatedComment = await prisma.quoteComments.update({
        where: {
            id: commentId
        },
        data: {
            text
        }
    });

    return res.status(200).send({
        message: 'Comment updated',
        comment: updatedComment
    });
};

module.exports = updateComment;