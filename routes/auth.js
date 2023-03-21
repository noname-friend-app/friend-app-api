const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Prisma } = require('@prisma/client')

const router = express.Router();
const prisma = require('../utils/prisma');

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const generateHash = async (password) => {
    return bcrypt.hash(password, 10);
}

router.post('/signup', async (req, res) => {
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

    await prisma.user.create({
        data: {
            email,
            username,
            password: hash
        }, select: {
            id: true,
            email: true,
            username: true
        }
    })
    .then(user => {
        req.session.user = user;
        return res.status(201).send({
            message: 'User created successfully',
            user
        });
    })
    .catch(err => {
        console.log('Error creating user: ', err);
        return res.status(400).send({
            message: 'Email or username already exists'
        });
    });
});

router.post('/login', async (req, res) => {
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

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return res.status(400).send({
            message: 'Incorrect password'
        });
    }

    // remove password from user object
    delete user.password;
    req.session.user = user;
    // console.log(req.session.user);

    return res.status(200).send({
        message: 'User logged in successfully',
        user
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy();
    return res.status(200).send({
        message: 'User logged out successfully'
    });
});

router.get('/check-session', async (req, res) => {
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
});

module.exports = router;