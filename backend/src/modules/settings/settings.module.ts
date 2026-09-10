import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schemas/setting.schema';
import { Currency, CurrencySchema } from './schemas/currency.schema';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Setting.name, schema: SettingSchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  controllers: [SettingsController, CurrenciesController],
  providers: [SettingsService, CurrenciesService],
  exports: [SettingsService, CurrenciesService],
})
export class SettingsModule {}

