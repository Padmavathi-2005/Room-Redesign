export interface IStorageAdapter {
  save(buffer: Buffer, relativePath: string, mimeType: string): Promise<string>;
  retrieve(relativePath: string): Promise<Buffer>;
  delete(relativePath: string): Promise<void>;
}
