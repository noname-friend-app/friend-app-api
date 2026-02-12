const prisma = require('../../utils/prisma');
const { isValidPassword } = require('../../utils/auth');

const login = async (req, res) => {
    const { username, email, password } = req.body;

    if (!email && !username) {
        return res.status(400).send({
            message: 'Please provide email or username'
        });
    }

    if (!password) {
        return res.status(400).send({
            message: 'Please provide password'
        });
    }

    if (email) {
        const foundUser = await prisma.user.findUnique({ where: {email} });
        if (!foundUser) {
            return res.status(400).send({
                message: 'No user exists with that email'
            });
        }
    }

    if (username) {
        const foundUser = await prisma.user.findUnique({ where: {username} });
        if (!foundUser) {
            return res.status(400).send({
                message: 'No user exists with that username'
            });
        }
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }, select: {
            id: true,
            email: true,
            username: true,
            password: true,
            profile: true
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

    // remove password from user object
    delete user.password;
    req.session.user = user;

    return res.status(200).send({
        message: 'User logged in successfully',
        user
    });
}

module.exports = login;