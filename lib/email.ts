// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 📧 Correo para Pagos
export async function sendVerificationEmail(email: string, code: string, plan: string) {
  try {
    const data = await resend.emails.send({
      from: 'SETGORIA <onboarding@resend.dev>', 
      to: email,
      subject: 'Tu Código de Verificación - SETGORIA',
      html: `
        <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #f97316; font-style: italic;">SETGORIA</h1>
          <p style="font-size: 16px; color: #a1a1aa;">Has solicitado activar el plan <strong>${plan}</strong>.</p>
          <p style="font-size: 16px; color: #a1a1aa;">Tu código de verificación es:</p>
          <div style="background-color: #14161d; border: 2px dashed #f97316; padding: 20px; margin: 20px 0; border-radius: 10px;">
            <h2 style="color: #f97316; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #71717a;">Este código expira en 30 minutos. No lo compartas con nadie.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error enviando correo con Resend:", error);
    return { success: false, error };
  }
}

// 🔐 Correo para Login 2FA
export async function sendLoginOTPEmail(email: string, code: string) {
  try {
    const data = await resend.emails.send({
      from: 'SETGORIA Seguridad <onboarding@resend.dev>', 
      to: email,
      subject: 'Tu Código de Acceso - SETGORIA',
      html: `
        <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #f97316; font-style: italic;">SETGORIA</h1>
          <p style="font-size: 16px; color: #a1a1aa;">Alguien está intentando iniciar sesión en tu cuenta.</p>
          <p style="font-size: 16px; color: #a1a1aa;">Tu código de seguridad es:</p>
          <div style="background-color: #14161d; border: 2px dashed #f97316; padding: 20px; margin: 20px 0; border-radius: 10px;">
            <h2 style="color: #f97316; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
          </div>
          <p style="font-size: 14px; color: #71717a;">Este código expira en 10 minutos.</p>
          <p style="font-size: 12px; color: #52525b; margin-top: 30px;">Si no fuiste tú, cambia tu contraseña inmediatamente.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error enviando OTP de login:", error);
    return { success: false, error };
  }
}

// 🔑 Correo para Recuperación de Contraseña
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    await resend.emails.send({
      from: 'SETGORIA Seguridad <onboarding@resend.dev>',
      to: email,
      subject: 'Recupera tu contraseña - SETGORIA',
      html: `
        <div style="font-family: sans-serif; background-color: #090a0e; color: #ffffff; padding: 40px; text-align: center; border-radius: 10px;">
          <h1 style="color: #f97316; font-style: italic;">SETGORIA</h1>
          <p style="font-size: 16px; color: #a1a1aa;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p style="font-size: 16px; color: #a1a1aa;">Haz clic en el siguiente botón para crear una nueva:</p>
          
          <a href="${resetUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
            Restablecer Contraseña
          </a>
          
          <p style="font-size: 14px; color: #71717a;">Este enlace expira en 1 hora.</p>
          <p style="font-size: 12px; color: #52525b; margin-top: 30px;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error enviando correo de reseteo:", error);
    return { success: false };
  }
}
