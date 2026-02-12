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

const requireAuth = async (req, res, next) => {
    /**
     * Adds user to req.user if it exists in the session
     */

    if (!req.session.user) {
        return res.status(401).send({
            message: 'Please login'
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            id: req.session.user.id
        }, select: {
            id: true,
            email: true,
            username: true,
            profile: true
        }
    });

    if (!user) {
        req.session.user = null;
        
        return res.status(401).send({
            message: 'Please login'
        });
    }

    if (req.path === '/profile' && req.method === 'POST' || !user.profile) {
        return res.status(401).send({
            message: 'Please create a profile'
        });
    }
    
    req.session.user = user;
    req.user = user;

    next();
}

const requireAuthNoProfile = async (req, res, next) => {
    /**
     * Adds user to req.user if it exists in the session
     */
    
    if (!req.session.user) {
        return res.status(401).send({
            message: 'Please login'
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            id: req.session.user.id
        }, select: {
            id: true,
            email: true,
            username: true,
            profile: true
        }
    });

    if (!user) {
        req.session.user = null;
        
        return res.status(401).send({
            message: 'Please login'
        });
    }
    
    req.session.user = user;
    req.user = user;

    next();
}

module.exports = { getUser, requireAuth, requireAuthNoProfile };