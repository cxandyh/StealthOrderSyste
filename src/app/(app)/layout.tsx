import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/features/auth/session";

export default async function InternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return <AppShell user={user}>{children}</AppShell>;
}
