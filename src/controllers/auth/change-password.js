const prisma = require('../../utils/prisma');
const { isValidPassword, generateHash } = require('../../utils/auth');

const changePassword = async (req, res) => {
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
        return res.status(400).send({
            message: 'Please provide password and new password'
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            id: req.session.user.id
        }, select: {
            id: true,
            email: true,
            username: true,
            password: true
        }
    });

    if (!user) {
        return res.status(400).send({
            message: 'No user exists with that email or username'
        });
    }

    const isValid = await isValidPassword(password, user.password);

    if (!isValid) {
        return res.status(400).send({
            message: 'Incorrect password'
        });
    }

    const hash = await generateHash(newPassword);

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            password: hash
        }
    })
    .catch(err => {
        return res.status(500).send({
            message: 'Error changing password'
        });
    });

    return res.status(200).send({
        message: 'Password changed successfully'
    });
};

module.exports = changePassword;