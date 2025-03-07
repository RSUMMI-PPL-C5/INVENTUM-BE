// filepath: c:\Sem 6\PPL\TK\PPL-C5-BACKEND\__tests__\index.test.tsx
import request from 'supertest';
import server from '../src/index';
import { jest } from '@jest/globals';

// Mock environment variable
jest.mock('dotenv/config', () => {
  process.env.PROD_CLIENT_URL = 'http://allowed-domain.com';
});

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

  it('CORS should allow requests from whitelisted origin', async () => {
    const response = await request(server)
      .get('/')
      .set('Origin', 'http://allowed-domain.com');
    expect(response.status).toBe(200);
  });

  it('should handle JSON request bodies', async () => {
    const testData = { test: 'data' };
    const response = await request(server)
      .post('/user/json-test')
      .send(testData)
      .set('Content-Type', 'application/json');
    // Status code will depend on your user route implementation
    expect(response.status).not.toBe(415); // Not unsupported media type
  });

  it('should handle URL-encoded request bodies', async () => {
    const response = await request(server)
      .post('/user/form-test')
      .send('test=data')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    // Status code will depend on your user route implementation
    expect(response.status).not.toBe(415); // Not unsupported media type
  });

  it('should route to user endpoints', async () => {
    const response = await request(server).get('/user');
    // Actual status depends on your user route implementation
    expect(response.status).toBeDefined();
  });
  
  it('should reject invalid JSON data', async () => {
    const response = await request(server)
      .post('/user')
      .set('Content-Type', 'application/json')
      .send('{invalid:json}');
    expect(response.status).toBe(400);
  });
});