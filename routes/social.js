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

module.exports = router;