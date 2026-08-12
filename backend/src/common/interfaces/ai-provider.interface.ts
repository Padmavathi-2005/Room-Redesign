export interface ImageGenerationInput {
  prompt: string;
  negativePrompt?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
  imageUrl?: string; // Saved file URL (e.g. relative path /uploads/...)
  chatId?: string; // Manus AI session / conversation thread ID
  projectId?: string;
  options?: Record<string, any>;
}

export interface ImageGenerationOutput {
  imageBuffer?: Buffer;
  imageUrl: string;
  costUSD: number;
  providerName: string;
  modelName: string;
  chatId?: string; // Manus AI chat/session ID returned by provider
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput>;
  isHealthy(): Promise<boolean>;
}
