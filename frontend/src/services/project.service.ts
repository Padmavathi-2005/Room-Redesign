const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const projectService = {
  async getProjects(token: string) {
    const res = await fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async createProject(name: string, token: string) {
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },
};
