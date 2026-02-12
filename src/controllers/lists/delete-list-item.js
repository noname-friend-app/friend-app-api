const prisma = require('../../utils/prisma');

const deleteListItem = async (req, res) => {
    const { itemId } = req.params;

    const listItem = await prisma.listItem.delete({
        where: {
            id: itemId
        }
    });

    return res.status(200).send({
        message: "list item deleted",
        listItem: listItem
    });
};

module.exports = deleteListItem;