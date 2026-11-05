// lib/email.ts
import { BrevoClient } from '@getbrevo/brevo';

// Inicializamos el cliente de Brevo con la clave desde las variables de entorno
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });

// Definimos el remitente (debe ser el correo con el que te registraste en Brevo)
const SENDER_EMAIL = 'hernanglez06@gmail.com'; // 👈 CÁMBIALO POR TU CORREO
const SENDER_NAME = 'SETGORIA';

// 📧 Correo para Pagos (Eliminamos el parámetro 'plan' que no se usaba)
export async function sendVerificationEmail(email: string, code: string) {
  console.log(`\n=========================================`);
  console.log(`📧 [PAGO] Código OTP para ${email}: ${code}`);
  console.log(`=========================================\n`);

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email }],
      subject: 'Tu Código de Verificación - SETGORIA',
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #f97316; font-style: italic;">SETGORIA</h1>
          <p style="font-size: 16px; color: #a1a1aa;">Has solicitado activar tu suscripción.</p>
          <p style="font-size: 16px; color: #a1a1aa;">Tu código de verificación es:</p>
          <div style="background-color: #14161d; border: 2px dashed #f97316; padding: 20px; margin: 20px 0; border-radius: 10px;">
            <h2 style="color: #f97316; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #71717a;">Este código expira en 30 minutos. No lo compartas con nadie.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error enviando correo con Brevo:", error);
    return { success: false, error };
  }
}

// 🔐 Correo para Login 2FA
export async function sendLoginOTPEmail(email: string, code: string) {
  console.log(`\n=========================================`);
  console.log(`🔐 [LOGIN 2FA] Código OTP para ${email}: ${code}`);
  console.log(`=========================================\n`);

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email }],
      subject: 'Tu Código de Acceso - SETGORIA',
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #f97316; font-style: italic;">SETGORIA</h1>
          <p style="font-size: 16px; color: #a1a1aa;">Alguien está intentando iniciar sesión en tu cuenta.</p>
          <p style="font-size: 16px; color: #a1a1aa;">Tu código de seguridad es:</p>
          <div style="background-color: #14161d; border: 2px dashed #f97316; padding: 20px; margin: 20px 0; border-radius: 10px;">
            <h2 style="color: #f97316; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #71717a;">Este código expira en 10 minutos.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error enviando OTP de login con Brevo:", error);
    return { success: false, error };
  }
}

// 🔑 Correo para Recuperación de Contraseña
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  console.log(`\n=========================================`);
  console.log(`🔑 [RECUPERACIÓN] Enlace para ${email}: ${resetUrl}`);
  console.log(`=========================================\n`);

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email }],
      subject: 'Recupera tu contraseña - SETGORIA',
      htmlContent: `
        <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #f97316; font-style: italic;">SETGORIA</h1>
          <p style="font-size: 16px; color: #a1a1aa;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p style="font-size: 16px; color: #a1a1aa;">Haz clic en el siguiente botón para crear una nueva:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Restablecer Contraseña
          </a>
          <p style="font-size: 14px; color: #71717a;">Este enlace expira en 1 hora.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error enviando correo de reseteo con Brevo:", error);
    return { success: false, error };
  }
}
