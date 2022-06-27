const { Router } = require('express');

const router = Router();
const prisma = require('../utils/prisma');
const { getUser } = require('../utils/auth');
const { route } = require('./auth');

router.get('/profile', getUser, async (req, res) => {
    const profile = await prisma.profile.findFirst({
        where: {
            userId: req.user.id
        },
        include: {
            user: true
        }
    })

    // console.log(profile, !profile);

    if (!profile) {
        return res.status(404).send({
            message: 'Profile not found'
        });
    }

    return res.status(200).send({
        message: 'Profile found',
        profile
    });
});

router.post('/profile', getUser, async (req, res) => {
    const { name, bio, pronouns, birthday } = req.body;

    if (!name && !bio && !pronouns && !birthday) {
        return res.status(400).send({
            message: 'Please provide name, bio, pronouns, and birthday'
        });
    }

    let dateBirthday = new Date(birthday);

    const profile = await prisma.profile.create({
        data: {
            name,
            bio,
            pronouns,
            birthday: dateBirthday,
            userId: req.user.id
        },
        include: {
            user: true
        }
    })
    .catch(err => {
        console.log('Error creating profile: ', err);
        return res.status(400).send({
            message: 'Error creating profile'
        });
    });

    return res.status(201).send({
        message: 'Profile created successfully',
        profile
    });

});

router.put('/profile', getUser, async (req, res) => {
    const { name, bio, pronouns, birthday } = req.body;

    if (!name && !bio && !pronouns && !birthday) {
        return res.status(400).send({
            message: 'Please provide name, bio, pronouns, and birthday'
        });
    }

    let dateBirthday = new Date(birthday);

    const profile = await prisma.profile.update({
        where: {
            userId: req.user.id
        },
        data: {
            name,
            bio,
            pronouns,
            birthday: dateBirthday
        }
    })
    .catch(err => {
        console.log('Error updating profile: ', err);
        return res.status(400).send({
            message: 'Error updating profile'
        });
    });

    return res.status(200).send({
        message: 'Profile updated successfully',
        profile
    });
});
module.exports = router;