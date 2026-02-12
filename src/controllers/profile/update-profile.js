const prisma = require('../../utils/prisma');

const updateProfile = async (req, res) => {
    const { name, bio, pronouns, birthday } = req.body;

    if (!name && !bio && !pronouns && !birthday) {
        return res.status(400).send({
            message: 'Please provide name, bio, pronouns, and birthday'
        });
    }

    let dateBirthday = new Date(birthday);

    let profile;
    try {
        profile = await prisma.profile.update({
            where: {
                userId: req.user.id
            },
            data: {
                name,
                bio,
                pronouns,
                birthday: dateBirthday
            }
        });
    } catch (err) {
        return res.status(400).send({
            message: 'Error updating profile'
        });
    }

    return res.status(200).send({
        message: 'Profile updated successfully',
        profile
    });
};

module.exports = updateProfile;
