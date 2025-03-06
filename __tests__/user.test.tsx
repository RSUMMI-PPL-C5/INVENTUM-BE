import request from 'supertest';

process.env.PROD_CLIENT_URL = 'http://allowed.com';

import server from '../src/index';

afterAll((done) => {
  server.close(done);
});

describe('User Tests', () => {
  it('GET /users should return success', async () => {
    const response = await request(server).get('/user');
    expect(response.status).toBe(200);
  });

  it('GET /users should return an array of users', async () => {
    const response = await request(server).get('/user');
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('User Tests by ID', () => {

  const id = '118d1af8-2a23-4d4c-abe1-36f90850e22f';
  const fakeId = '1';

  it('GET /users/:id should return success', async () => {
    const response = await request(server).get(`/user/${id}`);
    expect(response.status).toBe(200);
  });

  it('GET /users/:id should return a user', async () => {
    const response = await request(server).get(`/user/${id}`);
    expect(response.body).toBeInstanceOf(Object);
  });

  it ('GET /users/:id should return a user with the wrong id', async () => {
    const response = await request(server).get(`/user/${fakeId}`);
    expect(response.status).toBe(404);
  });
});