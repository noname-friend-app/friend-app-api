const prisma = require('../../utils/prisma');

const toggleListComplete = async (req, res) => {
    const { listId } = req.params;
    const { checked } = req.body;

    if (!checked) {
        return res.status(400).send({
            message: "please provide checked (true or false)"
        });
    }

    const list = await prisma.list.findFirst({
        where: {
            id: listId
        }
    });

    if (!list) {
        return res.status(404).send({
            message: "list not found"
        });
    }

    const changedList = await prisma.list.update({
        where: {
            id: listId
        },
        data: {
            checked: checked
        }
    });

    return res.status(200).send({
        message: "list updated",
        list: changedList
    });
};

module.exports = toggleListComplete;