import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

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
    }),
  );

  app.setGlobalPrefix('api'); // app.setGlobalPrefix('api') tells NestJS to add the same prefix to every route in your application.

  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Food Delivery API')
      .setDescription('Auth and business APIs for the food delivery platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, config));
  }

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Server is running on port ${port}`);
  if (configService.get<string>('NODE_ENV') !== 'production') logger.log(`Swagger docs available at /docs`);
}

bootstrap();
