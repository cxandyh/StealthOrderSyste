import { Prisma } from "@/generated/prisma/client";
import {
  completeReceivingSessionAction,
  saveBuildCheckAction,
  saveItemCheckAction,
} from "@/features/orders/actions";
import { RECEIVED_BUILD_STATUS_OPTIONS } from "@/features/orders/constants";
import { fullName } from "@/lib/format";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReceivingSessionDetail = Prisma.ReceivingSessionGetPayload<{
  include: {
    buildChecks: true;
    factoryOrder: {
      include: {
        builds: {
          include: {
            customer: true;
          };
        };
        discrepancies: {
          include: {
            kayakBuild: true;
            orderItem: true;
          };
        };
        items: true;
      };
    };
    itemChecks: true;
    startedByUser: true;
  };
}>;

export function ReceivingSessionView({ session }: { session: ReceivingSessionDetail }) {
  const buildChecks = new Map(session.buildChecks.map((check) => [check.kayakBuildId, check]));
  const itemChecks = new Map(session.itemChecks.map((check) => [check.orderItemId, check]));

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] border-slate-200 shadow-none">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>{session.factoryOrder.orderNumber} receiving</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Started by {session.startedByUser.name}. Save each build and item as it is checked.
            </p>
          </div>
          <StatusBadge value={session.status} />
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Kayak checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.factoryOrder.builds.map((build) => {
                const check = buildChecks.get(build.id);
                return (
                  <form action={saveBuildCheckAction} className="space-y-4 rounded-3xl border border-slate-200 p-4" key={build.id}>
                    <input name="buildId" type="hidden" value={build.id} />
                    <input name="orderId" type="hidden" value={session.factoryOrderId} />
                    <input name="redirectTo" type="hidden" value={`/app/orders/${session.factoryOrderId}/receiving/${session.id}`} />
                    <input name="sessionId" type="hidden" value={session.id} />
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{build.model}</p>
                        <p className="text-sm text-slate-500">
                          {build.customer ? fullName(build.customer.firstName, build.customer.lastName) : build.allocationLabel ?? "Stock build"}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">
                        Expected serial: {build.serialNumber ?? "Not supplied"}
                      </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={check?.receivedStatus ?? "PENDING"} name="receivedStatus">
                          {RECEIVED_BUILD_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Received serial</Label>
                        <Input defaultValue={check?.receivedSerialNumber ?? ""} name="receivedSerialNumber" />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                        <Label>Notes</Label>
                        <Textarea defaultValue={check?.notes ?? ""} name="notes" rows={2} />
                      </div>
                    </div>
                    <Button type="submit" variant="outline">
                      Save build check
                    </Button>
                  </form>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>SKU line checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.factoryOrder.items.map((item) => {
                const check = itemChecks.get(item.id);
                return (
                  <form action={saveItemCheckAction} className="space-y-4 rounded-3xl border border-slate-200 p-4" key={item.id}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <input name="orderId" type="hidden" value={session.factoryOrderId} />
                    <input name="redirectTo" type="hidden" value={`/app/orders/${session.factoryOrderId}/receiving/${session.id}`} />
                    <input name="sessionId" type="hidden" value={session.id} />
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.sku} • expected qty {item.quantity}
                        </p>
                      </div>
                      <StatusBadge value={item.category} />
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Received quantity</Label>
                        <Input defaultValue={check?.receivedQty ?? item.quantity} min={0} name="receivedQty" type="number" />
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <Label>Notes</Label>
                        <Textarea defaultValue={check?.notes ?? ""} name="notes" rows={2} />
                      </div>
                    </div>
                    <Button type="submit" variant="outline">
                      Save item check
                    </Button>
                  </form>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Open discrepancies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {session.factoryOrder.discrepancies.length === 0 ? (
                <p className="text-sm text-slate-500">No open discrepancies.</p>
              ) : (
                session.factoryOrder.discrepancies.map((discrepancy) => (
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

          <Card className="rounded-[2rem] border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle>Complete receiving</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={completeReceivingSessionAction} className="space-y-4">
                <input name="orderId" type="hidden" value={session.factoryOrderId} />
                <input name="redirectTo" type="hidden" value={`/app/orders/${session.factoryOrderId}`} />
                <input name="sessionId" type="hidden" value={session.id} />
                <p className="text-sm text-slate-500">
                  Completing the session marks the order as completed while preserving any open discrepancy records.
                </p>
                <Button type="submit">Complete receiving session</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
