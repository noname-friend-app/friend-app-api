const prisma = require('../../utils/prisma');

const updateList = async (req, res) => {
    const { listId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).send({
            message: "please provide name"
        });
    }

    const list = await prisma.list.update({
        where: {
            id: listId
        },
        data: {
            name: name
        }
    });

    return res.status(200).send({
        message: "list updated",
        list: list
    });
};

module.exports = updateList;