const server = require('../../app.js');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const prisma = require('../../utils/prisma');
const { assert } = require('chai');

const { describe, it, after } = mocha;
const { should, expect } = chai;

chai.use(chaiHttp);

describe('Auth', function() {
    // Extended timeout (10s) required for integration tests because:
    // - Real HTTP requests to Express server
    // - Database operations via Prisma
    // - bcrypt password hashing (~50-100ms per hash)
    // Note: Must use function() not arrow function for this.timeout() to work
    this.timeout(10000);

    // Agent maintains cookies/sessions across requests (required for auth)
    const agent = chai.request.agent(server);

    before(async () => {
        // delete all the users
        await prisma.user.deleteMany({});
        await prisma.profile.deleteMany({});
    });
    
    it('should create a new user on signup', async () => {
        const res = await chai.request(server)
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            });
        assert.equal(res.status, 201);
        assert.ok(res.body.user);
    });

    it('should return user on login', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        assert.equal(res.status, 200);
        assert.ok(res.body.user);
    });

    it('should allow you to use your email to login', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                email: 'test@email.com',
                password: 'test'
            });
            
        assert.equal(res.status, 200);
        assert.ok(res.body.user);
    });

    it('should return a 401 error on login with invalid credentials', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'wrong'
            });
        assert.equal(res.status, 400);
        assert.ok(res.body.message);
    });

    it('should be able to check if a session is valid', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        assert.equal(res.status, 200);
        assert.ok(res.body.user);

        const res2 = await chai.request(server)
            .get('/check-session')
            .send({});
                
        assert.equal(res.status, 200);
        assert.ok(res.body.message);
        assert.ok(res.body.user);
    });

    it('should be able to logout', async () => {
        const res = await chai.request(server)
            .get('/logout')
            .send({});

        assert.equal(res.status, 200);
        assert.ok(res.body.message);
    });

    // Change password tests
    it('should change password with valid credentials', async () => {
        // Login first to establish session
        await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            });

        // Create profile (required for requireAuth)
        await agent
            .post('/profile')
            .send({
                name: 'Test User',
                bio: 'Testing auth',
                pronouns: 'they/them',
                birthday: '2000-01-01'
            });

        const res = await agent
            .put('/change-password')
            .send({
                password: 'test',
                newPassword: 'newpassword'
            });

        assert.equal(res.status, 200, 'Password change failed');
        assert.ok(res.body.message);
    });

    it('should login with new password after change', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'newpassword'
            });

        assert.equal(res.status, 200);
        assert.ok(res.body.user);
    });

    it('should return 400 when changing password with wrong current password', async () => {
        await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'newpassword'
            });

        const res = await agent
            .put('/change-password')
            .send({
                password: 'wrongpassword',
                newPassword: 'anotherpassword'
            });

        assert.equal(res.status, 400);
        assert.ok(res.body.message);
    });

    it('should return 400 when changing password without required fields', async () => {
        const res = await agent
            .put('/change-password')
            .send({
                password: 'newpassword'
            });

        assert.equal(res.status, 400);
        assert.ok(res.body.message);
    });

    // Change email tests
    it('should change email with valid credentials', async () => {
        await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'newpassword'
            });

        const res = await agent
            .put('/change-email')
            .send({
                email: 'newemail@email.com'
            });

        assert.equal(res.status, 200, 'Email change failed');
        assert.ok(res.body.message);
        assert.equal(res.body.user.email, 'newemail@email.com');
    });

    it('should login with new email after change', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                email: 'newemail@email.com',
                password: 'newpassword'
            });

        assert.equal(res.status, 200);
        assert.ok(res.body.user);
    });

    it('should return 400 when changing email without providing email', async () => {
        await agent
            .post('/login')
            .send({
                username: 'test',
                password: 'newpassword'
            });

        const res = await agent
            .put('/change-email')
            .send({});

        assert.equal(res.status, 400);
        assert.ok(res.body.message);
    });

    after(async () => {
        //delete test user
        await prisma.profile.deleteMany({});
        await prisma.user.deleteMany({});
    });
});