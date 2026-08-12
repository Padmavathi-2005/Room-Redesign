export interface PreprocessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  stripMetadata?: boolean;
  forceFormat?: 'jpeg' | 'png' | 'webp';
}

export interface IImagePreprocessor {
  validate(buffer: Buffer, mimeType: string): Promise<void>;
  process(
    buffer: Buffer,
    options: PreprocessOptions,
  ): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
    mimeType: string;
  }>;
}
