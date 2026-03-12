import Link from "next/link";
import { notFound } from "next/navigation";

import { BuildSummaryCard } from "@/components/orders/build-summary-card";
import { OrderItemForm } from "@/components/orders/order-item-form";
import { OrderForm } from "@/components/orders/order-form";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startReceivingSessionAction } from "@/features/orders/actions";
import { canManageDealerData } from "@/features/auth/permissions";
import { requireUser } from "@/features/auth/session";
import { getOrderForUser, listDealers, listSuppliers } from "@/features/orders/data";
import { formatDateTime } from "@/lib/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireUser();
  const order = await getOrderForUser(user, orderId);

  if (!order) {
    notFound();
  }

  const [dealers, suppliers] = canManageDealerData(user)
    ? await Promise.all([listDealers(), listSuppliers()])
    : [[], []];
  const activeReceivingSession = order.receivingSessions.find(
    (session) => session.status === "IN_PROGRESS",
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Order detail
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {order.orderNumber}
          </h1>
          <p className="mt-3 text-sm text-slate-600">{order.title ?? "Untitled batch"}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatusBadge value={order.status} />
          {canManageDealerData(user) ? (
            <Button asChild variant="outline">
              <Link href={`/app/orders/${order.id}/builds/new`}>Add build</Link>
            </Button>
          ) : null}
          {canManageDealerData(user) ? (
            activeReceivingSession ? (
              <Button asChild>
                <Link href={`/app/orders/${order.id}/receiving/${activeReceivingSession.id}`}>
                  Open receiving
                </Link>
              </Button>
            ) : (
              <form action={startReceivingSessionAction}>
                <input name="orderId" type="hidden" value={order.id} />
                <Button type="submit">Start receiving</Button>
              </form>
            )
          ) : null}
        </div>
      </div>

      {canManageDealerData(user) ? (
        <OrderForm dealers={dealers} order={order} redirectTo={`/app/orders/${order.id}`} suppliers={suppliers} user={user} />
      ) : (
        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle>Order overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <p>Dealer: {order.dealer.name}</p>
            <p>Factory: {order.supplier.name}</p>
            <p>Submitted: {formatDateTime(order.submittedAt)}</p>
            <p>Created by: {order.createdByUser.name}</p>
            <p className="md:col-span-2">Notes: {order.notes ?? "None"}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Kayak builds</h2>
          <p className="text-sm text-slate-500">{order.builds.length} build(s)</p>
        </div>
        <div className="grid gap-6">
          {order.builds.map((build) => (
            <BuildSummaryCard build={build} key={build.id} orderId={order.id} user={user} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle>Order item lines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.length === 0 ? (
              <p className="text-sm text-slate-500">No SKU lines added yet.</p>
            ) : (
              order.items.map((item) => (
                <div className="flex flex-col gap-2 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.sku}
                      {item.linkedKayakBuild ? ` • linked to ${item.linkedKayakBuild.model}` : ""}
                    </p>
                  </div>
                  <StatusBadge value={item.category} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {canManageDealerData(user) ? (
          <OrderItemForm builds={order.builds} orderId={order.id} />
        ) : null}
      </div>

      <Card className="rounded-[2rem] border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle>Open discrepancies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.discrepancies.length === 0 ? (
            <p className="text-sm text-slate-500">No open receiving discrepancies.</p>
          ) : (
            order.discrepancies.map((discrepancy) => (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4" key={discrepancy.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={discrepancy.discrepancyType} />
                  <StatusBadge value={discrepancy.status} />
                </div>
                <p className="mt-3 text-sm text-slate-700">{discrepancy.description}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
