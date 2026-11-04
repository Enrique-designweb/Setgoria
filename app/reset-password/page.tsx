// app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react"; // 👈 Quitamos useEffect
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) return setError("Enlace inválido o incompleto.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar");

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) { // 👈 Corregido de any a unknown
      if (err instanceof Error) setError(err.message);
      else setError("Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Contraseña actualizada!</h2>
        <p className="text-gray-400 text-sm">Redirigiendo al inicio de sesión...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="bg-orange-500/10 p-4 rounded-xl flex items-center justify-center gap-2 mb-2">
        <KeyRound className="w-5 h-5 text-orange-500" />
        <p className="text-xs text-orange-400 font-medium text-center truncate">Creando nueva contraseña para <strong>{email}</strong></p>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase">Nueva Contraseña</label>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            className="w-full bg-set-bg border border-gray-700 rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

      <button type="submit" disabled={loading} className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors">
        {loading ? "Guardando..." : "Guardar Nueva Contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-set-bg p-4">
      <div className="w-full max-w-md bg-set-surface border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 p-2 rounded-xl mb-4">
            <Zap className="text-white w-8 h-8 fill-white" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white">Nueva Contraseña</h1>
        </div>
        <Suspense fallback={<p className="text-center text-gray-500">Cargando...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
