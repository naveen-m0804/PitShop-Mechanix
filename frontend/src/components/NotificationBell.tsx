import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Navigate to request details if there's a requestId
    if (notification.requestId) {
      navigate('/my-requests');
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-white/20 z-[91] max-h-96 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.filter(n => !n.isRead).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
