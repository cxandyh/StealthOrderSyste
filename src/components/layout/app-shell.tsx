import Link from "next/link";

import { signOut } from "@/auth";
import { canManageDealerData } from "@/features/auth/permissions";
import { ROLE_LABELS } from "@/features/orders/constants";
import { SessionUser } from "@/features/auth/permissions";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.10),_transparent_35%),linear-gradient(180deg,_#f5f7fb_0%,_#eef2f7_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-950/5 backdrop-blur lg:flex lg:flex-col">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              Stealth Order Hub
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950">
              Factory order workspace
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Multi-dealer ordering, build review, customer status, and receiving.
            </p>
          </div>
          <Separator className="my-6" />
          <nav className="space-y-2">
            {[
              { href: "/app", label: "Dashboard" },
              { href: "/app/orders", label: "Orders" },
              ...(canManageDealerData(user)
                ? [{ href: "/app/orders/new", label: "New order" }]
                : []),
            ].map((link) => (
              <Link
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-slate-50">
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
          </header>
          <main className="flex-1 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-950/5 backdrop-blur lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
