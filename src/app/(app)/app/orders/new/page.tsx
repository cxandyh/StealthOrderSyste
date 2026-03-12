import { notFound } from "next/navigation";

import { OrderForm } from "@/components/orders/order-form";
import { requireUser } from "@/features/auth/session";
import { listNewOrderContext } from "@/features/orders/data";

export default async function NewOrderPage() {
  const user = await requireUser();
  const context = await listNewOrderContext(user);

  if (!context) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          New order
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Create factory order
        </h1>
      </div>
      <OrderForm dealers={context.dealers} suppliers={context.suppliers} user={user} />
    </div>
  );
}
