// lib/webpush.ts
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:hernanglez06@gmail.com", // Tu correo
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default webpush;
