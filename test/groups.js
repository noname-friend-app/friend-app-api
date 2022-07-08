const server = require('../app');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const prisma = require('../utils/prisma');
const { assert } = require('chai');

const { describe, it, after } = mocha;
const { should, expect } = chai;

chai.use(chaiHttp);

describe('Groups', () => {

    before(async () => {
        // delete all the users
        await prisma.user.deleteMany({})
        await prisma.profile.deleteMany({})

        // create a new user
        const res = await chai.request(server)
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            });

        // verify that the user was created
        // console.log(res.body, res.status);
        assert.equal(res.status, 201, 'User was not created');
        assert.ok(res.body.token, 'User was not created');
    });

    var authtoken = '';

    beforeEach(async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        // verify that the token was returned
        assert.equal(res.status, 200, 'Token was not returned');
        assert.ok(res.body.token, 'Token was not returned');

        authtoken = res.body.token;
    });

    it('should be able to create a group', async () => {
        const res = await chai.request(server)
            .post('/groups/new')
            .set('authToken', authtoken)
            .send({
                name: 'Test Group',
                description: 'This is a test group'
            });

        // verify that the group was created
        assert.equal(res.status, 200, 'Group was not created');
        assert.ok(res.body.group, 'Group was not created');
    });

    it('should be able to get all groups', async () => {
        const res = await chai.request(server)
            .get('/groups/joined')
            .set('authToken', authtoken);

        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        assert.ok(res.body.user, 'User was not returned');
    });

    it('should be able to get a group by id', async () => {
        const res = await chai.request(server)
            .get('/groups/joined')
            .set('authToken', authtoken);
        
        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        
        // get the first group
        const group = res.body.groups[0];
        assert.ok(group, 'Group was not returned');
        
        const res2 = await chai.request(server)
            .get(`/groups/${group.id}`)
        
        // verify that the group was returned
        assert.equal(res2.status, 200, 'Group was not returned');
        assert.ok(res2.body.group, 'Group was not returned');
        assert.equal(res2.body.group.name, group.name, 'Group was not returned');
        assert.equal(res2.body.group.description, group.description, 'Group was not returned');
    });

    it('should be able to edit existing group', async () => {
        const res = await chai.request(server)
            .get('/groups/joined')
            .set('authToken', authtoken);
        
        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        
        // get the first group
        const group = res.body.groups[0];
        assert.ok(group, 'Group was not returned');
        assert.equal(group.name, 'Test Group', 'Group was not created');
        assert.equal(group.description, 'This is a test group', 'Group was not created');

        const res2 = await chai.request(server)
            .put(`/groups/${group.id}/edit`)
            .set('authToken', authtoken)
            .send({
                name: 'Test Group 2',
                description: 'This is a test group 2'
            });

        // verify that the group was edited
        // console.log(res2.body);
        assert.equal(res2.status, 200, 'Group was not edited: ' + res2.body);
        assert.ok(res2.body.group, 'Group was not edited');
        assert.equal(res2.body.group.name, 'Test Group 2', 'Group was not edited');
        assert.equal(res2.body.group.description, 'This is a test group 2', 'Group was not edited');
    });

    it('should be able to delete existing group', async () => {
        const res = await chai.request(server)
            .get('/groups/joined')
            .set('authToken', authtoken);
        
        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        
        // get the first group
        const group = res.body.groups[0];
        assert.ok(group, 'Group was not returned');

        const res2 = await chai.request(server)
            .delete(`/groups/${group.id}/delete`)
            .set('authToken', authtoken);

        // verify that the group was deleted
        assert.equal(res2.status, 200, 'Group was not deleted');
        assert.ok(res2.body.group, 'Group was not deleted');
        assert.equal(res2.body.group.name, group.name, 'Group was not deleted');
    });

    after(async () => {
        //delete all the profiles and users
        await prisma.user.deleteMany({})
        await prisma.profile.deleteMany({})
    });
});