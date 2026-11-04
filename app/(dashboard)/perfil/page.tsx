// app/(dashboard)/perfil/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Calendar, CheckCircle2, AlertCircle, Camera, Upload, Loader2 } from "lucide-react"; // 👈 Añadimos Loader2

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Estados para el Avatar
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    role: "",
    image: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : "",
            email: data.email || "",
            role: data.role || "USER",
            image: data.image || "",
          });
        }
      } catch (error) {
        console.error("Error cargando perfil", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUploadAvatar = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setFormData({ ...formData, image: result.url });
      setFile(null); 
      router.refresh(); 
      setMessage({ type: "success", text: "¡Foto de perfil actualizada!" });
      
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error al subir la foto." });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, birthDate: formData.birthDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });
    } catch (err: unknown) {
      if (err instanceof Error) setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando perfil...</div>;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-black italic mb-8 text-orange-500 uppercase tracking-tight">Mi Perfil</h1>

      <div className="bg-set-surface border border-gray-800 rounded-2xl p-6 md:p-8">
        
        {/* Cabecera del Perfil */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 border-b border-gray-800 pb-8">
          
          <div className="relative group">
            <div className="w-24 h-24 bg-set-bg border-2 border-gray-700 rounded-full flex items-center justify-center overflow-hidden relative">
              {formData.image ? (
                <Image src={formData.image} alt="Avatar" width={100} height={100} className="object-cover w-full h-full" />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Botón de Cámara */}
            <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors shadow-lg">
              <Camera className="w-4 h-4 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
            </label>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{formData.name || "Usuario"}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${formData.role === 'ADMIN' ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800 text-gray-400'}`}>
                {formData.role}
              </span>
            </div>

            {/* Botón de Guardar Foto */}
            {file && (
              <button 
                onClick={handleUploadAvatar}
                disabled={uploading}
                className="mt-3 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 mx-auto sm:mx-0 hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {uploading ? "Subiendo..." : "Guardar Nueva Foto"}
              </button>
            )}
          </div>
        </div>

        {/* Formulario de Datos */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <User className="w-4 h-4" /> Nombre Completo
            </label>
            <input
              type="text"
              className="w-full mt-2 bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <Mail className="w-4 h-4" /> Correo Electrónico
            </label>
            <input
              type="email"
              disabled
              className="w-full mt-2 bg-set-bg border border-gray-800 rounded-lg p-3 text-gray-500 cursor-not-allowed"
              value={formData.email}
            />
            <p className="text-[10px] text-gray-500 mt-1">El correo no se puede cambiar.</p>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fecha de Nacimiento
            </label>
            <input
              type="date"
              required
              className="w-full mt-2 bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none scheme-dark"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
              message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios de Datos"}
          </button>
        </form>
      </div>
    </div>
  );
}
