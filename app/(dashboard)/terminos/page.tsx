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
          <p>Ofrecemos un período de prueba gratuito y planes de suscripción de pago. Los pagos realizados a través de Transfermóvil, Tarjeta Clásica, USDT o QvaPay están sujetos a verificación por parte de un administrador. Los códigos de verificación generados son de uso único y estrictamente personales. El mal uso resultará en la cancelación de la cuenta sin derecho a reembolso.</p>
        </section>

        {/* 👈 NUEVA SECCIÓN DE REGLAS Y SANCIONES */}
        <section className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl">
          <h2 className="text-lg font-bold text-red-400 mb-2">4. Reglas de la Comunidad y Sistema de Sanciones</h2>
          <p className="mb-3">Para garantizar un ambiente sano y profesional, todos los usuarios deben respetar las siguientes normas dentro de la plataforma y en nuestros canales oficiales (como el Bot de Telegram):</p>
          <ul className="list-disc list-inside space-y-1 mb-4 text-gray-300">
            <li>Prohibido el uso de lenguaje ofensivo, acoso o faltas de respeto hacia otros usuarios o al equipo de SETGORIA.</li>
            <li>Prohibido compartir, revender o filtrar los pronósticos premium a terceros no suscritos.</li>
            <li>Prohibido el spam o la publicación de enlaces externos no autorizados.</li>
          </ul>
          <p className="font-bold text-white mb-2">Consecuencias por incumplimiento:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong className="text-yellow-400">Tarjeta Amarilla:</strong> Se otorga como una advertencia formal por faltas leves. Si un usuario acumula <strong>2 Tarjetas Amarillas</strong>, se le aplicará automáticamente una Tarjeta Roja.</li>
            <li><strong className="text-red-500">Tarjeta Roja:</strong> Implica la <strong>expulsión inmediata y definitiva</strong> del grupo de Telegram y la suspensión de la cuenta en la plataforma sin derecho a reembolso.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Propiedad Intelectual</h2>
          <p>Todos los pronósticos, estadísticas, logotipos y el código fuente de la plataforma son propiedad exclusiva de SETGORIA. Queda prohibida su reproducción, distribución o reventa sin autorización expresa por escrito.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Contacto y Soporte</h2>
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
