import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Serve static uploaded files (uploads/original/ and uploads/generated/)
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable Global Exception Filter for standard error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global v1 API Prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 RoomAI NestJS Server running at http://localhost:${port}/api/v1`);
}
bootstrap();
