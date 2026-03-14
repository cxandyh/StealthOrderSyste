import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileStack, LifeBuoy, PackageCheck, ShipWheel } from "lucide-react";

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
import { FactoryOrderStatus } from "@/generated/prisma/client";

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
  const canStartReceiving =
    order.status === FactoryOrderStatus.CONFIRMED ||
    order.status === FactoryOrderStatus.ARRIVED;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
        <div className="grid gap-6 px-6 py-8 xl:grid-cols-[1.15fr_0.85fr] xl:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-300">
              Order detail
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              {order.orderNumber}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              {order.title ?? "Untitled batch"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge value={order.status} />
              <div className="rounded-full border border-white/12 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                {order.dealer.name}
              </div>
              <div className="rounded-full border border-white/12 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-300">
                {order.supplier.name}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {canManageDealerData(user) ? (
                <Button asChild variant="secondary">
                  <Link href={`/app/orders/${order.id}/builds/new`}>
                    <FileStack className="mr-2 size-4" />
                    Add kayak to order
                  </Link>
                </Button>
              ) : null}
              {canManageDealerData(user) ? (
                activeReceivingSession ? (
                  <Button asChild>
                    <Link href={`/app/orders/${order.id}/receiving/${activeReceivingSession.id}`}>
                      <PackageCheck className="mr-2 size-4" />
                      Open receiving
                    </Link>
                  </Button>
                ) : canStartReceiving ? (
                  <form action={startReceivingSessionAction}>
                    <input name="orderId" type="hidden" value={order.id} />
                    <Button type="submit">
                      <ShipWheel className="mr-2 size-4" />
                      Start receiving
                    </Button>
                  </form>
                ) : null
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Builds</p>
              <p className="mt-3 text-3xl font-semibold">{order.builds.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Item lines</p>
              <p className="mt-3 text-3xl font-semibold">{order.items.length}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Submitted</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{formatDateTime(order.submittedAt)}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/6 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Created by</p>
              <p className="mt-3 text-sm font-medium text-slate-200">{order.createdByUser.name}</p>
            </div>
          </div>
        </div>
      </section>

      {!activeReceivingSession && canManageDealerData(user) && !canStartReceiving ? (
        <div className="flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <LifeBuoy className="size-4 shrink-0" />
          Receiving is intentionally locked until the order is confirmed or marked arrived.
        </div>
      ) : null}

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
          <p className="text-sm text-slate-500">
            {order.builds.length} build(s) • compact list with expandable detail
          </p>
        </div>
        <div className="grid gap-6">
          {order.builds.map((build, index) => (
            <BuildSummaryCard
              build={build}
              defaultOpen={index === 0}
              key={build.id}
              orderId={order.id}
              user={user}
            />
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
                  <div className="flex items-center gap-3">
                    <StatusBadge value={item.category} />
                    <ArrowRight className="size-4 text-slate-300" />
                  </div>
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
