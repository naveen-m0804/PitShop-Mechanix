import api from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  requestId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: Notification | Notification[] | number;
}

class NotificationAPI {
  // Get all notifications for the current user
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get<NotificationResponse>('/notifications');
    return response.data.data as Notification[];
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const response = await api.get<NotificationResponse>('/notifications/unread-count');
    return response.data.data as number;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }
}

export default new NotificationAPI();
