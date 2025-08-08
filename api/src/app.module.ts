import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { SchedulesModule } from './schedules/schedules.module';
import { User } from './users/entities/user.entity';
import { TimeEntry } from './time-entries/entities/time-entry.entity';
import { Schedule } from './schedules/entities/schedule.entity';
import { RateLimitMiddleware, AuthRateLimitMiddleware } from './common/middleware/rate-limit';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [User, TimeEntry, Schedule],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TimeEntriesModule,
    SchedulesModule,
  ],
  providers: [RateLimitMiddleware, AuthRateLimitMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Rate limiting geral
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('*');
    
    // Rate limiting específico para login
    consumer
      .apply(AuthRateLimitMiddleware)
      .forRoutes('auth/login')}};