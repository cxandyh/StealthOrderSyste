import Link from "next/link";

import { FactoryOrderStatus } from "@/generated/prisma/client";
import { canManageDealerData } from "@/features/auth/permissions";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Orders
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Factory order list
          </h1>
        </div>
        {canManage ? (
          <Button asChild>
            <Link href="/app/orders/new">Create order</Link>
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {["ALL", ...Object.values(FactoryOrderStatus)].map((option) => (
          <Button asChild key={option} variant={status === option ? "default" : "outline"}>
            <Link href={`/app/orders?status=${option}`}>{option.replaceAll("_", " ")}</Link>
          </Button>
        ))}
      </div>

      <Card className="rounded-[2rem] border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-3">Order</th>
                <th className="px-3">Dealer</th>
                <th className="px-3">Factory</th>
                <th className="px-3">Status</th>
                <th className="px-3">Counts</th>
                <th className="px-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr className="rounded-3xl bg-slate-50" key={order.id}>
                  <td className="rounded-l-3xl px-3 py-4">
                    <Link className="font-semibold text-slate-900 hover:text-teal-700" href={`/app/orders/${order.id}`}>
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-sm text-slate-500">{order.title ?? "Untitled batch"}</p>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-700">{order.dealer.name}</td>
                  <td className="px-3 py-4 text-sm text-slate-700">{order.supplier.name}</td>
                  <td className="px-3 py-4">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-700">
                    {order._count.builds} builds / {order._count.items} items
                  </td>
                  <td className="rounded-r-3xl px-3 py-4 text-sm text-slate-500">
                    {new Intl.DateTimeFormat("en-NZ", {
                      dateStyle: "medium",
                    }).format(order.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
