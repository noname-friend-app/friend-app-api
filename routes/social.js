const { Router } = require('express');

const router = Router();
const prisma = require('../utils/prisma');
const { requireAuth, requireAuthNoProfile } = require('../utils/auth');

router.get('/group/:groupId/quotes', requireAuth, async (req, res) => {
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

});

router.post('/group/:groupId/quotes', requireAuth, async (req, res) => {
    const groupId = req.params.groupId;
    const { text, saidAt } = req.body;

    if (!text || !saidAt) {
        return res.status(400).send({
            message: 'Please provide text and saidAt'
        });
    }

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

    const quote = await prisma.quote.create({
        data: {
            text,
            saidAt: new Date(saidAt),
            groupId,
            profileId: req.user.profile.id
        }
    });

    return res.status(200).send({
        message: 'Quote created',
        quote: quote
    });

});

// Comments

router.get('/group/:groupId/quote/:quoteId/comments', requireAuth, async (req, res) => {
    const quoteId = req.params.quoteId;
    const quote = await prisma.quote.findFirst({
        where: {
            id: quoteId
        },
    });

    if (!quote) {
        return res.status(404).send({
            message: 'Quote not found'
        });
    }

    const comments = await prisma.comment.findMany({
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

    return {
        quote: quote,
        comments: comments
    }
});

router.post('/group/:groupId/quote/:quoteId/comments', requireAuth, async (req, res) => {
    const quoteId = req.params.quoteId;
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

    const comment = await prisma.comment.create({
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
});

router.put('/group/:groupId/quote/:quoteId/comments/:commentId', requireAuth, async (req, res) => {
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

    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId
        }
    });

    if (!comment) {
        return res.status(404).send({
            message: 'Comment not found'
        });
    }

    const updatedComment = await prisma.comment.update({
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
});

router.delete('/group/:groupId/quote/:quoteId/comments/:commentId', requireAuth, async (req, res) => {
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

    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId
        }
    });

    if (!comment) {
        return res.status(404).send({
            message: 'Comment not found'
        });
    }

    await prisma.comment.delete({
        where: {
            id: commentId
        }
    });

    return res.status(200).send({
        message: 'Comment deleted'
    });
});

module.exports = router;