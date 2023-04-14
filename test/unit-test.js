const request = require('supertest');
const app = require('../app');
const chai = require('chai');
const expect = chai.expect;

describe('Authentication Tests', function() {
    describe('Success', function() {
        it('Return 400 if the email is not valid', function(done) {
            request(app).get('/login').send({
              email: "Nag",
              password: "Nag"
  }).end(function(err, res) {
                expect(res.statusCode).to.be.equal(400);
                done();
            });
        });
    });
});