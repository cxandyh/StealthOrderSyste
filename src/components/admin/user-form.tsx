import { saveUserAction } from "@/features/admin/actions";
import { isAdmin, SessionUser } from "@/features/auth/permissions";
import { ROLE_LABELS, USER_ROLE_OPTIONS } from "@/features/orders/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRoleValue = (typeof USER_ROLE_OPTIONS)[number];

type DealerRecord = {
  id: string;
  name: string;
};

type SupplierRecord = {
  id: string;
  name: string;
};

type UserRecord = {
  dealer?: DealerRecord | null;
  dealerId?: string | null;
  email: string;
  id: string;
  isActive: boolean;
  name: string;
  role: UserRoleValue;
  supplier?: SupplierRecord | null;
  supplierId?: string | null;
};

export function UserForm({
  actor,
  dealers,
  suppliers,
  user,
}: {
  actor: SessionUser;
  dealers: DealerRecord[];
  suppliers: SupplierRecord[];
  user?: UserRecord;
}) {
  const admin = isAdmin(actor);
  const resolvedRole: UserRoleValue = admin
    ? user?.role ?? "DEALER_ADMIN"
    : "DEALER_ADMIN";

  return (
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>{user ? user.name : "Create user"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveUserAction} className="grid gap-4 lg:grid-cols-2">
          {user ? <input name="userId" type="hidden" value={user.id} /> : null}
          <input name="redirectTo" type="hidden" value="/app/admin/users" />
          <div className="space-y-2">
            <Label htmlFor={`user-name-${user?.id ?? "new"}`}>Name</Label>
            <Input
              defaultValue={user?.name ?? ""}
              id={`user-name-${user?.id ?? "new"}`}
              name="name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`user-email-${user?.id ?? "new"}`}>Email</Label>
            <Input
              defaultValue={user?.email ?? ""}
              id={`user-email-${user?.id ?? "new"}`}
              name="email"
              required
              type="email"
            />
          </div>
          {admin ? (
            <div className="space-y-2">
              <Label htmlFor={`user-role-${user?.id ?? "new"}`}>Role</Label>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                defaultValue={resolvedRole}
                id={`user-role-${user?.id ?? "new"}`}
                name="role"
              >
                {USER_ROLE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {ROLE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input name="role" type="hidden" value="DEALER_ADMIN" />
          )}
          <div className="space-y-2">
            <Label htmlFor={`user-dealer-${user?.id ?? "new"}`}>Dealer</Label>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              defaultValue={user?.dealerId ?? actor.dealerId ?? dealers[0]?.id ?? ""}
              id={`user-dealer-${user?.id ?? "new"}`}
              name="dealerId"
            >
              <option value="">No dealer assignment</option>
              {dealers.map((dealer) => (
                <option key={dealer.id} value={dealer.id}>
                  {dealer.name}
                </option>
              ))}
            </select>
          </div>
          {admin ? (
            <div className="space-y-2">
              <Label htmlFor={`user-supplier-${user?.id ?? "new"}`}>Supplier</Label>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                defaultValue={user?.supplierId ?? suppliers[0]?.id ?? ""}
                id={`user-supplier-${user?.id ?? "new"}`}
                name="supplierId"
              >
                <option value="">No supplier assignment</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input name="supplierId" type="hidden" value="" />
          )}
          <div className="space-y-2">
            <Label htmlFor={`user-password-${user?.id ?? "new"}`}>
              {user ? "New password" : "Password"}
            </Label>
            <Input
              id={`user-password-${user?.id ?? "new"}`}
              name="password"
              placeholder={user ? "Leave blank to keep current password" : "Required"}
              type="password"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              className="size-4 rounded border-slate-300"
              defaultChecked={user?.isActive ?? true}
              id={`user-active-${user?.id ?? "new"}`}
              name="isActive"
              type="checkbox"
            />
            <Label htmlFor={`user-active-${user?.id ?? "new"}`}>User is active</Label>
          </div>
          <div className="lg:col-span-2 flex items-center justify-between gap-3">
            {user ? (
              <p className="text-sm text-slate-500">
                {ROLE_LABELS[user.role]}
                {user.dealer ? ` • ${user.dealer.name}` : ""}
                {user.supplier ? ` • ${user.supplier.name}` : ""}
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                {admin
                  ? "Create an internal admin, dealer, or factory user account."
                  : "Create an internal dealer user account."}
              </p>
            )}
            <Button type="submit">{user ? "Save user" : "Create user"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
