export interface NotificationItem {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'alert' | 'credit' | 'lead';
  isRead?: boolean;
  createdAt?: string;
  metadata?: Record<string, any>;
}

const getBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const getAuthHeaders = (isAdmin: boolean = false) => {
  const token = typeof window !== 'undefined'
    ? (isAdmin ? localStorage.getItem('admin_token') || localStorage.getItem('token') : localStorage.getItem('token'))
    : '';

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const notificationService = {
  // Get user notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${getBaseUrl()}/notifications/user`, {
      headers: getAuthHeaders(false),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Get admin notifications
  async getAdminNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${getBaseUrl()}/notifications/admin`, {
      headers: getAuthHeaders(true),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Mark single as read
  async markAsRead(id: string): Promise<boolean> {
    const res = await fetch(`${getBaseUrl()}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(false),
    });
    return res.ok;
  },

  // Mark all user notifications as read
  async markAllAsRead(): Promise<boolean> {
    const res = await fetch(`${getBaseUrl()}/notifications/user/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(false),
    });
    return res.ok;
  },

  // Mark all admin notifications as read
  async markAllAdminAsRead(): Promise<boolean> {
    const res = await fetch(`${getBaseUrl()}/notifications/admin/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(true),
    });
    return res.ok;
  },

  // Broadcast announcement
  async broadcastAnnouncement(title: string, message: string): Promise<boolean> {
    const res = await fetch(`${getBaseUrl()}/notifications/broadcast`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ title, message }),
    });
    return res.ok;
  },
};
