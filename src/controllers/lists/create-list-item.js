const prisma = require('../../utils/prisma');

const createListItem = async (req, res) => {
    const { listId } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).send({
            message: "please provide text"
        });
    }

    const listItem = await prisma.listItem.create({
        data: {
            text: text,
            listId: listId
        }
    });

    return res.status(200).send({
        message: "list item created",
        listItem: listItem
    });
};

module.exports = createListItem;