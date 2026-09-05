import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplica automáticamente los decoradores de class-validator (@IsEmail, etc.)
  // a cada request que llegue, en todos los controllers.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // borra cualquier campo que no esté declarado en el DTO
      forbidNonWhitelisted: true, // y si llega un campo extra, rechaza el request en vez de solo ignorarlo
      transform: true, // convierte el JSON crudo a una instancia real de la clase DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
