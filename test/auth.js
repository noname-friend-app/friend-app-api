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
    
    it('should create a new user on signup and return a token', (done) => {
        chai.request(server)
            .post('/signup')
            .send({
                email: 'test@email.com',
                username: 'test',
                password: 'test'
            })
            .then((res) => {
                // console.log(res.body);
                res.status.should.equal(201);
                res.body.should.have.property('token');
            })

        done();
    });

    it('should return a token on login', (done) => {
        chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            })
            .then(res => {
                res.status.should.equal(200);
                res.body.should.have.property('token');
            });
        done();
    });

    it('should return a 401 error on login with invalid credentials', (done) => {
        chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'wrong'
            })
            .then(res => {
                // console.log(res.body);
                res.status.should.equal(400);
                res.body.should.have.property('message');
            });
            done();
    });

    it('should be able to check if a token is valid', (done) => {
        chai.request(server)
            .post('/login')
            .send({
                username: 'test',
                password: 'test'
            })
            .then(res => {
                res.status.should.equal(200);
                res.body.should.have.property('token');
                chai.request(server)
                    .post('/check-token')
                    .send({
                        token: res.body.token
                    })
                    .then(res => {
                        assert(res.status, 200);
                        res.status.should.equal(200);
                        res.body.should.have.property('message');
                        res.body.should.have.property('user');
                        done();
                    });
                });
            done();
    });

    after( async () => {
        try {
            await prisma.user.deleteMany({
                where: {
                    username: 'test'
                }
            });
        } catch (error) {
            console.log(error);
        }
    });

});