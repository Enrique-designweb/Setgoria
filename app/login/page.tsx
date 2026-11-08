// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref"); // Captura el código de referido si viene de un enlace

  const [isLogin, setIsLogin] = useState(true); // Toggle entre Login y Registro
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // FLUJO DE INICIO DE SESIÓN
        const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("¡Bienvenido de vuelta!");
          router.push("/inicio");
          router.refresh();
        }
      } else {
        // FLUJO DE REGISTRO
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            refCode, // Pasamos el código de referido al backend
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error al registrarse");
        }

        toast.success("Cuenta creada. Iniciando sesión...");
        
        // Iniciamos sesión automáticamente después de registrar
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        
        router.push("/inicio");
        router.refresh();
      }
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-set-bg p-4 relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-set-surface border border-gray-800 p-8 rounded-3xl shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            SETGORIA
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isLogin ? "Ingresa a tu cuenta" : "Crea una cuenta nueva"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-set-bg border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-set-bg border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="tu@correo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-set-bg border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Iniciar Sesión" : "Registrarse")}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Toggle Login/Registro */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? (
              <>¿No tienes cuenta? <span className="text-orange-500 font-bold">Regístrate aquí</span></>
            ) : (
              <>¿Ya tienes cuenta? <span className="text-orange-500 font-bold">Inicia Sesión</span></>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
