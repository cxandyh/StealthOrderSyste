import Link from "next/link";

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Order operations at a glance
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Track build volume, arrivals, and unresolved receiving issues across the current workspace.
          </p>
        </div>
        {canManage ? (
          <Button asChild>
            <Link href="/app/orders/new">Create factory order</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ["Orders", metrics.orders],
          ["Builds", metrics.builds],
          ["Arrivals / receiving", metrics.arrivals],
          ["Open discrepancies", metrics.discrepancies],
        ].map(([label, value]) => (
          <Card className="rounded-[2rem] border-slate-200 shadow-none" key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[2rem] border-slate-200 shadow-none">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Button asChild variant="outline">
            <Link href="/app/orders">Open order list</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.slice(0, 5).map((order) => (
            <Link className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50" href={`/app/orders/${order.id}`} key={order.id}>
              <div>
                <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                <p className="text-sm text-slate-500">
                  {order.title ?? order.supplier.name} • {order._count.builds} builds / {order._count.items} items
                </p>
              </div>
              <p className="text-sm font-medium text-slate-700">{order.status.replaceAll("_", " ")}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
