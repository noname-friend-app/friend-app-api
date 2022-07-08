const server = require('../app');
const mocha = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const prisma = require('../utils/prisma');
const { assert } = require('chai');

const { describe, it, after } = mocha;
const { should, expect } = chai;

chai.use(chaiHttp);


describe('Auth', () => {

    before(async () => {
        // delete all the users
        await prisma.user.deleteMany({})
        await prisma.profile.deleteMany({})
    });
    
    it('should create a new user on signup and return a token', async () => {
        const res = await chai.request(server)
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            })
        // // console.log(res.body);
        // console.log('test done');
        // console.log('test done');
    });

    it('should return a token on login', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            })

        assert.equal(res.status, 200);
        assert.ok(res.body.token);
    });

    it('should allow you to use your email to login', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                email: 'test@email.com',
                password: 'test'
            })
            
        assert.equal(res.status, 200);
        assert.ok(res.body.token);
    });

    it('should return a 401 error on login with invalid credentials', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'wrong'
            })
            // console.log(res.body);
        assert.equal(res.status, 400);
        assert.ok(res.body.message);
    });

    it('should be able to check if a token is valid', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            })

        assert.equal(res.status, 200);
        assert.ok(res.body.token);

        const res2 = await chai.request(server)
            .post('/check-token')
            .send({
                token: res.body.token
            })
                
        assert.equal(res.status, 200);
        assert.ok(res.body.message);
        assert.ok(res.body.user);
    });

    after(async () => {
        //delete test user
        const users = await prisma.user.findMany();
        for (let i = 0; i < users.length; i++) {
            await prisma.user.delete({
                where: {
                    id: users[i].id
                }
            }).catch(err => {
                // console.log(err);
            });
        }
    })

});