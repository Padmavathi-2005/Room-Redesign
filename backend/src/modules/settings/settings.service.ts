import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument, ThemeMode } from './schemas/setting.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectModel(Setting.name) private readonly settingModel: Model<SettingDocument>,
  ) {}

  /**
   * Application Startup Hook: Seed or update settings in DB with primary #2563eb & secondary #4f46e5
   */
  async onModuleInit() {
    try {
      const count = await this.settingModel.countDocuments();
      if (count === 0) {
        await this.settingModel.create({
          applicationName: 'RoomAI',
          activeTheme: ThemeMode.LIGHT,
          primaryColor: '#2563eb',
          secondaryColor: '#4f46e5',
          accentColor: '#06B6D4',
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
          borderRadius: 16,
          glassOpacity: 0.7,
          blurStrength: 20,
          maintenanceMode: false,
        });
        this.logger.log('✅ Default Settings Created with Primary #2563eb & Secondary #4f46e5');
      } else {
        await this.settingModel.updateOne(
          {},
          { $set: { primaryColor: '#2563eb', secondaryColor: '#4f46e5' } },
        );
        this.logger.log('✅ Settings Updated with Primary #2563eb & Secondary #4f46e5');
      }
    } catch (e) {
      this.logger.warn(`Settings DB initialization bypassed (${e.message})`);
    }
  }

  /**
   * Get application settings document
   */
  async getSettings(): Promise<SettingDocument> {
    let settings = await this.settingModel.findOne().exec();
    if (!settings) {
      settings = await this.settingModel.create({
        applicationName: 'RoomAI',
        activeTheme: ThemeMode.LIGHT,
        primaryColor: '#2563eb',
        secondaryColor: '#4f46e5',
        accentColor: '#06B6D4',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        borderRadius: 16,
        glassOpacity: 0.7,
        blurStrength: 20,
        maintenanceMode: false,
      });
    }
    return settings;
  }

  /**
   * Update application settings
   */
  async updateSettings(updateSettingsDto: UpdateSettingsDto): Promise<SettingDocument> {
    const settings = await this.getSettings();
    Object.assign(settings, updateSettingsDto);
    return settings.save();
  }
}
