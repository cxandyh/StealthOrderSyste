import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  if (session?.user) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_35%),linear-gradient(180deg,_#e7eef5_0%,_#f8fafc_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[2.5rem] bg-slate-950 p-10 text-slate-50 shadow-2xl shadow-slate-950/20 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-300">
            Stealth Order Hub
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight">
            A clearer factory order workflow for configurable kayaks.
          </h1>
          <div className="mt-10 grid gap-4">
            {[
              "Multi-dealer-aware order workspace",
              "Dealer and factory build comment threads",
              "Tokenized customer progress portal",
              "Receiving and discrepancy workflow",
            ].map((item) => (
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm" key={item}>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            Demo logins use password <strong className="text-white">stealth-demo</strong>.
            Dealer admin: <strong className="text-white">dealer@stealthorderhub.local</strong>
          </div>
        </div>
        <div className="self-center">
          <LoginForm next={params?.next} />
        </div>
      </div>
    </div>
  );
}
