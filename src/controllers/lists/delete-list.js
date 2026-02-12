const prisma = require('../../utils/prisma');

const deleteList = async (req, res) => {
    const { listId } = req.params;

    const list = await prisma.list.delete({
        where: {
            id: listId
        }
    });

    return res.status(200).send({
        message: "list deleted",
        list: list
    });
};

module.exports = deleteList;