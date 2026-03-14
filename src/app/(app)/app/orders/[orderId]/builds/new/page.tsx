import { notFound } from "next/navigation";

import { BuildForm } from "@/components/orders/build-form";
import { canManageDealerData } from "@/features/auth/permissions";
import { requireUser } from "@/features/auth/session";
import { getOrderForUser } from "@/features/orders/data";

export default async function NewBuildPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireUser();

  if (!canManageDealerData(user)) {
    notFound();
  }

  const order = await getOrderForUser(user, orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          New kayak
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Add kayak to order {order.orderNumber}
        </h1>
      </div>
      <BuildForm orderId={order.id} redirectTo={`/app/orders/${order.id}`} />
    </div>
  );
}
