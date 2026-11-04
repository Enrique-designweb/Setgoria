// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Error al procesar la solicitud");

      setSuccess(true);
    } catch { // 👈 Corregido: Sin paréntesis ni variable
      setError("Hubo un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-set-bg p-4">
        <div className="w-full max-w-md bg-set-surface border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-black italic text-white mb-2">Revisa tu correo</h1>
          <p className="text-gray-400 text-sm mb-6">
            Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-xs text-orange-500 font-bold bg-orange-500/10 p-2 rounded-lg mb-6">
            (Para pruebas locales: mira la terminal de VS Code para copiar el enlace)
          </p>
          <Link href="/login" className="text-gray-400 hover:text-white flex items-center justify-center gap-1 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-set-bg p-4">
      <div className="w-full max-w-md bg-set-surface border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 p-2 rounded-xl mb-4">
            <Zap className="text-white w-8 h-8 fill-white" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-white">Recuperar Contraseña</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Ingresa tu correo y te enviaremos un enlace seguro.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Correo Electrónico</label>
            <input
              type="email"
              required
              className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors">
            {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-gray-400 hover:text-white flex items-center justify-center gap-1 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
