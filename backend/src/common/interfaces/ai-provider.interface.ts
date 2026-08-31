export interface WorkflowStepItem {
  id: 'direction' | 'source' | 'generate' | 'review' | 'deliver';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ImageGenerationInput {
  prompt: string;
  negativePrompt?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
  imageUrl?: string; // Saved file URL (e.g. relative path /uploads/...)
  chatId?: string; // Manus AI session / conversation thread ID
  projectId?: string;
  options?: Record<string, any>;
  onProgress?: (progressData: { statusText: string; steps: WorkflowStepItem[] }) => void;
}

export interface ImageGenerationOutput {
  imageBuffer?: Buffer;
  imageUrl: string;
  generatedImages?: string[];
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
