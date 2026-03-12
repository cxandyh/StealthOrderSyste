import { FactoryOrderStatus, Prisma } from "@/generated/prisma/client";
import { createFactoryOrderAction, updateFactoryOrderAction } from "@/features/orders/actions";
import { FACTORY_ORDER_STATUS_OPTIONS } from "@/features/orders/constants";
import { SessionUser } from "@/features/auth/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type DealerOption = Prisma.DealerGetPayload<object>;
type SupplierOption = Prisma.SupplierGetPayload<object>;
type OrderOption = Prisma.FactoryOrderGetPayload<object>;

export function OrderForm({
  dealers,
  order,
  redirectTo,
  suppliers,
  user,
}: {
  dealers: DealerOption[];
  order?: OrderOption | null;
  redirectTo?: string;
  suppliers: SupplierOption[];
  user: SessionUser;
}) {
  const action = order ? updateFactoryOrderAction : createFactoryOrderAction;

  return (
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>{order ? "Order settings" : "Create factory order"}</CardTitle>
        <CardDescription>
          Set the dealer, supplier, order number, and overall batch status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 lg:grid-cols-2">
          {order ? <input name="orderId" type="hidden" value={order.id} /> : null}
          {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}
          {user.role === "ADMIN" ? (
            <div className="space-y-2">
              <Label htmlFor="dealerId">Dealer</Label>
              <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={order?.dealerId ?? dealers[0]?.id} id="dealerId" name="dealerId" required>
                {dealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input name="dealerId" type="hidden" value={user.dealerId ?? ""} />
          )}
          <div className="space-y-2">
            <Label htmlFor="supplierId">Factory</Label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={order?.supplierId ?? suppliers[0]?.id} id="supplierId" name="supplierId" required>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input defaultValue={order?.orderNumber ?? ""} id="orderNumber" name="orderNumber" placeholder="SOS-1003" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Order status</Label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={order?.status ?? FactoryOrderStatus.DRAFT} id="status" name="status">
              {FACTORY_ORDER_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="title">Batch title</Label>
            <Input defaultValue={order?.title ?? ""} id="title" name="title" placeholder="Autumn custom build batch" />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea defaultValue={order?.notes ?? ""} id="notes" name="notes" placeholder="Shared context for receiving, handover, or clarifications." rows={4} />
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">{order ? "Save order" : "Create order"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
