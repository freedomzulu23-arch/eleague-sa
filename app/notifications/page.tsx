'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getNotifications, markAsRead, markAllAsRead, Notification } from '@/services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadNotifications(user.id);
      }
    };
    getUser();
  }, []);

  const loadNotifications = async (uid: string) => {
    setLoading(true);
    try {
      const data = await getNotifications(uid);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await markAllAsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-zinc-400 hover:text-white transition"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold">🔔 Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-xl text-zinc-400">No notifications yet</p>
            <p className="text-sm text-zinc-500 mt-2">You'll see notifications here when something happens.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl border transition ${
                  !notification.read
                    ? 'bg-zinc-900 border-blue-500/30'
                    : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        notification.type === 'success' ? 'text-green-400' :
                        notification.type === 'warning' ? 'text-yellow-400' :
                        notification.type === 'error' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {notification.type === 'success' ? '✅' :
                         notification.type === 'warning' ? '⚠️' :
                         notification.type === 'error' ? '❌' :
                         'ℹ️'}
                      </span>
                      <h3 className={`font-semibold ${
                        !notification.read ? 'text-white' : 'text-zinc-400'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-zinc-500 hover:text-blue-400 transition flex-shrink-0 mt-1"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}