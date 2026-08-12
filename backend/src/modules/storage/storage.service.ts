import { Injectable, Logger } from '@nestjs/common';
import { IStorageAdapter } from '../../common/interfaces/storage-adapter.interface';
import { LocalDiskAdapter } from './adapters/local-disk.adapter';
import { S3Adapter } from './adapters/s3.adapter';

@Injectable()
export class StorageService implements IStorageAdapter {
  private readonly logger = new Logger(StorageService.name);
  private activeAdapter: IStorageAdapter;

  constructor(
    private readonly localDiskAdapter: LocalDiskAdapter,
    private readonly s3Adapter: S3Adapter,
  ) {
    const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
    if (provider === 's3') {
      this.activeAdapter = this.s3Adapter;
      this.logger.log('Active Storage Provider: S3 (Mocked/Configurable)');
    } else {
      this.activeAdapter = this.localDiskAdapter;
      this.logger.log('Active Storage Provider: Local Disk');
    }
  }

  async save(buffer: Buffer, relativePath: string, mimeType: string): Promise<string> {
    return this.activeAdapter.save(buffer, relativePath, mimeType);
  }

  async retrieve(relativePath: string): Promise<Buffer> {
    return this.activeAdapter.retrieve(relativePath);
  }

  async delete(relativePath: string): Promise<void> {
    return this.activeAdapter.delete(relativePath);
  }
}
