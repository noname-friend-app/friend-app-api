const prisma = require('../../utils/prisma');

const updateListItem = async (req, res) => {
    const { itemId } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).send({
            message: "please provide text"
        });
    }

    const listItem = await prisma.listItem.update({
        where: {
            id: itemId
        },
        data: {
            text: text
        }
    });

    return res.status(200).send({
        message: "list item updated",
        listItem: listItem
    });
};

module.exports = updateListItem;