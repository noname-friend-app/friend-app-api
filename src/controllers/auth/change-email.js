const prisma = require('../../utils/prisma');

const changeEmail = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).send({
            message: 'Please provide email'
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            id: req.session.user.id
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

    const emailExists = await prisma.user.findUnique({ where: {email} });
    if (emailExists && emailExists.id !== user.id) {
        return res.status(400).send({
            message: 'Email already exists on another account'
        });
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            email: email
        },
        select: {
            id: true,
            email: true,
            username: true,
            profile: true
        }
    })
    .then(user => {
        return res.status(200).send({
            message: 'Email changed successfully',
            user
        });
    })
    .catch(err => {
        console.log('Error changing email: ', err);
        return res.status(500).send({
            message: 'Error changing email'
        });
    });
};

module.exports = changeEmail;