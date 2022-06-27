const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const getUser = async (req, res, next) => {
    // token: {id}
    // const token = req.headers
    // console.log(req.headers);
    if (!req.headers.authtoken) {
        return res.status(401).send({
            message: 'No token provided, set authtoken header'
        });
    }

    const token = req.headers.authtoken;

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return res.status(401).send({
            message: 'Invalid token, token expired'
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            id: decoded.id
        }
    });

    if (!user) {
        return res.status(401).send({
            message: 'Invalid token, user not found'
        });
    }

    req.user = user;
    
    next(); // continue to the next middleware
}

module.exports = { getUser };