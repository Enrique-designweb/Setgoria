// app/(dashboard)/admin/pagos/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreditCard, ArrowLeft } from "lucide-react";
import AdminPaymentItem from "./AdminPaymentItem";
import Link from "next/link";
import { Prisma, TransactionStatus } from "@/src/generated/prisma/client";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "PENDING", label: "Pendientes" },
  { key: "PENDING_REVIEW", label: "Por Revisar" },
  { key: "COMPLETED", label: "Completados" },
  { key: "FAILED", label: "Fallidos" },
] as const;

// ❌ Eliminamos "type FilterKey" porque no se usa

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const { status = "all" } = await searchParams;
  const validStatus = FILTERS.some((f) => f.key === status) ? status : "all";

  const where: Prisma.TransactionWhereInput =
    validStatus === "all" ? {} : { status: validStatus as TransactionStatus };

  const transactions = await prisma.transaction.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const serialized = transactions.map((tx) => ({
    ...tx,
    amount: Number(tx.amount),
  }));

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="p-2 bg-[#1A1D24] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tight flex items-center gap-2">
            <CreditCard className="text-orange-500 w-6 h-6" /> Gestión de Pagos
          </h1>
          <p className="text-sm text-gray-400 mt-1">Auditoría completa de ingresos.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/pagos?status=${f.key}`}
            className={`shrink-0 text-xs font-bold px-4 py-2 rounded-lg border transition ${
              validStatus === f.key
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-[#1A1D24] text-gray-400 border-gray-800 hover:border-orange-500/50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {serialized.length === 0 ? (
          <div className="bg-[#1A1D24] border border-gray-800 rounded-2xl p-10 text-center">
            <div className="mx-auto bg-gray-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
              <CreditCard className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-white mt-4">Sin transacciones</h2>
            <p className="text-gray-400 text-sm mt-1">No hay pagos con este filtro.</p>
          </div>
        ) : (
          serialized.map((tx) => (
            <AdminPaymentItem key={tx.id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
}
