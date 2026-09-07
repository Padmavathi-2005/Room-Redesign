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
  creditsCost?: number;
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

  async getUserWishlist(userId: string): Promise<PublishedProjectData[]> {
    try {
      const res = await fetch(`${API_URL}/marketplace/wishlist?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch wishlist from API:', err);
    }

    // Local storage fallback for offline / guest mode
    try {
      const storedIds: string[] = JSON.parse(localStorage.getItem('user_wishlist_ids') || '[]');
      const storedGenerated = JSON.parse(localStorage.getItem('user_generated_designs') || '[]');
      return (storedGenerated || []).filter((item: any) => storedIds.includes(item._id));
    } catch (e) {
      return [];
    }
  },

  async toggleWishlist(projectId: string, userId: string): Promise<{ wishlisted: boolean }> {
    let wishlisted = false;
    try {
      const storedIds: string[] = JSON.parse(localStorage.getItem('user_wishlist_ids') || '[]');
      if (storedIds.includes(projectId)) {
        const updated = storedIds.filter((id) => id !== projectId);
        localStorage.setItem('user_wishlist_ids', JSON.stringify(updated));
        wishlisted = false;
      } else {
        storedIds.push(projectId);
        localStorage.setItem('user_wishlist_ids', JSON.stringify(storedIds));
        wishlisted = true;
      }

      const res = await fetch(`${API_URL}/marketplace/${projectId}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.wishlisted === 'boolean') {
          return { wishlisted: data.wishlisted };
        }
      }
      return { wishlisted };
    } catch (err) {
      console.warn('Failed to sync wishlist with API:', err);
      return { wishlisted };
    }
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
