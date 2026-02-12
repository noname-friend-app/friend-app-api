const prisma = require('../../utils/prisma');

const checkForGroup = async (req, res, next) => {
    const { groupId } = req.params;
    const group = await prisma.group.findUnique({ 
        where: { 
            id: groupId 
        },
        include: {
            members: {
                select: {
                    profile: true
                }
            }
        }
    });

    if (!group) {
        return res.status(404).send({
            message: 'Group not found'
        });
    }

    // check if user is in group
    const userInGroup = group.members.find(member => member.profile.id === req.user.profile.id);
    if (!userInGroup) {
        return res.status(401).send({
            message: 'You are not in this group'
        });
    }

    req.group = group;
    
    next();
};

module.exports = checkForGroup;