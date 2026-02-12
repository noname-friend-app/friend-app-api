const prisma = require('../../utils/prisma');

const getProfile = async (req, res) => {
    const profile = await prisma.profile.findFirst({
        where: {
            userId: req.user.id
        },
        include: {
            user: true
        }
    });

    if (!profile) {
        return res.status(404).send({
            message: 'Profile not found'
        });
    }

    return res.status(200).send({
        message: 'Profile found',
        profile
    });
};

module.exports = getProfile;