const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async register(payload: RegisterPayload) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getCurrentUser(token: string) {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
