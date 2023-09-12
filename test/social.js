const server = require('../app');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const prisma = require('../utils/prisma');
const { assert } = require('chai');

const { describe, it, after } = mocha;
const { should, expect } = chai;

chai.use(chaiHttp);

// Agent for testing everything
// We need to use agent with cookies/sessions to test authentication
// without it, the sessions will not be saved between requests
const agent = chai.request.agent(server);
agent.timeout(10000);

describe('Social', function() {
    this.timeout(5000);
    before(async function() {

        // delete all the users
        await prisma.user.deleteMany({})
        await prisma.profile.deleteMany({})

        // create a new user
        const res = await agent
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            });

        // verify that the user was created
        assert.equal(res.status, 201, 'User was not created');
        assert.ok(res.body.user, 'User was not created');
        console.log(res.body.user)
        
        // check-session
        const resSession = await agent
            .get('/check-session');

        assert.equal(resSession.status, 200, 'Session was not created');
        assert.ok(resSession.body.user, 'Session was not created');

        // create a profile
        const resProfile = await agent
            .post('/profile')
            .send({
                name: 'test',
                bio: 'test',
                pronouns: 'test',
                birthday: new Date()
            });
        
        console.log(resProfile.body)
        assert.equal(resProfile.status, 201, 'Profile was not created');
        assert.ok(resProfile.body.profile, 'Profile was not created');
        

        // make a group and add the user to it
        const resGroup = await agent
            .post('/groups/new')
            .send({
                name: 'test group',
                description: 'this is a test group'
            });

        assert.ok(resGroup.body.group);
    });

    const getGroup = async () => {
        const resGroup = await agent
            .get('/groups/joined');

        // console.log(resGroup.body)
        assert.equal(resGroup.status, 200, 'Group was not found');
        assert.ok(resGroup.body.groups, 'Group was not found');

        return resGroup.body.groups[0];
    };

    it('should create a quote', async () => {
        const group = await getGroup();

        const res = await agent
            .post(`/group/${group.id}/quotes`)
            .send({
                text: 'test quote',
                saidAt: new Date()
            });

        assert.equal(res.status, 200, 'Quote was not created');
        assert.ok(res.body.quote, 'Quote was not created');
    });

    it('should get quotes', async () => {
        const group = await getGroup();

        const res = await agent
            .get(`/group/${group.id}/quotes`);

        assert.equal(res.status, 200, 'Quotes were not found');
        assert.ok(res.body.quotes, 'Quotes were not found');
    });

    it('should be able to comment on a quotes', async () => {
        const group = await getGroup();

        const res = await agent
            .get(`/group/${group.id}/quotes`);

        assert.equal(res.status, 200, 'Quotes were not found');
        assert.ok(res.body.quotes, 'Quotes were not found');

        const quote = res.body.quotes[0];

        const resComment = await agent
            .post(`/group/${group.id}/quotes/${quote.id}/comments`)
            .send({
                text: 'test comment'
            });

        assert.equal(resComment.status, 200, 'Comment was not created');
        assert.ok(resComment.body.comment, 'Comment was not created');
    });

    it('should be able to recieve comments on a quote', async () => {
        const group = await getGroup();

        const res = await agent
            .get(`/group/${group.id}/quotes`);

        assert.equal(res.status, 200, 'Quotes were not found');
        assert.ok(res.body.quotes, 'Quotes were not found');

        const quote = res.body.quotes[0];

        const resComment = await agent
            .get(`/group/${group.id}/quotes/${quote.id}/comments`);

        assert.equal(resComment.status, 200, 'Comments were not found');
        assert.ok(resComment.body.comments, 'Comments were not found');
    });

    it('should be able to edit a comment on a quote', async () => {
        const group = await getGroup();

        const res = await agent
            .get(`/group/${group.id}/quotes`);

        assert.equal(res.status, 200, 'Quotes were not found');
        assert.ok(res.body.quotes, 'Quotes were not found');

        const quote = res.body.quotes[0];

        const resComment = await agent
            .get(`/group/${group.id}/quotes/${quote.id}/comments`);

        assert.equal(resComment.status, 200, 'Comments were not found');
        assert.ok(resComment.body.comments, 'Comments were not found');

        const comment = resComment.body.comments[0];

        const resEdit = await agent
            .put(`/group/${group.id}/quotes/${quote.id}/comments/${comment.id}`)
            .send({
                text: 'edited comment'
            });

        assert.equal(resEdit.status, 200, 'Comment was not edited');
        assert.ok(resEdit.body.comment, 'Comment was not edited');
    });

    it('should be able to delete a comment on a quote', async () => {
        const group = await getGroup();

        const res = await agent
            .get(`/group/${group.id}/quotes`);

        assert.equal(res.status, 200, 'Quotes were not found');
        assert.ok(res.body.quotes, 'Quotes were not found');

        const quote = res.body.quotes[0];

        const resComment = await agent
            .get(`/group/${group.id}/quotes/${quote.id}/comments`);

        assert.equal(resComment.status, 200, 'Comments were not found');
        assert.ok(resComment.body.comments, 'Comments were not found');

        const comment = resComment.body.comments[0];

        const resDelete = await agent
            .delete(`/group/${group.id}/quotes/${quote.id}/comments/${comment.id}`);

        assert.equal(resDelete.status, 200, 'Comment was not deleted');
        assert.ok(resDelete.body.message, 'Comment was not deleted');
    });

    after(async () => {
        //delete all the profiles
        const profiles = await prisma.profile.findMany();
        for (let i = 0; i < profiles.length; i++) {
            await prisma.profile.delete({
                where: {
                    id: profiles[i].id
                }
            });
        }
        
        // delete all the users
        const users = await prisma.user.findMany();
        for (let i = 0; i < users.length; i++) {
            await prisma.user.delete({
                where: {
                    id: users[i].id
                }
            });
        }

        // delete all the groups
        const groups = await prisma.group.findMany();
        for (let i = 0; i < groups.length; i++) {
            await prisma.group.delete({
                where: {
                    id: groups[i].id
                }
            });
        }

        // delete all the quotes
        const quotes = await prisma.quote.findMany();
        for (let i = 0; i < quotes.length; i++) {
            await prisma.quote.delete({
                where: {
                    id: quotes[i].id
                }
            });
        }

        // delete all the comments
        const comments = await prisma.quoteComments.findMany();
        for (let i = 0; i < comments.length; i++) {
            await prisma.comment.delete({
                where: {
                    id: comments[i].id
                }
            });
        }
    });

}).timeout(5000);