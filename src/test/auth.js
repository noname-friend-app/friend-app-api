const server = require('../app.js');
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
    
    it('should create a new user on signup', async () => {
        const res = await chai.request(server)
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            })
        assert.equal(res.status, 201);
        assert.ok(res.body.user);
    });

    it('should return user on login', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            })

        assert.equal(res.status, 200);
        assert.ok(res.body.user);
    });

    it('should allow you to use your email to login', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                email: 'test@email.com',
                password: 'test'
            })
            
        assert.equal(res.status, 200);
        assert.ok(res.body.user);
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

    it('should be able to check if a session is valid', async () => {
        const res = await chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            })

        assert.equal(res.status, 200);
        assert.ok(res.body.user);

        const res2 = await chai.request(server)
            .get('/check-session')
            .send({})
                
        assert.equal(res.status, 200);
        assert.ok(res.body.message);
        assert.ok(res.body.user);
    });

    it('should be able to logout', async () => {
        const res = await chai.request(server)
            .get('/logout')
            .send({})

        assert.equal(res.status, 200);
        assert.ok(res.body.message);
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