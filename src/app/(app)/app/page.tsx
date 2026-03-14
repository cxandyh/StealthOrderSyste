import Link from "next/link";
import { ArrowRight, ClipboardList, Package2, ShieldAlert, Waves } from "lucide-react";

import { canManageDealerData } from "@/features/auth/permissions";
import { requireUser } from "@/features/auth/session";
import { getDashboardData, listOrdersForUser } from "@/features/orders/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireUser();
  const [metrics, recentOrders] = await Promise.all([
    getDashboardData(user),
    listOrdersForUser(user),
  ]);
  const canManage = canManageDealerData(user);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">
              Overview
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight">
              Order operations with less hunting and less spreadsheet memory.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300">
              The dashboard is now aimed at next actions first: open orders, build throughput, arrivals, and unresolved issues.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950" href="/app/orders">
                Open order queue
              </Link>
              {canManage ? (
                <Link className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white" href="/app/orders/new">
                  Create factory order
                </Link>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ClipboardList, label: "Orders in workspace", value: metrics.orders },
              { icon: Waves, label: "Builds in motion", value: metrics.builds },
              { icon: Package2, label: "Arrival / receiving", value: metrics.arrivals },
              { icon: ShieldAlert, label: "Open discrepancies", value: metrics.discrepancies },
            ].map(({ icon: Icon, label, value }) => (
              <div className="rounded-3xl border border-white/10 bg-white/6 p-4" key={label}>
                <Icon className="size-5 text-teal-300" />
                <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
                <p className="mt-2 text-sm text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader className="flex flex-row items-end justify-between gap-4">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <p className="mt-2 text-sm text-slate-500">
                Fast access to the batches you are most likely to reopen.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/app/orders">Open all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.slice(0, 6).map((order) => (
              <Link
                className="group flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                href={`/app/orders/${order.id}`}
                key={order.id}
              >
                <div>
                  <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.title ?? order.supplier.name} • {order._count.builds} builds / {order._count.items} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-slate-700">{order.status.replaceAll("_", " ")}</p>
                  <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle>Operating logic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {[
              "Create the order once, then add or duplicate builds instead of retyping each kayak from scratch.",
              "Use compact build cards on the order page to scan a whole batch before opening detail.",
              "Customer status stays separate from internal status so the public portal remains simple.",
            ].map((item) => (
              <div className="rounded-3xl bg-slate-50 px-4 py-4" key={item}>
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
