const request = require('supertest');
const { expect } = require('chai');

process.env.JWT_SECRET = 'test_secret';
process.env.PORT = '5003';

const app = require('../../backend/server');

// Menu routes are under active development.
describe('GET / – API health check', () => {
  it('should return 200 and confirm the API is running', async () => {
    const res = await request(app).get('/');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'SIT725 QR App API is running');
  });
});
