import Link from "next/link";
import { ArrowRight, Filter, PlusSquare } from "lucide-react";

import { FactoryOrderStatus } from "@/generated/prisma/client";
import { canManageDealerData } from "@/features/auth/permissions";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/features/auth/session";
import { listOrdersForUser } from "@/features/orders/data";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: FactoryOrderStatus | "ALL" }>;
}) {
  const params = await searchParams;
  const status = params?.status ?? "ALL";
  const user = await requireUser();
  const orders = await listOrdersForUser(user, status);
  const canManage = canManageDealerData(user);

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
              Orders
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Factory order queue
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              The queue is tuned for scanning batches quickly, not filling rows in a spreadsheet.
            </p>
          </div>
          {canManage ? (
            <Button asChild>
              <Link href="/app/orders/new">
                <PlusSquare className="mr-2 size-4" />
                Create order
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-3xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 px-2 text-sm font-medium text-slate-500">
            <Filter className="size-4" />
            Status
          </div>
          {["ALL", ...Object.values(FactoryOrderStatus)].map((option) => (
            <Button asChild key={option} size="sm" variant={status === option ? "default" : "outline"}>
              <Link href={`/app/orders?status=${option}`}>{option.replaceAll("_", " ")}</Link>
            </Button>
          ))}
        </div>
      </section>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Link
            className="group rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            href={`/app/orders/${order.id}`}
            key={order.id}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold text-slate-950">{order.orderNumber}</p>
                  <StatusBadge value={order.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{order.title ?? "Untitled batch"}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{order.dealer.name}</span>
                <span>•</span>
                <span>{order.supplier.name}</span>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_auto]">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Builds</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{order._count.builds}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Item lines</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{order._count.items}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Updated</p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {new Intl.DateTimeFormat("en-NZ", {
                    dateStyle: "medium",
                  }).format(order.updatedAt)}
                </p>
              </div>
              <div className="flex items-center justify-end text-sm font-medium text-teal-700">
                Open order
                <ArrowRight className="ml-2 size-4 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
