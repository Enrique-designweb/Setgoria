// components/ui/LiveVideoPlayer.tsx
"use client";

export default function LiveVideoPlayer({ videoUrl }: { videoUrl?: string }) {
  if (!videoUrl) return null;

  // Extraemos el ID del video de YouTube de forma segura
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);

  if (!videoId) return null;

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-800 shadow-2xl bg-black">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title="Video de Fútbol"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
