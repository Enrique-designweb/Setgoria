// app/(dashboard)/terminos/page.tsx
export default function TerminosPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto text-white pb-24">
      <h1 className="text-3xl font-black italic text-orange-500 uppercase mb-8">Términos y Condiciones</h1>
      
      <div className="bg-set-surface border border-gray-800 rounded-2xl p-8 space-y-6 text-sm text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Aceptación de los Términos</h2>
          <p>Al acceder y utilizar SETGORIA, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma. El servicio está destinado exclusivamente a personas mayores de 18 años.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Naturaleza del Servicio</h2>
          <p>SETGORIA proporciona análisis estadísticos y pronósticos deportivos generados por nuestro equipo de expertos y algoritmos. <strong>No somos una casa de apuestas</strong>. La información proporcionada es solo para fines informativos y de entretenimiento. No garantizamos ganancias y no nos hacemos responsables de las pérdidas financieras derivadas del uso de nuestra información en plataformas de terceros.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Suscripciones y Pagos</h2>
          <p>Ofrecemos un período de prueba gratuito y planes de suscripción de pago. Los pagos realizados a través de Transfermóvil, Tarjeta Clásica o USDT están sujetos a verificación manual por parte de un administrador. Los códigos de verificación generados son de uso único y estrictamente personales. El mal uso resultará en la cancelación de la cuenta sin derecho a reembolso.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Propiedad Intelectual</h2>
          <p>Todos los pronósticos, estadísticas, logotipos y el código fuente de la plataforma son propiedad exclusiva de SETGORIA. Queda prohibida su reproducción, distribución o reventa sin autorización expresa por escrito.</p>
        </section>

        {/* 👈 NUEVA SECCIÓN DE CONTACTO CON DATOS REALES */}
        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Contacto y Soporte</h2>
          <p>Para cualquier duda, problema técnico o consulta relacionada con su cuenta, puede contactarnos a través de los siguientes medios oficiales:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>📧 Correo electrónico: <span className="text-white font-medium">leonardofonseca302@gmail.com</span></li>
            <li>📱 WhatsApp: <span className="text-white font-medium">+53 51756491</span></li>
            <li>🤖 Bot de Telegram: <span className="text-white font-medium">@SetgoriaSportBot</span></li>
          </ul>
          <p className="mt-3">Nuestro equipo de soporte responderá en un plazo máximo de 24 horas hábiles.</p>
        </section>
      </div>
    </div>
  );
}
