// app/(dashboard)/configuracion/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, KeyRound, CreditCard, Send, ShieldCheck, Download } from "lucide-react";
import { toast } from "sonner";
import PushNotificationButton from "@/components/ui/PushNotificationButton";
import InstallPWA from "@/components/ui/InstallPWA";

export default function ConfiguracionPage() {
  const { data: session } = useSession();
  
  // Estados para las notificaciones
  const [emailAlerts, setEmailAlerts] = useState(false);
  
  // Estados para la contraseña
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passStatus, setPassStatus] = useState({ loading: false });

  // Estados para KYC y Telegram
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [kycStatus, setKycStatus] = useState("NOT_SUBMITTED");

  // 👇 SOLUCIÓN: Usamos un useEffect para consultar el estado real del usuario
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          // Aquí usamos los setters para actualizar la UI
          setKycStatus(data.kycStatus || "NOT_SUBMITTED");
          setIsTelegramLinked(!!data.telegramId); 
        }
      } catch (err) {
        console.error("Error al cargar estado del usuario", err);
      }
    };
    fetchUserStatus();
  }, []);

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

      <div className="bg-set-surface border border-set-border rounded-2xl p-6 md:p-8 space-y-8">
        
        {/* 1. Cuenta, KYC y Telegram */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-orange-500" /> Mi Cuenta y Seguridad
          </h2>
          <div className="space-y-3">
            <Link href="/suscripcion" className="flex items-center justify-between bg-set-bg p-4 rounded-xl border border-set-border hover:bg-white/5 transition-colors">
              <div>
                <p className="font-bold text-sm">Mi Suscripción</p>
                <p className="text-xs text-set-muted">Renueva o cambia tu plan Premium</p>
              </div>
              <CreditCard className="w-5 h-5 text-orange-500" />
            </Link>

            <a href={`https://t.me/SetgoriaBot?start=${session?.user?.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-set-bg p-4 rounded-xl border border-set-border hover:bg-white/5 transition-colors">
              <div>
                <p className="font-bold text-sm">Vincular Telegram</p>
                <p className="text-xs text-set-muted">Recibe alertas y códigos de acceso</p>
              </div>
              {isTelegramLinked ? (
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">✅ Vinculado</span>
              ) : (
                <Send className="w-5 h-5 text-blue-500" />
              )}
            </a>

            <div className="flex items-center justify-between bg-set-bg p-4 rounded-xl border border-set-border">
              <div>
                <p className="font-bold text-sm">Verificación de Identidad (KYC)</p>
                <p className="text-xs text-set-muted">Valida tu Carnet de Identidad</p>
              </div>
              {kycStatus === "APPROVED" ? (
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">✅ Verificado</span>
              ) : kycStatus === "PENDING" ? (
                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">⏳ En revisión</span>
              ) : (
                <Link href="/perfil" className="text-xs font-bold text-orange-500 hover:underline">Completar</Link>
              )}
            </div>
          </div>
        </section>

        {/* 2. Seguridad (Contraseña) */}
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

        {/* 4. Instalar PWA */}
        <section>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-orange-500" /> Aplicación Móvil
          </h2>
          <div className="bg-set-bg p-4 rounded-xl border border-set-border">
            <p className="text-sm font-bold mb-1">Instala Setgoria</p>
            <p className="text-xs text-set-muted mb-3">Accede más rápido desde tu pantalla de inicio como una app nativa.</p>
            <InstallPWA />
          </div>
        </section>

      </div>
    </div>
  );
}
