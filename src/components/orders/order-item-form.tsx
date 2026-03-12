import { Prisma } from "@/generated/prisma/client";
import { addOrderItemAction } from "@/features/orders/actions";
import { ORDER_ITEM_CATEGORY_OPTIONS } from "@/features/orders/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type LinkedBuild = Prisma.KayakBuildGetPayload<{
  include: {
    customer: true;
  };
}>;

export function OrderItemForm({
  builds,
  orderId,
}: {
  builds: LinkedBuild[];
  orderId: string;
}) {
  return (
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Add SKU line</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={addOrderItemAction} className="grid gap-4 lg:grid-cols-2">
          <input name="orderId" type="hidden" value={orderId} />
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue="ACCESSORY" id="category" name="category">
              {ORDER_ITEM_CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {category.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedKayakBuildId">Linked build</Label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue="" id="linkedKayakBuildId" name="linkedKayakBuildId">
              <option value="">Standalone line</option>
              {builds.map((build) => (
                <option key={build.id} value={build.id}>
                  {build.model} - {build.customer ? `${build.customer.firstName} ${build.customer.lastName}` : build.allocationLabel}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" placeholder="RUD-KIT-01" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Item name</Label>
            <Input id="name" name="name" placeholder="Rudder install kit" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input defaultValue={1} id="quantity" min={1} name="quantity" required type="number" />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Optional install or packing note." rows={3} />
          </div>
          <div className="lg:col-span-2">
            <Button type="submit">Add line</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
