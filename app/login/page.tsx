// app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react"; // 👈 Añadimos Eye y EyeOff
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 Estado para el ojito
  
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
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            refCode,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Error al registrarse");
        }

        toast.success("Cuenta creada. Iniciando sesión...");
        
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
              type={showPassword ? "text" : "password"} // 👈 Lógica del ojito
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-12 py-3 bg-set-bg border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="••••••••"
            />
            {/* 👈 Botón del Ojito */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* 👈 Enlace de olvidé contraseña (solo en login) */}
          {isLogin && (
            <div className="flex justify-end mt-2">
              <Link href="/forgot-password" className="text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          )}
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
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-set-bg p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <Suspense fallback={
        <div className="text-white flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          <p>Cargando...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
