import request from 'supertest';
import express from 'express';
import { healthRouter } from '../health';

const app = express();
app.use('/api/health', healthRouter);

describe('Health Router', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        service: 'enterprise-search-backend',
        version: '1.0.0',
        timestamp: expect.any(String),
        environment: expect.any(String),
      });

      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return correct environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.environment).toBe('test');

      process.env.NODE_ENV = originalEnv;
    });

    it('should default to development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.environment).toBe('development');

      process.env.NODE_ENV = originalEnv;
    });
  });
});