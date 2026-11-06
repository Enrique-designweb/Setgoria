// app/(dashboard)/configuracion/page.tsx
"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Bell, Moon, Sun, KeyRound } from "lucide-react";
import { toast } from "sonner";
import PushNotificationButton from "@/components/ui/PushNotificationButton"; // 👈 Importamos

export default function ConfiguracionPage() {
  const { theme, setTheme } = useTheme();
  const [emailAlerts, setEmailAlerts] = useState(false);

  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passStatus, setPassStatus] = useState({ loading: false });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus({ loading: true });

    if (passData.newPassword !== passData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      setPassStatus({ loading: false });
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("¡Contraseña actualizada con éxito!");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al cambiar");
    } finally {
      setPassStatus({ loading: false });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto text-set-text pb-24">
      <h1 className="text-3xl font-black italic text-orange-500 uppercase mb-8">Configuración</h1>

      <div className="bg-set-surface border border-set-border rounded-2xl p-6 md:p-8 space-y-10">
        
        {/* 1. Apariencia */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-orange-500" /> Apariencia
          </h2>
          <div className="bg-set-bg p-4 rounded-xl border border-set-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Tema de la aplicación</p>
              <p className="text-xs text-set-muted">Elige el nivel de contraste que prefieras.</p>
            </div>
            <div className="flex bg-set-surface p-1 rounded-lg border border-set-border">
              <button onClick={() => setTheme("theme-confort")} className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-xs font-bold ${theme === 'theme-confort' ? 'bg-orange-500 text-white' : 'text-set-muted hover:text-white'}`}>
                <Sun className="w-4 h-4" /> Confort
              </button>
              <button onClick={() => setTheme("theme-oled")} className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-xs font-bold ${theme === 'theme-oled' ? 'bg-orange-500 text-white' : 'text-set-muted hover:text-white'}`}>
                <Moon className="w-4 h-4" /> OLED
              </button>
            </div>
          </div>
        </section>

        {/* 2. Seguridad */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-orange-500" /> Seguridad
          </h2>
          <form onSubmit={handlePasswordChange} className="bg-set-bg p-5 rounded-xl border border-set-border space-y-4">
            <h3 className="text-sm font-bold text-set-text mb-2">Cambiar Contraseña</h3>
            
            <div>
              <label className="text-[10px] font-bold text-set-muted uppercase">Contraseña Actual</label>
              <input type="password" required value={passData.currentPassword} onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                className="w-full mt-1 bg-set-surface border border-set-border rounded-lg p-3 text-sm text-set-text focus:border-orange-500 outline-none" />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-set-muted uppercase">Nueva Contraseña</label>
                <input type="password" required minLength={8} value={passData.newPassword} onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  className="w-full mt-1 bg-set-surface border border-set-border rounded-lg p-3 text-sm text-set-text focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-set-muted uppercase">Confirmar Nueva</label>
                <input type="password" required minLength={8} value={passData.confirmPassword} onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  className="w-full mt-1 bg-set-surface border border-set-border rounded-lg p-3 text-sm text-set-text focus:border-orange-500 outline-none" />
              </div>
            </div>

            <button type="submit" disabled={passStatus.loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-sm transition-all active:scale-95 disabled:opacity-50">
              {passStatus.loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
        </section>

        {/* 3. Notificaciones */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-500" /> Notificaciones
          </h2>
          <div className="space-y-3">
            {/* 👈 AQUÍ INTEGRAMOS EL BOTÓN PUSH REAL */}
            <PushNotificationButton />

            <div className="flex items-center justify-between bg-set-bg p-4 rounded-xl border border-set-border">
              <div>
                <p className="font-bold text-sm">Correos Informativos</p>
                <p className="text-xs text-set-muted">Resumen semanal y avisos de vencimiento.</p>
              </div>
              <button onClick={() => setEmailAlerts(!emailAlerts)} className={`w-12 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-orange-500' : 'bg-gray-700'}`}>
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${emailAlerts ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
