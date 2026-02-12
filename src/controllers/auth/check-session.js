const prisma = require('../../utils/prisma');

const checkSession = async (req, res) => {
    if (!req.session.user) {
        return res.status(400).send({
            message: 'No user is logged in'
        });
    }

    const foundUser = await prisma.user.findFirst({
        where: {
            id: req.session.user.id
        }, select: {
            id: true,
            email: true,
            username: true,
            profile: true
        }
    });

    return res.status(200).send({
        message: 'User is logged in',
        user: foundUser
    });
};

module.exports = checkSession;