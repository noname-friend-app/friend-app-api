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
        await prisma.group.deleteMany({})
        await prisma.groupMember.deleteMany({})

        // create a new user
        const res = await chai.request(server)
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            });

        // create a second user
        const res2 = await chai.request(server)
            .post('/signup')
            .send({
                email: 'test2@email.com',
                username: 'test2',
                password: 'test'
            });

        // verify that the user was created
        // console.log(res.body, res.status);
        assert.equal(res.status, 201, 'User was not created');
        assert.ok(res.body.user, 'User was not created');
        
        assert.equal(res2.status, 201, 'User2 was not created');
        assert.ok(res2.body.user, 'User2 was not created');
    });

    // Agent for testing everything
    // We need to use agent with cookies/sessions to test authentication
    // without it, the sessions will not be saved between requests
    const agent = chai.request.agent(server);

    const loginTestUser = async (userNumber) => {
        const data = {
            1: {
                username: 'test',
                password: 'test'
            },
            2: {
                username: 'test2',
                password: 'test'
            }
        }

        const res = await agent
            .post('/login')
            .send({
                username: data[userNumber].username,
                password: data[userNumber].password
            });

        assert.equal(res.status, 200, 'User not logged in');
        assert.ok(res.body.user, 'User not logged in');
        return res;
    }

    it('should be able to create a group', async () => {
        let resUser = await loginTestUser(1);

        // create profile for user
        const resProfile = await agent
            .post('/profile')
            .send({
                name: 'alex',
                bio: 'this is a bio',
                pronouns: 'he/him',
                birthday: '1999-01-01',
            });

        // verify that the profile was created
        assert.ok(resProfile.body.profile, 'Profile was not created');

        const res = await agent
            .post('/groups/new')
            .send({
                name: 'Test Group',
                description: 'This is a test group'
            });

        // verify that the group was created
        assert.equal(res.status, 200, 'Group was not created');
        assert.ok(res.body.group, 'Group was not created');
    });

    it('should be able to get all groups', async () => {
        let resUser = await loginTestUser(1);
        const res = await agent
            .get('/groups/joined')

        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        assert.ok(res.body.user, 'User was not returned');
    });

    var groupCode = '';

    it('should be able to get a group by id', async () => {
        let resUser = await loginTestUser(1);
        const res = await agent
            .get('/groups/joined')
        
        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        
        // get the first group
        const group = res.body.groups[0];
        assert.ok(group, 'Group was not returned');

        groupCode = group.joinCode;
        
        const res2 = await agent
            .get(`/groups/${group.id}`)
        
        // verify that the group was returned
        assert.equal(res2.status, 200, 'Group was not returned');
        assert.ok(res2.body.group, 'Group was not returned');
        assert.equal(res2.body.group.name, group.name, 'Group was not returned');
        assert.equal(res2.body.group.description, group.description, 'Group was not returned');
    });

    it('should get an error joining a group with no join code', async () => {
        let resUser = await loginTestUser(1);
        const res = await agent
            .post('/groups/join')
            .send({
                message: 'test'
            });

        assert.equal(res.status, 400, 'credentials were not checked');
    })

    it('should return an error when joining with a bad joinCode', async () => {
        let resUser = await loginTestUser(1);
        const res2 = await agent
            .post('/groups/join')
            .send({
                joinCode: 'fakecode'
            });

        assert.equal(res2.status, 404, 'error did not go through');
        assert.equal(res2.body.message, "Group not found", 'group was found')
    })

    it('should be able to join an existing group', async () => {
        assert.ok(groupCode, 'Group code was not returned');
        let resUser = await loginTestUser(2);

        // create profile for user2 
        const resProfile = await agent
            .post('/profile')
            .send({
                name: 'test2',
                bio: 'this is a bio',
                pronouns: 'he/him',
                birthday: '1999-01-01',
            });
        
        // verify that the profile was created
        assert.ok(resProfile.body.profile, 'Profile was not created');

        const res3 = await agent
            .post('/groups/join')
            .send({
                joinCode: groupCode
            });
        
        // console.log(res3.body);
        assert.equal(res3.status, 200, 'group was not joined');
        assert.ok(res3.body.group, 'group not in body');
    })

    it('should not be able to join a group that was already joined', async () => {
        let resUser = await loginTestUser(2);
        const res = await agent
            .post('/groups/join')
            .send({
                joinCode: groupCode
            });

        assert.equal(res.status, 400, res.body.message);
    })

    it('should be able to edit existing group', async () => {
        let resUser = await loginTestUser(1);
        const res = await agent
            .get('/groups/joined')
        
        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        
        // get the first group
        const group = res.body.groups[0];
        assert.ok(group, 'Group was not returned');
        assert.equal(group.name, 'Test Group', 'Group was not created');
        assert.equal(group.description, 'This is a test group', 'Group was not created');

        const res2 = await agent
            .put(`/groups/${group.id}/edit`)
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
        let resUser = await loginTestUser(1);
        const res = await agent
            .get('/groups/joined')
        
        // verify that a list of groups was returned
        assert.equal(res.status, 200, 'Groups were not returned');
        assert.ok(res.body.groups, 'Groups were not returned');
        
        // get the first group
        const group = res.body.groups[0];
        assert.ok(group, 'Group was not returned');

        const res2 = await agent
            .delete(`/groups/${group.id}/delete`)

        // verify that the group was deleted
        assert.equal(res2.status, 200, 'Group was not deleted');
        assert.ok(res2.body.group, 'Group was not deleted');
        assert.equal(res2.body.group.name, group.name, 'Group was not deleted');
    });

    after(async () => {
        //delete all the profiles and users
        await prisma.user.deleteMany({})
        await prisma.profile.deleteMany({})
        await prisma.group.deleteMany({})
        await prisma.groupMember.deleteMany({})
    });
});