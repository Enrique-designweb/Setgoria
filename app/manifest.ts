import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SETGORIA | Pronósticos Deportivos",
    short_name: "SETGORIA",
    description: "Plataforma de pronósticos deportivos",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090a0e",
    theme_color: "#f97316",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
