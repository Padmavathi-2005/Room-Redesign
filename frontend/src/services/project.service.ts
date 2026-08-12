const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface RoomData {
  _id: string;
  id?: string;
  projectId?: string;
  name: string;
  roomType: string;
  materials?: string[];
  originalImage?: string;
  coverImage?: string;
  imageCount?: number;
  generatedImage?: string;
  toolSlug?: string;
  theme?: string;
  colorPalette?: string;
  lighting?: string;
  customInstructions?: string;
  prompt?: string;
  manusChatId?: string;
  status?: string;
  createdAt?: string;
}

export interface DesignThemeData {
  style?: string;
  primaryColors?: string[];
  secondaryColors?: string[];
  accentColors?: string[];
  materials?: string[];
  lighting?: string;
  furnitureStyle?: string;
  decorStyle?: string;
  flooring?: string;
  metalFinish?: string;
}

export interface ProjectData {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  theme: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  coverImage?: string;
  designTheme?: DesignThemeData | any;
  colorPalette?: string;
  lighting?: string;
  manusChatId?: string;
  rooms?: RoomData[] | any[];
  totalRooms?: number;
  totalGeneratedImages?: number;
  keywords?: string;
  customInstructionsSummary?: string;
  status?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export const projectService = {
  async getProjects(token?: string): Promise<ProjectData[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/projects`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch projects from backend:', err);
      return [];
    }
  },

  async getProject(id: string, token?: string): Promise<ProjectData | null> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/projects/${id}`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch project ${id}:`, err);
      return null;
    }
  },

  async getAllRooms(): Promise<RoomData[]> {
    try {
      const res = await fetch(`${API_URL}/rooms`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch rooms:', err);
      return [];
    }
  },

  async createProject(data: { name: string; theme: string; description?: string; colorPalette?: string; lighting?: string }, token?: string): Promise<ProjectData> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create project');
    }
    
    return res.json();
  },

  async deleteProject(id: string, token?: string): Promise<boolean> {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.ok;
  },

  async createRoom(projectId: string, data: { name: string; roomType: string; materials?: string[]; originalImage?: string }, token?: string): Promise<RoomData> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/projects/${projectId}/rooms`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create room in project');
    }

    return res.json();
  },

  async getProjectRooms(projectId: string, token?: string): Promise<RoomData[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/projects/${projectId}/rooms`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch rooms for project ${projectId}:`, err);
      return [];
    }
  },

  async getProjectGenerations(projectId: string, token?: string): Promise<any[]> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/projects/${projectId}/generations`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch generations for project ${projectId}:`, err);
      return [];
    }
  },

  async getRoomConversation(projectId: string, roomId: string, token?: string): Promise<any> {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/projects/${projectId}/rooms/${roomId}/conversation`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch conversation for room ${roomId}:`, err);
      return null;
    }
  },
};
