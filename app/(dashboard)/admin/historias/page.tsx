// app/(dashboard)/admin/historias/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Video, UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminStoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"image" | "video">("image");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return toast.error("Selecciona un archivo");

    setLoading(true);
    const toastId = toast.loading("Subiendo historia...");

    const formData = new FormData(e.currentTarget);
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/admin/stories", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Historia publicada", { id: toastId });
      router.push("/inicio"); // Redirigir a la home para verla
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 bg-[#1A1D24] border border-gray-800 rounded-lg text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black italic text-white uppercase flex items-center gap-2">
          <UploadCloud className="text-orange-500 w-6 h-6" /> Publicar Historia
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1A1D24] border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
        
        {/* Selector de Tipo */}
        <div className="flex gap-4">
          <button type="button" onClick={() => setType("image")} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${type === "image" ? "bg-orange-500/20 border-orange-500 text-orange-500" : "bg-black/30 border-gray-800 text-gray-400"}`}>
            <ImageIcon className="w-5 h-5" /> Imagen
          </button>
          <button type="button" onClick={() => setType("video")} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${type === "video" ? "bg-orange-500/20 border-orange-500 text-orange-500" : "bg-black/30 border-gray-800 text-gray-400"}`}>
            <Video className="w-5 h-5" /> Video
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Título Corto</label>
          <input name="title" required placeholder="Ej: Pronóstico Real Madrid vs Barcelona" className="w-full bg-black/30 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500" />
        </div>

        <div>
          <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Texto Descriptivo (Análisis)</label>
          <textarea name="description" rows={3} placeholder="Detalles del partido, cuotas, estadísticas..." className="w-full bg-black/30 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Archivo ({type === "image" ? "JPG/PNG" : "MP4"})</label>
          <input type="file" accept={type === "image" ? "image/*" : "video/*"} onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/10 file:text-orange-500 hover:file:bg-orange-500/20" />
        </div>

        <button type="submit" disabled={loading} className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50">
          {loading ? "Subiendo..." : "Publicar Historia"}
        </button>
      </form>
    </div>
  );
}
