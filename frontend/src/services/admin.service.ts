const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const cleanUrl = envUrl.replace(/\/$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const getAuthHeaders = () => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('admin_token') || localStorage.getItem('token') || '';
    if (token) {
      token = token.replace(/^"(.*)"$/, '$1');
    }
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface AdminUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'USER';
  credits?: number;
  subscriptionTier?: string;
  projectCount?: number;
  roomCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProject {
  _id: string;
  id?: string;
  name: string;
  theme: string;
  description?: string;
  colorPalette?: string;
  userId?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  } | string;
  roomCount?: number;
  totalGeneratedImages?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminImage {
  _id: string;
  id?: string;
  roomType?: string;
  theme?: string;
  originalImage: string;
  generatedImage?: string;
  prompt?: string;
  materials?: string[];
  lighting?: string;
  customInstructions?: string;
  toolSlug?: string;
  userId?: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  projectId?: {
    _id: string;
    name: string;
    theme: string;
  };
  createdAt?: string;
}

export interface AdminModel {
  _id: string;
  slug: string;
  name: string;
  category: string;
  creditCost: number;
  description?: string;
  badge?: string;
  originalImage?: string;
  convertedImage?: string;
  supportedRoomTypes?: string[];
  supportedStyles?: string[];
  defaultPromptTemplate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalProjects: number;
  totalConvertedImages: number;
  recentUsers: AdminUser[];
  recentProjects: AdminProject[];
}

const handleApiResponse = async (res: Response, fallbackMessage: string) => {
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('admin_user');
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/admin';
    }
    throw new Error('Authentication token is invalid or expired. Please sign in again.');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || fallbackMessage);
  }
  const data = await res.json();
  return data.data !== undefined ? data.data : data;
};

export const adminService = {
  getOverviewStats: async (): Promise<AdminOverviewStats> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/overview`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res, 'Failed to fetch admin stats');
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/users`, {
      headers: getAuthHeaders(),
    });
    const data = await handleApiResponse(res, 'Failed to fetch admin users');
    return Array.isArray(data) ? data : [];
  },

  updateUser: async (
    userId: string,
    updateData: { role?: 'ADMIN' | 'USER'; credits?: number; subscriptionTier?: string },
  ): Promise<AdminUser> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleApiResponse(res, 'Failed to update user');
  },

  deleteUser: async (userId: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res, 'Failed to delete user');
  },

  getProjects: async (): Promise<AdminProject[]> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/projects`, {
      headers: getAuthHeaders(),
    });
    const data = await handleApiResponse(res, 'Failed to fetch admin projects');
    return Array.isArray(data) ? data : [];
  },

  deleteProject: async (projectId: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleApiResponse(res, 'Failed to delete project');
  },

  getConvertedImages: async (): Promise<AdminImage[]> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/images`, {
      headers: getAuthHeaders(),
    });
    const data = await handleApiResponse(res, 'Failed to fetch converted images');
    return Array.isArray(data) ? data : [];
  },

  getModels: async (): Promise<AdminModel[]> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/tools`, {
      headers: getAuthHeaders(),
    });
    const data = await handleApiResponse(res, 'Failed to fetch AI models');
    return Array.isArray(data) ? data : [];
  },

  updateModel: async (id: string, updateData: Partial<AdminModel>): Promise<AdminModel> => {
    const res = await fetch(`${getApiBaseUrl()}/admin/tools/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleApiResponse(res, 'Failed to update AI model');
  },

  uploadModelImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = getAuthHeaders();
    delete (headers as any)['Content-Type'];

    const res = await fetch(`${getApiBaseUrl()}/admin/tools/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleApiResponse(res, 'Failed to upload image file');
  },
};
