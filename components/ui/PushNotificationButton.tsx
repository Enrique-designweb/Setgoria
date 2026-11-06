// components/ui/PushNotificationButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permiso de notificaciones denegado");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setIsSubscribed(true);
      toast.success("¡Notificaciones activadas!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Error al activar notificaciones");
    }
  };

  if (isSubscribed) return (
    <div className="flex items-center gap-2 text-xs text-green-500 font-bold bg-green-500/10 p-3 rounded-lg">
      <Bell className="w-4 h-4" /> Notificaciones Push Activadas
    </div>
  );

  return (
    <button onClick={subscribe} className="flex items-center gap-3 bg-set-surface border border-orange-500/30 p-4 rounded-xl w-full active:scale-95 transition-all">
      <Bell className="w-5 h-5 text-orange-500" />
      <span className="font-bold text-sm text-orange-500">Activar Notificaciones Push</span>
    </button>
  );
}
