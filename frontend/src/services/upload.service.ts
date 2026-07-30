const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const uploadService = {
  async getPresignedUploadUrl(fileName: string, fileType: string, token: string) {
    const res = await fetch(`${API_URL}/upload/presigned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fileName, fileType }),
    });
    return res.json();
  },
};
