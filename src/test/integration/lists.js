const server = require('../../app');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const prisma = require('../../utils/prisma');
const { assert } = require('chai');

const { describe, it, after } = mocha;
const { expect } = chai;

chai.use(chaiHttp);

describe('Lists', function() {
    // Extended timeout (10s) required for integration tests because:
    // - Real HTTP requests to Express server
    // - Database operations via Prisma
    // - bcrypt password hashing (~50-100ms per hash)
    // Note: Must use function() not arrow function for this.timeout() to work
    this.timeout(10000);

    // Agent maintains cookies/sessions across requests (required for auth)
    const agent = chai.request.agent(server);
    let groupId = '';
    let listId = '';
    let listItemId = '';

    before(async function() {
        // Clean up
        await prisma.user.deleteMany({});
        await prisma.profile.deleteMany({});
        await prisma.group.deleteMany({});
        await prisma.groupMember.deleteMany({});
        await prisma.list.deleteMany({});
        await prisma.listItem.deleteMany({});

        // Create a user
        const resSignup = await agent
            .post('/signup')
            .send({
                email: 'listtest@email.com',
                username: 'listtest',
                password: 'test'
            });

        assert.equal(resSignup.status, 201, 'User was not created');

        // Create a profile
        const resProfile = await agent
            .post('/profile')
            .send({
                name: 'List Tester',
                bio: 'Testing lists',
                pronouns: 'they/them',
                birthday: '2000-01-01'
            });

        assert.equal(resProfile.status, 201, 'Profile was not created');

        // Create a group
        const resGroup = await agent
            .post('/groups/new')
            .send({
                name: 'List Test Group',
                description: 'A group for testing lists'
            });

        assert.equal(resGroup.status, 200, 'Group was not created');
        groupId = resGroup.body.group.id;
    });

    // List CRUD tests
    it('should create a new list', async () => {
        const res = await agent
            .post(`/group/${groupId}/list`)
            .send({
                name: 'Test List'
            });

        assert.equal(res.status, 200, 'List was not created');
        assert.ok(res.body.list, 'List not in response');
        assert.equal(res.body.list.name, 'Test List');
        listId = res.body.list.id;
    });

    it('should return 400 when creating list without name', async () => {
        const res = await agent
            .post(`/group/${groupId}/list`)
            .send({});

        assert.equal(res.status, 400, 'Should return 400');
        assert.ok(res.body.message, 'Should have error message');
    });

    it('should get all lists for a group', async () => {
        const res = await agent
            .get(`/group/${groupId}/lists`);

        assert.equal(res.status, 200, 'Lists were not returned');
        assert.ok(res.body.lists, 'Lists not in response');
        assert.ok(Array.isArray(res.body.lists), 'Lists should be array');
        assert.ok(res.body.lists.length > 0, 'Should have at least one list');
    });

    it('should update a list', async () => {
        const res = await agent
            .put(`/group/${groupId}/list/${listId}`)
            .send({
                name: 'Updated List Name'
            });

        assert.equal(res.status, 200, 'List was not updated');
        assert.ok(res.body.list, 'List not in response');
        assert.equal(res.body.list.name, 'Updated List Name');
    });

    it('should return 400 when updating list without name', async () => {
        const res = await agent
            .put(`/group/${groupId}/list/${listId}`)
            .send({});

        assert.equal(res.status, 400, 'Should return 400');
    });

    // List Item CRUD tests
    it('should create a list item', async () => {
        const res = await agent
            .post(`/group/${groupId}/list/${listId}/item`)
            .send({
                text: 'Test Item'
            });

        assert.equal(res.status, 200, 'List item was not created');
        assert.ok(res.body.listItem, 'List item not in response');
        assert.equal(res.body.listItem.text, 'Test Item');
        listItemId = res.body.listItem.id;
    });

    it('should return 400 when creating list item without text', async () => {
        const res = await agent
            .post(`/group/${groupId}/list/${listId}/item`)
            .send({});

        assert.equal(res.status, 400, 'Should return 400');
    });

    it('should get all list items', async () => {
        const res = await agent
            .get(`/group/${groupId}/list/${listId}/items`);

        assert.equal(res.status, 200, 'List items were not returned');
        assert.ok(res.body.listItems, 'List items not in response');
        assert.ok(Array.isArray(res.body.listItems), 'List items should be array');
        assert.ok(res.body.listItems.length > 0, 'Should have at least one item');
    });

    it('should update a list item', async () => {
        const res = await agent
            .put(`/group/${groupId}/list/${listId}/item/${listItemId}`)
            .send({
                text: 'Updated Item Text'
            });

        assert.equal(res.status, 200, 'List item was not updated');
        assert.ok(res.body.listItem, 'List item not in response');
        assert.equal(res.body.listItem.text, 'Updated Item Text');
    });

    it('should return 400 when updating list item without text', async () => {
        const res = await agent
            .put(`/group/${groupId}/list/${listId}/item/${listItemId}`)
            .send({});

        assert.equal(res.status, 400, 'Should return 400');
    });

    // Toggle complete tests
    it('should toggle list item complete', async () => {
        const res = await agent
            .put(`/list/${listId}/item/${listItemId}/complete`)
            .send({
                checked: true
            });

        assert.equal(res.status, 200, 'List item was not toggled');
        assert.ok(res.body.listItem, 'List item not in response');
        assert.equal(res.body.listItem.checked, true);
    });

    it('should toggle list item back to incomplete', async () => {
        const res = await agent
            .put(`/list/${listId}/item/${listItemId}/complete`)
            .send({
                checked: false
            });

        assert.equal(res.status, 200, 'List item was not toggled');
        assert.equal(res.body.listItem.checked, false);
    });

    it('should return 404 for non-existent list item toggle', async () => {
        const res = await agent
            .put(`/list/${listId}/item/nonexistent123/complete`)
            .send({
                checked: true
            });

        assert.equal(res.status, 404, 'Should return 404');
    });

    it('should toggle list complete', async () => {
        const res = await agent
            .put(`/list/${listId}/complete`)
            .send({
                checked: true
            });

        assert.equal(res.status, 200, 'List was not toggled');
        assert.ok(res.body.list, 'List not in response');
        assert.equal(res.body.list.checked, true);
    });

    // Delete tests (run last)
    it('should delete a list item', async () => {
        const res = await agent
            .delete(`/group/${groupId}/list/${listId}/item/${listItemId}`);

        assert.equal(res.status, 200, 'List item was not deleted');
        assert.ok(res.body.listItem, 'List item not in response');
    });

    it('should delete a list', async () => {
        const res = await agent
            .delete(`/group/${groupId}/list/${listId}`);

        assert.equal(res.status, 200, 'List was not deleted');
        assert.ok(res.body.list, 'List not in response');
    });

    after(async () => {
        await prisma.listItem.deleteMany({});
        await prisma.list.deleteMany({});
        await prisma.groupMember.deleteMany({});
        await prisma.group.deleteMany({});
        await prisma.profile.deleteMany({});
        await prisma.user.deleteMany({});
    });
});