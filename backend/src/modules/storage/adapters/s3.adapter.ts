import { Injectable, Logger } from '@nestjs/common';
import { IStorageAdapter } from '../../../common/interfaces/storage-adapter.interface';

@Injectable()
export class S3Adapter implements IStorageAdapter {
  private readonly logger = new Logger(S3Adapter.name);

  async save(buffer: Buffer, relativePath: string, mimeType: string): Promise<string> {
    const bucket = process.env.S3_BUCKET_NAME || 'room-redesign-bucket';
    const cleanPath = relativePath.replace(/\\/g, '/');
    const cdnUrl = `https://${bucket}.s3.amazonaws.com/${cleanPath}`;
    
    this.logger.log(`[MOCK S3] Saving ${cleanPath} to S3 bucket ${bucket}`);
    // In a real S3 production implementation, this would call AWS S3 Client:
    // await this.s3Client.send(new PutObjectCommand({ Bucket, Key, Body: buffer, ContentType: mimeType }));

    return cdnUrl;
  }

  async retrieve(relativePath: string): Promise<Buffer> {
    this.logger.log(`[MOCK S3] Retrieving ${relativePath} from S3`);
    return Buffer.from(''); // Stub return
  }

  async delete(relativePath: string): Promise<void> {
    this.logger.log(`[MOCK S3] Deleting ${relativePath} from S3`);
  }
}
