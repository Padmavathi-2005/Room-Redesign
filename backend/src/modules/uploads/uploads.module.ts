import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaFile, MediaFileSchema } from './schemas/media-file.schema';
import { ProductTool, ProductToolSchema } from './schemas/product-tool.schema';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { StorageModule } from '../storage/storage.module';
import { PreprocessingModule } from '../preprocessing/preprocessing.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MediaFile.name, schema: MediaFileSchema },
      { name: ProductTool.name, schema: ProductToolSchema },
    ]),
    StorageModule,
    PreprocessingModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService, MongooseModule],
})
export class UploadsModule {}
