// app/(dashboard)/suscripcion/page.tsx
"use client";

import { useState } from "react";
import { Check, CreditCard, Smartphone, Bitcoin, Landmark, ShieldCheck, Copy, CheckCircle2, Lock, AlertCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// 👈 PRECIOS DE PRUEBA
const PLANS = [
  { id: "WEEKLY", name: "Semanal", priceUSD: 0.10, priceCUP: 10000, features: ["Acceso por 7 días", "Pronósticos diarios", "Soporte estándar"] },
  { id: "MONTHLY", name: "Mensual", priceUSD: 0.20, priceCUP: 25000, features: ["Acceso por 30 días", "Análisis premium", "Soporte prioritario"] },
];

const PAYMENT_METHODS = [
  { id: "QVAPAY", name: "QvaPay", icon: Bitcoin, desc: "Pago automático" },
  { id: "TRANSFERMOVIL", name: "Transfermóvil", icon: Smartphone, desc: "Transferencia CUP" },
  { id: "CARD", name: "Tarjeta Clásica", icon: CreditCard, desc: "Pago en USD" },
  { id: "USDT", name: "USDT (TRC20)", icon: Landmark, desc: "Criptomoneda" },
];

// 👈 DIRECCIÓN TRON REAL CORREGIDA
const YOUR_WALLET = "TPghZv26N8xwjaS6ZEoHpHtUD6eXo1qjXe"; 

const formatCUP = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(amount);
};

function SecureCard({ number, label }: { number: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedNumber = `**** **** **** ${number.slice(-4)}`;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.2)] transition-all">
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-bold uppercase">{label}</span>
        <span className="text-lg font-mono text-white tracking-widest flex items-center gap-2">
          {maskedNumber} <Lock className="w-3 h-3 text-orange-500" />
        </span>
      </div>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
          copied ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
        }`}
      >
        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [usdtTxHash, setUsdtTxHash] = useState("");
  const [verifyingUsdt, setVerifyingUsdt] = useState(false);

  const handleCreateTransaction = async () => {
    if (!selectedPlan || !paymentMethod) return;
    setLoading(true);

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, method: paymentMethod }),
      });

      const textData = await res.text();
      let data;
      try { data = JSON.parse(textData); } catch { throw new Error("Error de conexión."); }

      if (!res.ok) throw new Error(data.message || "Error al procesar la solicitud");

      if (paymentMethod === "QVAPAY") {
        if (!data.redirectUrl) throw new Error("No se pudo obtener el enlace.");
        window.location.href = data.redirectUrl;
      } else {
        setTransactionId(data.transactionId);
        setPaymentCode(data.paymentCode);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!transactionId || !enteredCode || !referenceNumber) {
      alert("Ingresa el número de referencia y tu código de verificación.");
      return;
    }
    setVerifying(true);

    try {
      const res = await fetch("/api/payments/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, enteredCode, referenceNumber }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al verificar");
      
      setSuccess(true);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al verificar el pago");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyUsdt = async () => {
    if (!transactionId || !usdtTxHash) return;
    setVerifyingUsdt(true);

    try {
      const res = await fetch("/api/payments/verify-usdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ txHash: usdtTxHash, transactionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al verificar el pago en USDT");

      setSuccess(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al verificar el pago en USDT");
    } finally {
      setVerifyingUsdt(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (paymentCode) {
      navigator.clipboard.writeText(paymentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (success) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-green-500/20 p-4 rounded-full mb-6">
          <ShieldCheck className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">¡Pago Confirmado!</h2>
        <p className="text-gray-400 max-w-md">
          Tu suscripción ha sido activada automáticamente. Ya puedes disfrutar de todo el contenido premium.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <h1 className="text-3xl font-black italic text-white uppercase mb-8 relative z-10">
        Planes de <span className="text-orange-500">Suscripción</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-12 relative z-10">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => { if (!transactionId) setSelectedPlan(plan.id); }}
            className={`cursor-pointer rounded-3xl p-8 transition-all duration-300 relative overflow-hidden backdrop-blur-xl border ${
              selectedPlan === plan.id 
                ? "bg-white/10 border-orange-500/50 shadow-[0_8px_32px_rgba(249,115,22,0.2)] scale-[1.02]" 
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1 shadow-lg"
            } ${transactionId ? "opacity-50 pointer-events-none" : ""}`}
          >
            {selectedPlan === plan.id && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl shadow-md">
                SELECCIONADO
              </div>
            )}
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
            <div className="flex items-end gap-2 mb-6">
              <p className="text-5xl font-black text-orange-500">${plan.priceUSD}</p>
              <p className="text-sm text-gray-400 mb-1">USD / {formatCUP(plan.priceCUP)} CUP</p>
            </div>
            <ul className="space-y-4 text-sm text-gray-300">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-1 rounded-full">
                    <Check className="w-3 h-3 text-orange-500 shrink-0" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h3 className="text-xl font-bold text-white mb-6">Método de Pago</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => { if (!transactionId) setPaymentMethod(method.id); }}
                className={`flex flex-col items-center p-5 rounded-2xl transition-all duration-300 border ${
                  paymentMethod === method.id 
                    ? "bg-orange-500/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-105" 
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:-translate-y-1"
                } ${transactionId ? "opacity-50 pointer-events-none" : ""}`}
              >
                <method.icon className={`w-8 h-8 mb-3 ${paymentMethod === method.id ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className={`font-bold text-sm ${paymentMethod === method.id ? 'text-white' : 'text-gray-300'}`}>{method.name}</span>
                <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{method.desc}</span>
              </button>
            ))}
          </div>

          {paymentMethod && (
            <div className="border-t border-white/10 pt-6">
              
              {paymentMethod === "TRANSFERMOVIL" && (
                <div className="space-y-4 mb-6">
                  <p className="text-gray-300 text-sm">
                    Realiza una transferencia por <strong className="text-orange-400">{formatCUP(PLANS.find(p => p.id === selectedPlan)?.priceCUP || 0)} CUP</strong> a la siguiente tarjeta:
                  </p>
                  <SecureCard number="9224-9598-7180-4702" label="Tarjeta CUP (Transfermóvil)" />
                </div>
              )}

              {paymentMethod === "CARD" && (
                <div className="space-y-4 mb-6">
                   <p className="text-gray-300 text-sm">
                    Realiza el pago por <strong className="text-orange-400">${PLANS.find(p => p.id === selectedPlan)?.priceUSD} USD</strong> a la siguiente tarjeta:
                  </p>
                  <SecureCard number="9760-0390-0096-2729" label="Tarjeta Clásica (USD)" />
                </div>
              )}

              {paymentMethod === "USDT" && (
                <div className="space-y-4 mb-6">
                  <p className="text-gray-300 text-sm">
                    Envía el monto exacto en USDT (Red TRON / TRC-20) a la siguiente dirección:
                  </p>

                  <div className="bg-white p-4 rounded-xl flex justify-center">
                    <QRCodeSVG
                      value={`tron:${YOUR_WALLET}?amount=${PLANS.find(p => p.id === selectedPlan)?.priceUSD}&token=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`}
                      size={200}
                      level="H"
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Dirección TRON (TRC-20):</p>
                    <p className="font-mono text-orange-400 break-all select-all text-sm">{YOUR_WALLET}</p>
                  </div>

                  {transactionId && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">
                        Hash de la Transacción (TxID)
                      </label>
                      <input
                        type="text"
                        placeholder="Pega aquí el hash de tu transacción"
                        className="w-full bg-[#090a0e] border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-orange-500"
                        value={usdtTxHash}
                        onChange={(e) => setUsdtTxHash(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lo encuentras en tu wallet después de enviar los USDT.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "QVAPAY" && (
                <p className="text-gray-400 text-sm mb-6">Serás redirigido a la pasarela segura de QvaPay para completar el pago.</p>
              )}

              {!transactionId && (
                <button
                  onClick={handleCreateTransaction}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] disabled:opacity-50"
                >
                  {loading ? "Procesando..." : paymentMethod === "QVAPAY" ? "Pagar con QvaPay" : "He realizado el pago / Continuar"}
                </button>
              )}

              {transactionId && (paymentMethod === "TRANSFERMOVIL" || paymentMethod === "CARD") && (
                <div className="flex flex-col gap-6 bg-orange-500/5 border border-orange-500/20 p-6 rounded-2xl animate-in fade-in zoom-in-95">
                  
                  <div className="text-center bg-[#090a0e] p-5 rounded-xl border border-gray-800 relative">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Tu Código de Verificación</p>
                    <p className="text-3xl font-black text-orange-500 tracking-widest font-mono select-all">
                      {paymentCode}
                    </p>
                    <button
                      onClick={copyCodeToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedCode ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <p className="text-[10px] text-gray-500 mt-3 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3 h-3 text-orange-500" /> Guarda este código. Expira en 30 minutos.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Número de Transacción ETECSA</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Ej. BR601FJVAX997"
                      className="w-full bg-[#090a0e] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Ingresa tu Código de Verificación</label>
                    <input
                      type="text"
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                      placeholder="SETG-XXXX-XXXX"
                      className="w-full bg-[#090a0e] border border-gray-700 rounded-lg p-3 text-white font-mono focus:outline-none focus:border-orange-500 tracking-widest"
                    />
                  </div>

                  <button
                    onClick={handleVerifyCode}
                    disabled={verifying}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
                  >
                    {verifying ? "Verificando..." : "Verificar Pago"}
                  </button>
                </div>
              )}

              {transactionId && paymentMethod === "USDT" && (
                <button
                  onClick={handleVerifyUsdt}
                  disabled={verifyingUsdt || !usdtTxHash}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
                >
                  {verifyingUsdt ? "Verificando en Blockchain..." : "Verificar Pago y Activar Suscripción"}
                </button>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
