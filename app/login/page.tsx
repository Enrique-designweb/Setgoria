// app/login/page.tsx
"use client";

import { useState, Suspense } from "react"; // 👈 Añadimos Suspense
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // 👈 Añadimos useSearchParams
import Link from "next/link";
import { Zap, Eye, EyeOff, Check, X, KeyRound, ArrowLeft } from "lucide-react";

// 1. Movemos toda la lógica a un componente interno
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref"); // 👈 Atrapamos el código de la URL

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", birthDate: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [otp, setOtp] = useState("");

  const passChecks = {
    length: formData.password.length >= 8,
    letter: /[A-Za-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  };
  const isPasswordValid = Object.values(passChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (requires2FA) {
        const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          otp: otp,
          redirect: false,
        });

        if (res?.error) throw new Error("Código de verificación incorrecto");

        router.push("/");
        router.refresh();
        return;
      }

      if (isRegister) {
        if (!isPasswordValid) return setError("La contraseña no cumple los requisitos.");
        if (!formData.birthDate) return setError("Debes indicar tu fecha de nacimiento.");
        const birth = new Date(formData.birthDate);
        if (new Date().getFullYear() - birth.getFullYear() < 18) return setError("Debes ser mayor de 18 años.");

        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            ref: refCode, // 👈 AQUÍ ENVIAMOS EL CÓDIGO A LA API
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Error al registrar");
        }

        const preLoginRes = await fetch("/api/auth/pre-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        if (!preLoginRes.ok) throw new Error("Error al enviar el código de verificación");

        setIsRegister(false);
        setRequires2FA(true);
      } else {
        const res = await fetch("/api/auth/pre-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Credenciales incorrectas");

        if (!data.requires2FA) {
          const loginRes = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });
          if (loginRes?.error) throw new Error(loginRes.error);
          router.push("/");
          router.refresh();
          return;
        }

        setRequires2FA(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-set-bg p-4">
        <div className="w-full max-w-md bg-set-surface border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          <div className="bg-orange-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
            <KeyRound className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-black italic text-white mb-2">Verificación de Seguridad</h1>
          <p className="text-gray-400 text-sm mb-6">
            Hemos enviado un código de 6 dígitos a <strong className="text-white">{formData.email}</strong>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              required
              maxLength={6}
              autoFocus
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-set-bg border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-orange-500" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
            />

            {error && <p className="text-red-500 text-sm bg-red-500/10 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors">
              {loading ? "Verificando..." : "Verificar y Entrar"}
            </button>
          </form>

          <button onClick={() => { setRequires2FA(false); setOtp(""); setError(""); }} className="mt-6 text-gray-400 text-xs flex items-center justify-center gap-1 hover:text-white mx-auto transition-colors">
            <ArrowLeft className="w-3 h-3" /> Volver al inicio de sesión
          </button>
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
          <h1 className="text-2xl font-black italic tracking-tighter text-white">SETGORIA</h1>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? "Crea tu cuenta para empezar" : "Bienvenido de nuevo"}
          </p>
          {/* 👈 Si viene con referido, le mostramos un pequeño aviso */}
          {isRegister && refCode && (
            <div className="mt-3 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              <span className="text-[10px] font-bold text-orange-500 uppercase">¡Invitación válida! Ganas 3 días gratis</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                <input type="text" required className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Fecha de Nacimiento (+18)</label>
                <input type="date" required className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 scheme-dark" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Correo Electrónico</label>
            <input type="email" required className="w-full mt-1 bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Contraseña</label>
            <div className="relative mt-1">
              <input type={showPassword ? "text" : "password"} required className="w-full bg-set-bg border border-gray-700 rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-orange-500" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!isRegister && (
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline font-bold">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className={`flex items-center gap-1.5 text-xs ${passChecks.length ? 'text-green-500' : 'text-gray-500'}`}>
                {passChecks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Mín. 8 caracteres
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passChecks.letter ? 'text-green-500' : 'text-gray-500'}`}>
                {passChecks.letter ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Una letra
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passChecks.number ? 'text-green-500' : 'text-gray-500'}`}>
                {passChecks.number ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Un número
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${passChecks.symbol ? 'text-green-500' : 'text-gray-500'}`}>
                {passChecks.symbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Un símbolo (*)
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg mt-2">{error}</p>}

          <button type="submit" disabled={loading} className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition-colors">
            {loading ? "Cargando..." : isRegister ? "Registrarse" : "Iniciar Sesión"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-set-surface text-gray-500 uppercase font-bold tracking-wider">O continúa con</span></div>
        </div>

        <button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
            <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="ml-2 text-orange-500 font-bold hover:underline">
              {isRegister ? "Inicia sesión" : "Regístrate"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// 2. Exportamos el componente envuelto en Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-set-bg">
        <div className="text-orange-500 font-bold animate-pulse">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
