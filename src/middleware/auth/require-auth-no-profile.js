const prisma = require('../../utils/prisma');

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

module.exports = requireAuthNoProfile;