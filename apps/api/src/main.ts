import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      configService.get<string>('FRONTEND_URL_WEB'),
      configService.get<string>('FRONTEND_URL_IP'),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.setGlobalPrefix('api'); // app.setGlobalPrefix('api') tells NestJS to add the same prefix to every route in your application.

  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}

bootstrap();
