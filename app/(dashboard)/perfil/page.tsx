// app/(dashboard)/perfil/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react"; 
import Link from "next/link";
import Image from "next/image";
import { 
  User, Calendar, Camera, Loader2, History, FileText, Settings, LogOut, 
  ChevronRight, Gift, Phone, CreditCard, ShieldCheck, LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";
import { APP_VERSION } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [kycStatus, setKycStatus] = useState("NOT_SUBMITTED");

  const [formData, setFormData] = useState({ 
    name: "", birthDate: "", phone: "", documentId: "", email: "", role: "", image: "" 
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
            phone: data.phone || "",           
            documentId: data.documentId || "", 
            email: data.email || "",
            role: data.role || "USER",
            image: data.image || "",
          });
          setReferralCode(data.referralCode || "");
          setKycStatus(data.kycStatus || "NOT_SUBMITTED");
        }
      } catch (error: unknown) {
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
      const res = await fetch("/api/upload/avatar", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      
      setFormData({ ...formData, image: result.url });
      setFile(null); 
      router.refresh(); 
      toast.success("¡Foto actualizada!");
    } catch (error: unknown) {
      console.error("Error al subir foto:", error);
      toast.error("Error al subir la foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, birthDate: formData.birthDate, phone: formData.phone, documentId: formData.documentId, 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setKycStatus("PENDING");
      toast.success("Datos guardados. Tu KYC está en revisión.");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${referralCode}`);
    setCopied(true);
    toast.success("Enlace copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="p-4 md:p-10 max-w-2xl mx-auto text-white pb-24">
      
      {/* Cabecera del Perfil */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-[#1A1D24] border-2 border-gray-700 rounded-full flex items-center justify-center overflow-hidden relative">
            {formData.image ? (
              <Image src={formData.image} alt="Avatar" width={100} height={100} className="object-cover w-full h-full" />
            ) : (
              <User className="w-12 h-12 text-gray-500" />
            )}
            {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-6 h-6 text-orange-500 animate-spin" /></div>}
          </div>
          <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-all active:scale-95 shadow-lg">
            <Camera className="w-4 h-4 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <h1 className="text-2xl font-bold">{formData.name || "Usuario"}</h1>
        <p className="text-sm text-gray-400">{formData.email}</p>
        
        <div className="mt-2 flex items-center gap-2">
           <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${formData.role === 'ADMIN' ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800 text-gray-400'}`}>
              {formData.role}
           </span>
           {kycStatus === "APPROVED" && (
             <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-500/20 text-green-500 border border-green-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verificado
             </span>
           )}
           {file && (
              <button onClick={handleUploadAvatar} disabled={uploading} className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md flex items-center gap-1 active:scale-95">
                {uploading ? "Subiendo..." : "Guardar Foto"}
              </button>
           )}
        </div>
      </div>

      <div className="space-y-6">
        
        {/* BOTÓN GIGANTE PARA EL ADMIN */}
        {formData.role === "ADMIN" && (
          <Link 
            href="/admin" 
            className="flex items-center justify-center gap-3 w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-orange-500/30 transition-all active:scale-95 animate-pulse"
          >
            <LayoutDashboard className="w-6 h-6" />
            Ir al Panel de Administración
          </Link>
        )}

        {/* Referidos */}
        {referralCode && (
          <div className="bg-[#1A1D24] rounded-2xl overflow-hidden border border-gray-800">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/10 p-2 rounded-lg"><Gift className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <p className="text-sm font-bold">Invita y Gana</p>
                  <p className="text-[10px] text-gray-400">3 días gratis por amigo</p>
                </div>
              </div>
              <button onClick={copyToClipboard} className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg active:scale-95">
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* Datos Personales y KYC */}
        <div id="kyc" className="bg-[#1A1D24] rounded-2xl overflow-hidden border border-gray-800 scroll-mt-24">
          <div className="p-3 border-b border-gray-800/50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2">Verificación de Identidad (Opcional)</span>
            {kycStatus === "PENDING" && <span className="text-[10px] text-yellow-500 font-bold pr-2">En revisión ⏳</span>}
          </div>
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <input type="text" className="flex-1 bg-transparent border-b border-gray-700 pb-1 text-sm text-white focus:outline-none focus:border-orange-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre completo" />
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input type="date" className="flex-1 bg-transparent border-b border-gray-700 pb-1 text-sm text-white focus:outline-none focus:border-orange-500 scheme-dark" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} />
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <input type="tel" className="flex-1 bg-transparent border-b border-gray-700 pb-1 text-sm text-white focus:outline-none focus:border-orange-500" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Número de teléfono" />
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <input type="text" className="flex-1 bg-transparent border-b border-gray-700 pb-1 text-sm text-white focus:outline-none focus:border-orange-500" value={formData.documentId} onChange={(e) => setFormData({ ...formData, documentId: e.target.value })} placeholder="Carnet de Identidad (CI)" />
            </div>

            <button type="submit" disabled={saving} className="mt-2 w-full bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm active:scale-95 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar y Verificar"}
            </button>
          </form>
        </div>

        {/* Opciones */}
        <div className="bg-[#1A1D24] rounded-2xl overflow-hidden border border-gray-800 flex flex-col">
          {formData.role !== "ADMIN" && (
            <Link href="/historial" className="flex items-center justify-between p-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg"><History className="w-5 h-5 text-blue-500" /></div>
                <span className="text-sm font-medium">Mi Historial de Pagos</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </Link>
          )}
          <Link href="/configuracion" className="flex items-center justify-between p-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-gray-700/50 p-2 rounded-lg"><Settings className="w-5 h-5 text-gray-300" /></div>
              <span className="text-sm font-medium">Configuración y Suscripción</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
          <Link href="/terminos" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-purple-500" /></div>
              <span className="text-sm font-medium">Términos y Condiciones</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
        </div>

        {/* Cerrar Sesión */}
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 font-bold py-3.5 rounded-2xl hover:bg-red-500/20 transition-all active:scale-95">
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>

        <div className="text-center pt-4">
          <p className="text-[10px] text-gray-600 font-mono">SETGORIA {APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}
