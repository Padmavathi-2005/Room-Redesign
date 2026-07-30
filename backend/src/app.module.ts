import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { AiModule } from './modules/ai/ai.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomTypesModule } from './modules/room-types/room-types.module';
import {
  databaseConfig,
  jwtConfig,
  cloudinaryConfig,
  redisConfig,
  aiConfig,
  mailConfig,
  appConfig,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        databaseConfig,
        jwtConfig,
        cloudinaryConfig,
        redisConfig,
        aiConfig,
        mailConfig,
        appConfig,
      ],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    ProjectsModule,
    UploadsModule,
    PromptModule,
    AiModule,
    PaymentsModule,
    RoomsModule,
    RoomTypesModule,
  ],
})
export class AppModule {}
