import Link from "next/link";
import { Compass, Layers3, PlusSquare, ShieldCheck, UsersRound } from "lucide-react";

import { signOut } from "@/auth";
import { canManageDealerData, isAdmin } from "@/features/auth/permissions";
import { ROLE_LABELS } from "@/features/orders/constants";
import { SessionUser } from "@/features/auth/permissions";
import { AppNavLink } from "@/components/layout/app-nav-link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export async function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.14),_transparent_30%),linear-gradient(180deg,_#f3f7fb_0%,_#ebf1f6_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-80 shrink-0 rounded-[2rem] border border-white/8 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/15 lg:flex lg:flex-col">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">
              Stealth Order Hub
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Factory ops console
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              Guided ordering, build review, customer updates, and receiving in one workflow.
            </p>
          </div>
          <Separator className="my-6 bg-white/10" />
          <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Current role
            </p>
            <p className="mt-2 text-lg font-semibold text-white">{ROLE_LABELS[user.role]}</p>
            <p className="mt-2 text-sm text-slate-400">
              {isAdmin(user)
                ? "Cross-dealer oversight and setup"
                : canManageDealerData(user)
                  ? "Dealer-side order operations"
                  : "Factory-side build collaboration"}
            </p>
          </div>
          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Workflow
              </p>
              <nav className="space-y-2">
                <AppNavLink href="/app" label="Dashboard" />
                <AppNavLink href="/app/orders" label="Orders" />
                {canManageDealerData(user) ? (
                  <AppNavLink href="/app/orders/new" label="New order" />
                ) : null}
              </nav>
            </div>
            {canManageDealerData(user) ? (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Admin
                </p>
                <nav className="space-y-2">
                  <AppNavLink href="/app/admin/users" label="Users" />
                  {isAdmin(user) ? (
                    <AppNavLink href="/app/admin/dealers" label="Dealers" />
                  ) : null}
                </nav>
              </div>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3">
            {[
              { icon: Compass, label: "Review-first layouts" },
              { icon: Layers3, label: "Expandable build cards" },
              ...(canManageDealerData(user)
                ? [{ icon: PlusSquare, label: "Duplicate repeat builds" }]
                : []),
              ...(isAdmin(user)
                ? [{ icon: ShieldCheck, label: "Tenant controls" }]
                : [{ icon: UsersRound, label: "Role-safe access" }]),
            ].map(({ icon: Icon, label }) => (
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300" key={label}>
                <Icon className="size-4 text-teal-300" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-3xl border border-white/8 bg-white/5 p-4 text-slate-50">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {ROLE_LABELS[user.role]}
            </p>
            <p className="mt-3 text-xs text-slate-400">{user.email}</p>
            <form action={logout} className="mt-4">
              <Button className="w-full" type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </aside>
        <div className="flex min-h-full flex-1 flex-col gap-4">
          <header className="rounded-[2rem] border border-white/70 bg-white/85 px-5 py-4 shadow-lg shadow-slate-950/5 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Stealth Order Hub
                </p>
                <p className="mt-1 text-sm text-slate-600">{ROLE_LABELS[user.role]}</p>
              </div>
              <form action={logout}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700" href="/app">
                Dashboard
              </Link>
              <Link className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700" href="/app/orders">
                Orders
              </Link>
            </div>
          </header>
          <main className="flex-1 rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-xl shadow-slate-950/5 backdrop-blur lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
