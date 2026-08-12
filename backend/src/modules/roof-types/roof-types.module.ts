import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoofType, RoofTypeSchema } from './schemas/roof-type.schema';
import { RoofTypesService } from './roof-types.service';
import { RoofTypesController } from './roof-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoofType.name, schema: RoofTypeSchema }]),
  ],
  controllers: [RoofTypesController],
  providers: [RoofTypesService],
  exports: [RoofTypesService, MongooseModule],
})
export class RoofTypesModule {}
