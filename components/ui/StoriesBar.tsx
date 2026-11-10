// components/ui/StoriesBar.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

export interface StoryData {
  id: string;
  title: string;
  description?: string | null; // 👈 Añadido
  imageUrl: string;
  videoUrl?: string | null;
}

export default function StoriesBar({ stories }: { stories: StoryData[] }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  if (!stories || stories.length === 0) return null;

  const openStory = (index: number) => setCurrentIndex(index);
  const closeStory = () => setCurrentIndex(null);

  const nextStory = () => {
    if (currentIndex !== null) {
      if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
      else closeStory();
    }
  };

  const prevStory = () => {
    if (currentIndex !== null && currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else setCurrentIndex(0);
  };

  const currentStory = currentIndex !== null ? stories[currentIndex] : null;

  return (
    <>
      <div className="w-full overflow-x-auto no-scrollbar mb-8">
        <div className="flex gap-4 px-2">
          {stories.map((story, index) => (
            <button key={story.id} onClick={() => openStory(index)} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-0.5 bg-linear-to-tr from-orange-500 to-yellow-500 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-2 border-set-bg overflow-hidden relative">
                  <Image src={story.imageUrl || "/placeholder-video.jpg"} alt={story.title} fill sizes="80px" className="object-cover" />
                </div>
              </div>
              <span className="text-[10px] text-gray-300 w-16 md:w-20 truncate text-center">{story.title}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {currentStory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4 sm:p-0">
            <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:max-h-212.5 bg-black sm:rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              
              {/* Barras de progreso */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {stories.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: currentIndex === idx ? "100%" : currentIndex !== null && idx < currentIndex ? "100%" : "0%" }}
                      transition={{ duration: 10, ease: "linear" }}
                      onAnimationComplete={() => { if (currentIndex === idx) nextStory(); }}
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              <button onClick={closeStory} className="absolute top-8 right-4 z-20 text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="w-full h-full relative">
                {currentStory.videoUrl ? (
                  <video src={currentStory.videoUrl} autoPlay loop muted className="w-full h-full object-cover" />
                ) : (
                  <Image src={currentStory.imageUrl} alt={currentStory.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" priority />
                )}
              </div>

              {/* 👇 TEXTO DESCRIPTIVO SOBRE EL CONTENIDO 👇 */}
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/90 via-black/50 to-transparent p-6 pt-20 pointer-events-none">
                <h3 className="text-white font-bold text-xl mb-2">{currentStory.title}</h3>
                {currentStory.description && (
                  <p className="text-gray-200 text-sm leading-relaxed">{currentStory.description}</p>
                )}
              </div>

              {/* Zonas táctiles */}
              <div className="absolute inset-0 flex z-10">
                <div className="w-1/3 h-full cursor-pointer" onClick={prevStory} />
                <div className="w-1/3 h-full cursor-default" />
                <div className="w-1/3 h-full cursor-pointer" onClick={nextStory} />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
