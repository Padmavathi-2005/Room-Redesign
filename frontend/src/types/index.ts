export interface RoomGenerationRequest {
  originalImage: string;
  roomType: string;
  theme: string;
  userPrompt?: string;
}

export interface RoomGenerationResponse {
  _id: string;
  originalImage: string;
  generatedImage: string;
  roomType: string;
  theme: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}
