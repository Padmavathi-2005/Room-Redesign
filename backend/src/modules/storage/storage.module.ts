import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalDiskAdapter } from './adapters/local-disk.adapter';
import { S3Adapter } from './adapters/s3.adapter';

@Module({
  providers: [StorageService, LocalDiskAdapter, S3Adapter],
  exports: [StorageService],
})
export class StorageModule {}
