// app/(dashboard)/comunidad/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Send, Medal, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string | null; image: string | null };
};

export default function ComunidadPage() {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments");
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // 👈 SOLUCIÓN REACT 19: Usamos setTimeout para evitar el renderizado en cascada
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComments();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 👈 Usamos 'e'
    if (!newComment.trim()) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      setNewComment("");
      fetchComments();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-black italic text-orange-500 uppercase mb-8">Comunidad SETGORIA</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Feed de Comentarios */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">Discusiones Recientes</h2>
          
          {session?.user ? (
            <form onSubmit={handleSubmit} className="bg-set-surface border border-gray-800 p-4 rounded-2xl flex flex-col gap-3">
              <textarea
                className="w-full bg-set-bg border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 resize-none"
                placeholder="¿Qué opinas de los pronósticos de hoy? (Máx. 200 caracteres)"
                maxLength={200}
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{newComment.length}/200</span>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                  <Send className="w-4 h-4" /> Publicar
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-400 text-sm bg-set-surface p-4 rounded-xl border border-gray-800">
              Inicia sesión para participar en la comunidad.
            </p>
          )}

          {loading ? (
            <p className="text-gray-400">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm bg-set-surface p-4 rounded-xl border border-gray-800 text-center">
              Aún no hay comentarios. ¡Sé el primero en participar!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-set-surface border border-gray-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  {comment.user.image ? (
                    <Image src={comment.user.image} alt="Avatar" width={32} height={32} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-xs">
                      {comment.user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold">{comment.user.name || "Usuario"}</p>
                    <p className="text-[10px] text-gray-500">{new Date(comment.createdAt).toLocaleString('es-ES')}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Ranking Lateral (Mock) */}
        <div className="space-y-4">
          <div className="bg-set-surface border border-gray-800 p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Medal className="w-5 h-5 text-yellow-500" /> Top Predictores
            </h2>
            <div className="space-y-4">
              {[
                { name: "Carlos M.", wins: 45 },
                { name: "Ana P.", wins: 38 },
                { name: "Luis R.", wins: 32 },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{i + 1}. {user.name}</span>
                  <span className="text-green-400 font-bold text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {user.wins}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
