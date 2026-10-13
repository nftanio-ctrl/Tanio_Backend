import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  
  const port = Number(process.env.PORT) || 3000;
  
  app.enableCors();

  await app.listen(port, '0.0.0.0');
  console.log(`Server listening on http://localhost:${port}`);
}

bootstrap();