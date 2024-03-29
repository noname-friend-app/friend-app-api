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

describe('Profiles', () => {
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
        assert.equal(res.status, 201, 'User was not created');
        assert.ok(res.body.user, 'User was not created');
    });

    // test authentication
    it('should return a 401 if you are not logged in', async () => {
        const res = await chai.request(server)
            .get('/profile');

        assert.equal(res.status, 401);
    });

    it('should create a profile', async () => {
        // login the user
        const resUser = await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        const res = await agent
            .post('/profile')
            .send({
                name: 'alex',
                bio: 'this is a bio',
                pronouns: 'he/him',
                birthday: new Date('2003-01-01')
            });

        expect(res.status).to.equal(201);
        expect(res.body.message).to.equal('Profile created successfully');
        expect(res.body.profile.name).to.equal('alex');
        expect(res.body.profile.bio).to.equal('this is a bio');
        expect(res.body.profile.pronouns).to.equal('he/him');
        // expect(res.body.profile.userId).to.exist();
    });

    it('should get a profile', async () => {
        // login the user
        const resUser = await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        const res = await agent
            .get('/profile')

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Profile found');
        expect(res.body.profile).to.be.an('object');
        expect(res.body.profile.name).to.equal('alex');
        expect(res.body.profile.bio).to.equal('this is a bio');
        expect(res.body.profile.pronouns).to.equal('he/him');
    });

    it('should update a profile', async () => {
        // login the user
        const resUser = await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        const res = await agent
            .put('/profile')
            .send({
                name: 'test',
                bio: 'test',
                pronouns: 'test',
                birthday: new Date('2003-01-01')
            });

        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal('Profile updated successfully');
        expect(res.body.profile.name).to.equal('test');
        expect(res.body.profile.bio).to.equal('test');
        expect(res.body.profile.pronouns).to.equal('test');
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
    });

});