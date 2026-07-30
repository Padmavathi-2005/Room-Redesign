const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface GenerateRoomPayload {
  imageUrl: string;
  roomType: string;
  designStyle: string;
  additionalPrompt?: string;
}

export const aiService = {
  async generateRoom(payload: GenerateRoomPayload, token: string) {
    const res = await fetch(`${API_URL}/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getJobStatus(jobId: string, token: string) {
    const res = await fetch(`${API_URL}/ai/status/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
