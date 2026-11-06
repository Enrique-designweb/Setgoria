// lib/webpush.ts
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:tu-correo@gmail.com", // Tu correo
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default webpush;
