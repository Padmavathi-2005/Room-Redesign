import { Injectable, BadRequestException } from '@nestjs/common';
import { IImagePreprocessor, PreprocessOptions } from '../../common/interfaces/image-preprocessor.interface';
import sharp from 'sharp';

@Injectable()
export class PreprocessingService implements IImagePreprocessor {
  private readonly ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
  private readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

  async validate(buffer: Buffer, mimeType: string): Promise<void> {
    if (buffer.length > this.MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`Image size exceeds the maximum limit of 10MB (Size: ${(buffer.length / 1024 / 1024).toFixed(2)}MB)`);
    }

    try {
      const metadata = await sharp(buffer).metadata();
      if (!metadata.format || !this.ALLOWED_FORMATS.includes(metadata.format.toLowerCase())) {
        throw new BadRequestException(`Unsupported image format: ${metadata.format || 'unknown'}. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`);
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`Invalid image buffer or corrupted file: ${err.message}`);
    }
  }

  async process(
    buffer: Buffer,
    options: PreprocessOptions,
  ): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
    mimeType: string;
  }> {
    const maxWidth = options.maxWidth || 1024;
    const maxHeight = options.maxHeight || 1024;
    const quality = options.quality || 80;

    let transformer = sharp(buffer);
    const metadata = await transformer.metadata();

    // 1. Resize if image dimensions exceed maximum limits (maintaining aspect ratio)
    if (metadata.width && metadata.height && (metadata.width > maxWidth || metadata.height > maxHeight)) {
      transformer = transformer.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // 2. EXIF data is stripped by default unless .withMetadata() is explicitly called
    // 3. Format enforcement and quality compression
    const format = options.forceFormat || metadata.format || 'jpeg';
    const normalizedFormat = format.toLowerCase() === 'jpg' ? 'jpeg' : format.toLowerCase();

    if (normalizedFormat === 'png') {
      transformer = transformer.png({ quality });
    } else if (normalizedFormat === 'webp') {
      transformer = transformer.webp({ quality });
    } else {
      transformer = transformer.jpeg({ quality, mozjpeg: true });
    }

    const processedBuffer = await transformer.toBuffer();
    const finalMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      width: finalMetadata.width || 0,
      height: finalMetadata.height || 0,
      mimeType: `image/${finalMetadata.format === 'jpeg' ? 'jpeg' : finalMetadata.format}`,
    };
  }
}
