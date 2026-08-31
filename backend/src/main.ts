import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { json, urlencoded } from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure large payload limits for Base64 image uploads and keep raw body for webhook verification
  app.use(
    json({
      limit: '50mb',
      verify: (req: any, res, buf) => {
        if (req.originalUrl && req.originalUrl.includes('/payments/webhook')) {
          req.rawBody = buf;
        }
      },
    }),
  );
  app.use(urlencoded({ limit: '50mb', extended: true }));

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

  const preferredPort = parseInt(process.env.PORT || '5001', 10);
  let port = preferredPort;
  let started = false;

  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await app.listen(port);
      started = true;
      break;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} is in use, attempting port ${port + 1}...`);
        port += 1;
      } else {
        throw err;
      }
    }
  }

  if (started) {
    console.log(`🚀 RoomAI NestJS Server running at http://localhost:${port}/api/v1`);
  }
}
bootstrap();
