const prisma = require('../../utils/prisma');

const getJoinedGroups = async (req, res) => {
    const groupProfiles = await prisma.groupMember.findMany({
        where: {
            profileId: req.user.profile.id
        },
        include: {
            group: true
        }
    });

    let groups = [];
    groupProfiles.forEach(groupProfile => {
        groups.push(groupProfile.group);
    });

    return res.status(200).send({
        message: 'Groups retrieved',
        groups: groups,
        user: req.user,
        profile: req.user.profile
    });
};

module.exports = getJoinedGroups;