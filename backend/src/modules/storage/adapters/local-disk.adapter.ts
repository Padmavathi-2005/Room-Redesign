import { Injectable, Logger } from '@nestjs/common';
import { IStorageAdapter } from '../../../common/interfaces/storage-adapter.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalDiskAdapter implements IStorageAdapter {
  private readonly logger = new Logger(LocalDiskAdapter.name);
  private readonly uploadRootDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureDirectoryExists(this.uploadRootDir);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async save(buffer: Buffer, relativePath: string, mimeType: string): Promise<string> {
    const fullPath = path.join(this.uploadRootDir, relativePath);
    this.ensureDirectoryExists(path.dirname(fullPath));
    
    await fs.promises.writeFile(fullPath, buffer);
    this.logger.log(`File saved locally: ${fullPath}`);

    // Return the relative URL served statically by NestJS (under /uploads/)
    const normalizedRelativePath = relativePath.replace(/\\/g, '/');
    return `/uploads/${normalizedRelativePath}`;
  }

  async retrieve(relativePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadRootDir, relativePath);
    return fs.promises.readFile(fullPath);
  }

  async delete(relativePath: string): Promise<void> {
    const fullPath = path.join(this.uploadRootDir, relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
      this.logger.log(`File deleted: ${fullPath}`);
    }
  }
}
