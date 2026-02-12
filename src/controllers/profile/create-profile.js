const prisma = require('../../utils/prisma');

const createProfile = async (req, res) => {
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
        return res.status(400).send({
            message: 'Error creating profile'
        });
    });

    return res.status(201).send({
        message: 'Profile created successfully',
        profile
    });
};

module.exports = createProfile;