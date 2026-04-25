const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

// Set required env vars before importing the app
process.env.JWT_SECRET = 'test_secret';
process.env.PORT = '5002';

const app = require('../../backend/server');
const authService = require('../../backend/services/authService');

describe('POST /api/auth/register', () => {
  afterEach(() => sinon.restore());

  it('should return 201 and the new user on successful registration', async () => {
    const fakeUser = { _id: 'abc123', name: 'John', email: 'john@test.com', role: 'owner', status: 'pending' };
    sinon.stub(authService, 'registerOwner').resolves(fakeUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@test.com', password: 'password123' });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.equal(true);
    expect(res.body.user).to.have.property('email', 'john@test.com');
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'john@test.com', password: 'password123' });

    expect(res.status).to.equal(400);
    expect(res.body.success).to.equal(false);
    expect(res.body.message).to.equal('Name, email, and password are required');
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', password: 'password123' });

    expect(res.status).to.equal(400);
    expect(res.body.success).to.equal(false);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@test.com' });

    expect(res.status).to.equal(400);
    expect(res.body.success).to.equal(false);
  });

  it('should return 409 when the email is already registered', async () => {
    sinon.stub(authService, 'registerOwner').rejects(new Error('Email already registered'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@test.com', password: 'password123' });

    expect(res.status).to.equal(409);
    expect(res.body.success).to.equal(false);
    expect(res.body.message).to.equal('Email already registered');
  });

  it('should return 400 when the request body is completely empty', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body.success).to.equal(false);
  });
});

describe('POST /api/auth/login', () => {
  afterEach(() => sinon.restore());

  it('should return 200 and a token on successful login', async () => {
    const fakeResult = {
      token: 'fake.jwt.token',
      user: { _id: 'abc123', name: 'John', email: 'john@test.com', role: 'owner', status: 'approved' },
    };
    sinon.stub(authService, 'loginUser').resolves(fakeResult);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com', password: 'password123' });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.equal(true);
    expect(res.body).to.have.property('token');
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' });

    expect(res.status).to.equal(400);
    expect(res.body.success).to.equal(false);
    expect(res.body.message).to.equal('Email and password are required');
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@test.com' });

    expect(res.status).to.equal(400);
    expect(res.body.success).to.equal(false);
  });

  it('should return 401 when credentials are invalid', async () => {
    sinon.stub(authService, 'loginUser').rejects(new Error('Invalid email or password'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpassword' });

    expect(res.status).to.equal(401);
    expect(res.body.success).to.equal(false);
    expect(res.body.message).to.equal('Invalid email or password');
  });

  it('should return 403 when the account is not yet approved', async () => {
    sinon.stub(authService, 'loginUser').rejects(new Error('Account is not approved'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pending@test.com', password: 'password123' });

    expect(res.status).to.equal(403);
    expect(res.body.success).to.equal(false);
    expect(res.body.message).to.equal('Account is not approved');
  });
});
