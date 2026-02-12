const prisma = require('../../utils/prisma');

const getListItems = async (req, res) => {
    const { listId } = req.params;

    const listItems = await prisma.listItem.findMany({
        where: {
            listId: listId
        }
    });

    return res.status(200).send({
        message: "list items found",
        listItems: listItems
    });
};

module.exports = getListItems;