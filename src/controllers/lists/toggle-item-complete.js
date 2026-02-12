const prisma = require('../../utils/prisma');

const toggleItemComplete = async (req, res) => {
    const { itemId } = req.params;
    const { checked } = req.body;

    const item = await prisma.listItem.findFirst({
        where: {
            id: itemId
        }
    });

    if (!item) {
        return res.status(404).send({
            message: "item not found"
        });
    }

    if (checked != true && checked != false) {
        return res.status(400).send({
            message: "please provide checked (true or false)"
        });
    }

    const listItem = await prisma.listItem.update({
        where: {
            id: itemId
        },
        data: {
            checked: checked
        }
    });

    return res.status(200).send({
        message: "list item updated",
        listItem: listItem
    });
};

module.exports = toggleItemComplete;