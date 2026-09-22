/**
 * E2E smoke tests for the HTTP surface.
 *
 * Previously this file was the untouched Nest scaffold: it booted the whole
 * AppModule (requiring a live DATABASE_URL and a production JWT_SECRET) and
 * asserted `GET /` → "Hello World!", a route this app does not have (it uses the
 * global `api` prefix). It could never pass.
 *
 * These tests intentionally mount only the root controller so they stay
 * hermetic — no database, no Redis, no outbound calls.
 */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigService } from '@nestjs/config';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('HTTP surface (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts so the tested paths match production.
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns a healthy payload', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.body.timestamp).toBeDefined();
  });

  it('does not expose an unprefixed root route', async () => {
    await request(app.getHttpServer()).get('/').expect(404);
  });
});
