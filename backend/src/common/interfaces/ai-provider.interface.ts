export interface WorkflowStepItem {
  id: 'direction' | 'source' | 'generate' | 'review' | 'deliver';
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ImageGenerationInput {
  userId?: string;
  prompt: string;
  negativePrompt?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
  imageUrl?: string; // Saved file URL (e.g. relative path /uploads/...)
  originalImageUrl?: string; // Public remote image URL (e.g. Unsplash CDN URL)
  manusTaskId?: string; // Persistent Manus AI Task ID for thread continuity
  chatId?: string; // Legacy alias for Manus AI session / conversation thread ID
  projectId?: string;
  generationId?: string; // RoomAI generation correlation ID
  existingImageUrls?: string[]; // Array of previously generated image URLs to ignore during message parsing
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
  manusTaskId?: string; // Authoritative Manus AI Task ID
  chatId?: string; // Legacy alias
  isNewTask?: boolean; // True if task.create was called, false if task.sendMessage was called
}

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput>;
  isHealthy(): Promise<boolean>;
}
