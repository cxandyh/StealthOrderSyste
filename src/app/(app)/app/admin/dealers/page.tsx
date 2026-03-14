import { DealerForm } from "@/components/admin/dealer-form";
import { requireRole } from "@/features/auth/session";
import { getDealerManagementData } from "@/features/admin/data";
import { UserRole } from "@/generated/prisma/client";

export default async function DealerManagementPage() {
  await requireRole([UserRole.ADMIN]);
  const dealers = await getDealerManagementData();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Dealer management
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Manage tenant records, activity state, and dealer metadata used for order scoping.
        </p>
      </div>

      <DealerForm />

      <div className="grid gap-6 xl:grid-cols-2">
        {dealers.map((dealer) => (
          <DealerForm dealer={dealer} key={dealer.id} />
        ))}
      </div>
    </div>
  );
}
