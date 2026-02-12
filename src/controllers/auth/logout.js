const logout = async (req, res) => {
    req.session.destroy();
    return res.status(200).send({
        message: 'User logged out successfully'
    });
};

module.exports = logout;