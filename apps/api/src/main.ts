import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { buildSecurityHeaders } from './common/security-headers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Security headers + no framework fingerprinting.
  app.use((_req: unknown, res: any, next: () => void) => {
    for (const [name, value] of Object.entries(
      buildSecurityHeaders({ isProduction }),
    )) {
      res.setHeader(name, value);
    }
    next();
  });
  app.getHttpAdapter().getInstance()?.disable?.('x-powered-by');
  app.useGlobalFilters(new AllExceptionsFilter());

  // Trust proxy for correct X-Forwarded-For / req.ip behind nginx/vercel.
  //
  // SECURITY: this must be opt-in. Enabling it unconditionally lets any direct
  // client spoof X-Forwarded-For and therefore spoof req.ip, which defeats
  // IP-based rate limiting (login/OTP brute force). Set TRUST_PROXY to the
  // number of trusted hops (e.g. "1") or a comma-separated CIDR list when the
  // API really is behind a proxy that overwrites the header.
  const trustProxy = configService.get<string>('TRUST_PROXY');
  const httpAdapter = app.getHttpAdapter();
  const expressInstance = httpAdapter.getInstance();
  if (expressInstance?.set && trustProxy) {
    const numericHops = Number(trustProxy);
    const value =
      trustProxy === 'true'
        ? 1
        : Number.isInteger(numericHops) && numericHops >= 0
          ? numericHops
          : trustProxy
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean);
    expressInstance.set('trust proxy', value);
  }

  const allowedOrigins = [
    configService.get<string>('FRONTEND_URL_WEB'),
    configService.get<string>('FRONTEND_URL_IP'),
  ].filter((origin): origin is string => Boolean(origin));
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  app.setGlobalPrefix('api'); // app.setGlobalPrefix('api') tells NestJS to add the same prefix to every route in your application.

  // Swagger is opt-in: local development only, or explicitly via ENABLE_SWAGGER.
  // Previously any non-"production" value (e.g. a stale or misspelled NODE_ENV on
  // a deployed environment) exposed the whole API map.
  const nodeEnv = configService.get<string>('NODE_ENV');
  const swaggerEnabled =
    configService.get<string>('ENABLE_SWAGGER') === 'true' ||
    !nodeEnv ||
    nodeEnv === 'development';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Food Delivery API')
      .setDescription('Auth and business APIs for the food delivery platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, () =>
      SwaggerModule.createDocument(app, config),
    );
  }

  const port = configService.get<number>('PORT') || 3000;

  try {
    await app.listen(port);
  } catch (err: any) {
    if (err?.code === 'EADDRINUSE') {
      const logger = new Logger('Bootstrap');
      logger.error(`Port ${port} already in use (EADDRINUSE).`);
      logger.error(
        `Run: lsof -ti:${port} | xargs kill -9  OR  fuser -k ${port}/tcp`,
      );
      logger.error(`Then: pnpm --filter api start:dev`);
      process.exit(1);
    }
    throw err;
  }
  const logger = new Logger('Bootstrap');
  logger.log(`Server is running on port ${port}`);
  if (swaggerEnabled) logger.log(`Swagger docs available at /docs`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
