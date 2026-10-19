import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.constants.js';

const CONNECT_TIMEOUT_MS = 3000;

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const logger = new Logger('RedisClient');
        const client = new Redis({
          host: config.getOrThrow<string>('redis.host'),
          port: config.getOrThrow<number>('redis.port'),
          password: config.get<string>('redis.password'),
          connectTimeout: CONNECT_TIMEOUT_MS,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
        });

        client.on('error', (error: Error) => {
          logger.error(`Redis connection error: ${error.message}`, error.stack);
        });

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
