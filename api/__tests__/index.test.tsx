import request from 'supertest';
import server from '../index';

afterAll((done) => {
  server.close(done);
});

describe('API Tests', () => {
  it('GET / should return PPL C-5 DEPLOYED!!!', async () => {
    const response = await request(server).get('/');
    expect(response.text).toBe('PPL C-5 DEPLOYED!!!');
  });

  it('CORS should block requests from non-whitelisted origin', async () => {
    const response = await request(server).get('/').set('Origin', 'http://notallowed.com');
    expect(response.status).toBe(500);
  });

  it('CORS should allow requests with no origin', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
  });
});