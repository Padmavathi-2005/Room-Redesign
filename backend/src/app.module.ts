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
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AdminModule } from './modules/admin/admin.module';
import { RoomsModule } from './rooms/rooms.module';
import { RoomTypesModule } from './modules/room-types/room-types.module';
import { DesignStylesModule } from './modules/design-styles/design-styles.module';
import { ColorPalettesModule } from './modules/color-palettes/color-palettes.module';
import { MoodsModule } from './modules/moods/moods.module';
import { BudgetLevelsModule } from './modules/budget-levels/budget-levels.module';
import { AiToolsModule } from './modules/ai-tools/ai-tools.module';
import { ProductsModule } from './modules/products/products.module';
import { RoofTypesModule } from './modules/roof-types/roof-types.module';
import { LightingModule } from './modules/lighting/lighting.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { TimeOfDayModule } from './modules/time-of-day/time-of-day.module';
import { QueueModule } from './queue/queue.module';
import { ProviderManagerModule } from './modules/provider-manager/provider-manager.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { CmsModule } from './modules/cms/cms.module';
import { ImageProcessingModule } from './image-processing/image-processing.module';
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
    SubscriptionModule,
    AdminModule,
    RoomsModule,
    RoomTypesModule,
    DesignStylesModule,
    ColorPalettesModule,
    MoodsModule,
    BudgetLevelsModule,
    AiToolsModule,
    ProductsModule,
    RoofTypesModule,
    LightingModule,
    EnvironmentModule,
    TimeOfDayModule,
    QueueModule,
    ProviderManagerModule,
    MarketplaceModule,
    CmsModule,
    ImageProcessingModule,
  ],
})
export class AppModule {}

