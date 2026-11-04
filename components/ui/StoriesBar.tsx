// components/ui/StoriesBar.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image"; // 👈 Importamos Image

// Datos simulados (Mock)
const STORIES = [
  { id: 1, title: "Anuncio del día", image: "https://picsum.photos/seed/setgoria1/200/200", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 2, title: "Resumen Madrid", image: "https://picsum.photos/seed/setgoria2/200/200", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 3, title: "Reto Escalera", image: "https://picsum.photos/seed/setgoria3/200/200", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 4, title: "Top 100 USD", image: "https://picsum.photos/seed/setgoria4/200/200", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
];

export default function StoriesBar() {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);

  return (
    <>
      <div className="w-full overflow-x-auto no-scrollbar mb-8">
        <div className="flex gap-4 px-2">
          {STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story.id)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-linear-to-tr from-orange-500 to-yellow-500 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-2 border-[#090a0e] overflow-hidden relative">
                  {/* 👈 Usamos Image en lugar de img */}
                  <Image 
                    src={story.image} 
                    alt={story.title} 
                    fill
                    sizes="(max-width: 768px) 64px, 80px"
                    className="object-cover" 
                  />
                </div>
              </div>
              <span className="text-[10px] text-gray-300 w-16 md:w-20 truncate text-center">{story.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal para ver la Historia */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedStory(null)}
          >
            <div className="relative w-full max-w-sm aspect-9/16 bg-black rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 10, ease: "linear" }}
                    className="h-full bg-white" 
                  />
                </div>
              </div>
              
              <button onClick={() => setSelectedStory(null)} className="absolute top-6 right-4 z-10 text-white bg-black/50 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>

              <video 
                src={STORIES.find(s => s.id === selectedStory)?.video} 
                autoPlay 
                loop 
                muted 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
