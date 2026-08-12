import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lighting, LightingSchema } from './schemas/lighting.schema';
import { LightingService } from './lighting.service';
import { LightingController } from './lighting.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lighting.name, schema: LightingSchema }]),
  ],
  controllers: [LightingController],
  providers: [LightingService],
  exports: [LightingService, MongooseModule],
})
export class LightingModule {}
