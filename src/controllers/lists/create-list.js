const prisma = require('../../utils/prisma');

const createList = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send({
            message: "please provide name"
        });
    }

    const list = await prisma.list.create({
        data: {
            name: name,
            profileId: req.session.user.profile.id,
            groupId: req.group.id
        }
    });

    return res.status(200).send({
        message: "list created",
        list: list
    });
};

module.exports = createList;