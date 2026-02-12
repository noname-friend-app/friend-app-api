const { generateHash } = require('../../utils/auth');
const prisma = require('../../utils/prisma');

const signup = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).send({
            message: 'Please provide email, username and password'
        });
    }

    const hash = await generateHash(password);

    const usernameExists = await prisma.user.findUnique({ where: {username} });
    if (usernameExists) {
        return res.status(400).send({
            message: 'Username already exists'
        });
    }

    const emailExists = await prisma.user.findUnique({ where: {email} });
    if (emailExists) {
        return res.status(400).send({
            message: 'Email already exists'
        });
    }

    let user;
    try {
        user = await prisma.user.create({
            data: {
                email,
                username,
                password: hash
            }, select: {
                id: true,
                email: true,
                username: true
            }
        });
    } catch (err) {
        return res.status(400).send({
            message: 'Email or username already exists'
        });
    }

    req.session.user = user;
    return res.status(201).send({
        message: 'User created successfully',
        user
    });
};

module.exports = signup;
