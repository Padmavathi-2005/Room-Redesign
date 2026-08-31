const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface ReviewItem {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

export interface PublishedProjectData {
  _id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  toolSlug: string;
  roomType: string;
  style?: string;
  sampleImageUrl: string;
  beforeImageUrl?: string;
  totalImageCount: number;
  tags?: string[];
  salesCount?: number;
  wishlistCount?: number;
  rating?: number;
  reviewCount?: number;
  reviews?: ReviewItem[];
  isWishlisted?: boolean;
  isLocked?: boolean;
  hasPurchased?: boolean;
  allImages?: string[];
  author?: {
    name?: string;
    avatarUrl?: string;
  };
  createdAt?: string | Date;
}

export const marketplaceService = {
  async getPublishedProjects(params?: {
    toolSlug?: string;
    roomType?: string;
    style?: string;
    userId?: string;
  }): Promise<PublishedProjectData[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.toolSlug) queryParams.append('toolSlug', params.toolSlug);
      if (params?.roomType && params.roomType !== 'All') queryParams.append('roomType', params.roomType);
      if (params?.style && params.style !== 'All') queryParams.append('style', params.style);
      if (params?.userId) queryParams.append('userId', params.userId);

      const res = await fetch(`${API_URL}/marketplace?${queryParams.toString()}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch published projects:', err);
      return [];
    }
  },

  async getPublishedProject(id: string, userId?: string): Promise<PublishedProjectData | null> {
    try {
      const queryParams = userId ? `?userId=${userId}` : '';
      const res = await fetch(`${API_URL}/marketplace/${id}${queryParams}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Failed to fetch published project ${id}:`, err);
      return null;
    }
  },

  async publishProject(data: {
    authorId: string;
    sourceProjectId?: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    toolSlug?: string;
    roomType: string;
    style?: string;
    sampleImageUrl: string;
    beforeImageUrl?: string;
    lockedImageUrls?: string[];
    originalImageUrl?: string;
    totalImageCount?: number;
    tags?: string[];
  }): Promise<PublishedProjectData> {
    const res = await fetch(`${API_URL}/marketplace/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to publish project');
    }

    return res.json();
  },

  async toggleWishlist(projectId: string, userId: string): Promise<{ wishlisted: boolean }> {
    const res = await fetch(`${API_URL}/marketplace/${projectId}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      return { wishlisted: false };
    }

    return res.json();
  },

  async addReview(
    projectId: string,
    reviewData: {
      userId: string;
      userName: string;
      userAvatar?: string;
      rating: number;
      comment: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_URL}/marketplace/${projectId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit review');
    }

    return res.json();
  },
};
