const prisma = require('../../utils/prisma');

const deleteComment = async (req, res) => {
    const quoteId = req.params.quoteId;
    const commentId = req.params.commentId;

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

    await prisma.quoteComments.delete({
        where: {
            id: commentId
        }
    });

    return res.status(200).send({
        message: 'Comment deleted'
    });
};

module.exports = deleteComment;