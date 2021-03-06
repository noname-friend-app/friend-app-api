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

    await prisma.user.create({
        data: {
            email,
            username,
            password: hash
        }
    })
    .then(user => {
        const token = generateToken(user);
        return res.status(201).send({
            message: 'User created successfully',
            user,
            token
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

    const token = generateToken(user);

    return res.status(200).send({
        message: 'User logged in successfully',
        user,
        token
    });
});

router.post('/check-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send({
            message: 'Please provide a token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id
            }
        });
        return res.status(200).send({
            message: 'Token is valid',
            user
        });
    } catch (err) {
        return res.status(400).send({
            message: 'Invalid token'
        });
    }

});

module.exports = router;