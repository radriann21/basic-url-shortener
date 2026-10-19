import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { StandardSchemaValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useSecurityHeaders()
  app.enableCors({
    methods: ['POST', 'GET'],
    origin: '*'
  })

  app.useGlobalPipes(new StandardSchemaValidationPipe())

  await app.listen(config.getOrThrow<number>('port'));
}
await bootstrap();
