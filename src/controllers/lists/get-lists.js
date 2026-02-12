const prisma = require('../../utils/prisma');

const getLists = async (req, res) => {
    const lists = await prisma.list.findMany({
        where: {
            groupId: req.group.id
        },
        include: {
            listItems: true
        }
    });

    return res.status(200).send({
        lists,
        group: req.group
    });
};

module.exports = getLists;