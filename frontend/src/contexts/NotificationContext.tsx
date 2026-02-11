import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationApi, { Notification } from '../services/notificationApi';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationApi.getNotifications(),
        notificationApi.getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error: any) {
      // Only log errors that are not authentication related (403/401)
      // to avoid console spam during polling
      if (error.response?.status !== 403 && error.response?.status !== 401) {
        console.error('Failed to fetch notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationApi.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert if API request fails
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert if API request fails
      fetchNotifications();
    }
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
