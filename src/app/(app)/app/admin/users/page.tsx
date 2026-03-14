import { UserRole } from "@/generated/prisma/client";
import { UserForm } from "@/components/admin/user-form";
import { StatusBadge } from "@/components/orders/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserManagementContext } from "@/features/admin/data";
import { isAdmin } from "@/features/auth/permissions";
import { requireRole } from "@/features/auth/session";
import { ROLE_LABELS } from "@/features/orders/constants";
import { formatDateTime } from "@/lib/format";

export default async function UserManagementPage() {
  const actor = await requireRole([UserRole.ADMIN, UserRole.DEALER_ADMIN]);
  const { dealers, suppliers, users } = await getUserManagementContext(actor);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          User management
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          {isAdmin(actor)
            ? "Create and manage internal users across admin, dealer, and factory roles."
            : "Manage internal dealer users for your own tenant."}
        </p>
      </div>

      <UserForm actor={actor} dealers={dealers} suppliers={suppliers} />

      <div className="grid gap-6 xl:grid-cols-2">
        {users.map((user) => (
          <Card className="rounded-[2rem] border-slate-200 shadow-none" key={user.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{user.name}</CardTitle>
                <p className="mt-2 text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={user.role} />
                <StatusBadge value={user.isActive ? "READY" : "DRAFT"} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600">
                <p>{ROLE_LABELS[user.role]}</p>
                <p>{user.dealer?.name ?? "No dealer assignment"}</p>
                <p>{user.supplier?.name ?? "No supplier assignment"}</p>
                <p>Last login: {formatDateTime(user.lastLoginAt)}</p>
              </div>
              <UserForm actor={actor} dealers={dealers} suppliers={suppliers} user={user} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
