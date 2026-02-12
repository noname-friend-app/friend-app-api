const createGroup = require('./create-group');
const getJoinedGroups = require('./get-joined-groups');
const getGroupById = require('./get-group-by-id');
const joinGroup = require('./join-group');
const editGroup = require('./edit-group');
const deleteGroup = require('./delete-group');

module.exports = {
    createGroup,
    getJoinedGroups,
    getGroupById,
    joinGroup,
    editGroup,
    deleteGroup
};