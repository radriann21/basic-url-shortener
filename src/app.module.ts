import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ThrottlerGuard,
  ThrottlerModule,
  type ThrottlerModuleOptions,
  type ThrottlerOptions,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { HealthModule } from './modules/health/health.module.js';
import { URLModule } from './modules/url/url.module.js';
import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        drizzle,
        connection: config.getOrThrow<string>('databaseUrl'),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: config.getOrThrow<ThrottlerOptions[]>('throttler'),
        storage: new ThrottlerStorageRedisService({
          host: config.getOrThrow<string>('redis.host'),
          port: config.getOrThrow<number>('redis.port'),
          password: config.get<string>('redis.password'),
        }),
      }),
    }),
    HealthModule,
    URLModule,
  ],
  controllers: [],
  providers: [
    {
      useClass: ThrottlerGuard,
      provide: APP_GUARD,
    },
  ],
})
export class AppModule {}
