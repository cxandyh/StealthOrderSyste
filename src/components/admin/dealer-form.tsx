import { Prisma } from "@/generated/prisma/client";
import { saveDealerAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DealerRecord = Prisma.DealerGetPayload<{
  include: {
    _count: {
      select: {
        customers: true;
        factoryOrders: true;
        users: true;
      };
    };
  };
}>;

export function DealerForm({ dealer }: { dealer?: DealerRecord }) {
  return (
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>{dealer ? dealer.name : "Create dealer"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveDealerAction} className="grid gap-4 lg:grid-cols-2">
          {dealer ? <input name="dealerId" type="hidden" value={dealer.id} /> : null}
          <div className="space-y-2">
            <Label htmlFor={`name-${dealer?.id ?? "new"}`}>Name</Label>
            <Input defaultValue={dealer?.name ?? ""} id={`name-${dealer?.id ?? "new"}`} name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`slug-${dealer?.id ?? "new"}`}>Slug</Label>
            <Input defaultValue={dealer?.slug ?? ""} id={`slug-${dealer?.id ?? "new"}`} name="slug" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`region-${dealer?.id ?? "new"}`}>Region</Label>
            <Input defaultValue={dealer?.region ?? ""} id={`region-${dealer?.id ?? "new"}`} name="region" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`currency-${dealer?.id ?? "new"}`}>Currency</Label>
            <Input defaultValue={dealer?.currency ?? ""} id={`currency-${dealer?.id ?? "new"}`} name="currency" required />
          </div>
          <div className="flex items-center gap-3 lg:col-span-2">
            <input
              className="size-4 rounded border-slate-300"
              defaultChecked={dealer?.isActive ?? true}
              id={`isActive-${dealer?.id ?? "new"}`}
              name="isActive"
              type="checkbox"
            />
            <Label htmlFor={`isActive-${dealer?.id ?? "new"}`}>Dealer is active</Label>
          </div>
          <div className="lg:col-span-2 flex items-center justify-between gap-3">
            {dealer ? (
              <p className="text-sm text-slate-500">
                {dealer._count.users} users • {dealer._count.factoryOrders} orders • {dealer._count.customers} customers
              </p>
            ) : (
              <p className="text-sm text-slate-500">Create a new dealer tenant for future order scoping.</p>
            )}
            <Button type="submit">{dealer ? "Save dealer" : "Create dealer"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
