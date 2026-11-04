// components/layout/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // 👈 Añadimos useCallback
import { Bell, Check } from "lucide-react";
import { useSession } from "next-auth/react";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 👈 Envolvemos la función en useCallback
  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  }, [session]); // Depende de la sesión

  // Polling seguro para React 19
  useEffect(() => {
    if (!session?.user) return;

    const timeout = setTimeout(() => {
      fetchNotifications();
    }, 100);

    const interval = setInterval(fetchNotifications, 60000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNotifications, session]); // 👈 Ahora incluimos fetchNotifications

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-set-surface border border-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-set-surface border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAsRead}
                className="text-[10px] text-orange-500 hover:text-orange-400 flex items-center gap-1 font-bold"
              >
                <Check className="w-3 h-3" /> Marcar leídas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-xs text-gray-500 text-center">No tienes notificaciones aún.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-gray-800/50 text-xs ${
                    notif.read ? "text-gray-500" : "text-gray-300 bg-orange-500/5"
                  }`}
                >
                  <p>{notif.message}</p>
                  <span className="text-[9px] text-gray-600 mt-1 block">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
