// lib/email.ts
import { Resend } from 'resend';

// Inicializamos Resend con la clave que debes configurar en Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = 'no-reply@setgoria.com'; 
const SENDER_NAME = 'SETGORIA';

// Función auxiliar para generar el pie de página legal
const getFooter = () => `
  <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #71717a; line-height: 1.5;">
    <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
    <p style="margin-top: 15px;">
      <a href="https://setgoria.com/terminos" style="color: #f97316; text-decoration: none; margin: 0 10px;">Términos y Condiciones</a> | 
      <a href="https://setgoria.com/soporte" style="color: #f97316; text-decoration: none; margin: 0 10px;">Soporte</a>
    </p>
    <p style="margin-top: 15px;">© ${new Date().getFullYear()} SETGORIA. Todos los derechos reservados.</p>
  </div>
`;

// Función auxiliar para generar la tabla de seguridad (IP, Dispositivo, Fecha)
const getSecurityTable = (ip?: string, device?: string) => `
  <div style="background-color: #14161d; border-left: 3px solid #f97316; padding: 15px; margin: 20px 0; text-align: left; font-size: 13px; color: #a1a1aa;">
    <p style="margin: 0 0 10px 0; font-weight: bold; color: #ffffff;">Información de seguridad:</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 4px 0; color: #71717a;">Fecha:</td><td style="padding: 4px 0;">${new Date().toLocaleString('es-ES')}</td></tr>
      <tr><td style="padding: 4px 0; color: #71717a;">IP:</td><td style="padding: 4px 0;">${ip || 'Desconocida'}</td></tr>
      <tr><td style="padding: 4px 0; color: #71717a;">Dispositivo:</td><td style="padding: 4px 0;">${device || 'Navegador Web'}</td></tr>
    </table>
  </div>
`;

// 📧 Correo para Pagos (Código OTP)
export async function sendVerificationEmail(email: string, code: string, ip?: string, device?: string) {
  const { data, error } = await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: 'Tu Código de Verificación - SETGORIA',
    html: `
      <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 10px;">
        <h1 style="color: #f97316; font-style: italic; font-size: 28px;">SETGORIA</h1>
        <p style="font-size: 15px; color: #a1a1aa;">Has solicitado un código para activar tu suscripción.</p>
        <div style="background-color: #14161d; border: 1px solid #27272a; padding: 25px; margin: 20px 0; border-radius: 12px;">
          <h2 style="color: #f97316; font-size: 40px; letter-spacing: 8px; margin: 0;">${code}</h2>
        </div>
        <p style="font-size: 13px; color: #71717a;">Este código expira en 30 minutos.</p>
        ${getSecurityTable(ip, device)}
        ${getFooter()}
      </div>
    `,
  });

  if (error) {
    console.error("Error de Resend al enviar OTP de pago:", error);
    return { success: false, error };
  }
  return { success: true, data };
}

// 🔐 Correo para Login 2FA
export async function sendLoginOTPEmail(email: string, code: string, ip?: string, device?: string) {
  const { data, error } = await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: 'Tu Código de Acceso - SETGORIA',
    html: `
      <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 10px;">
        <h1 style="color: #f97316; font-style: italic; font-size: 28px;">SETGORIA</h1>
        <p style="font-size: 15px; color: #a1a1aa;">Alguien está intentando iniciar sesión en tu cuenta.</p>
        <div style="background-color: #14161d; border: 1px solid #27272a; padding: 25px; margin: 20px 0; border-radius: 12px;">
          <h2 style="color: #f97316; font-size: 40px; letter-spacing: 8px; margin: 0;">${code}</h2>
        </div>
        <p style="font-size: 13px; color: #71717a;">Este código expira en 10 minutos.</p>
        ${getSecurityTable(ip, device)}
        ${getFooter()}
      </div>
    `,
  });

  if (error) {
    console.error("Error de Resend al enviar OTP de login:", error);
    return { success: false, error };
  }
  return { success: true, data };
}

// 🔑 Correo para Recuperación de Contraseña
export async function sendPasswordResetEmail(email: string, resetUrl: string, ip?: string, device?: string) {
  const { data, error } = await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: 'Recupera tu contraseña - SETGORIA',
    html: `
      <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; border-radius: 10px;">
        <h1 style="color: #f97316; font-style: italic; font-size: 28px;">SETGORIA</h1>
        <p style="font-size: 15px; color: #a1a1aa;">Haz clic en el botón para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">Restablecer Contraseña</a>
        <p style="font-size: 13px; color: #71717a;">Este enlace expira en 1 hora.</p>
        ${getSecurityTable(ip, device)}
        ${getFooter()}
      </div>
    `,
  });

  if (error) {
    console.error("Error de Resend al enviar correo de reseteo:", error);
    return { success: false, error };
  }
  return { success: true, data };
}
