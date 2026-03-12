import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/client";
import { SessionUser } from "@/features/auth/permissions";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user as SessionUser;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    redirect("/app");
  }

  return user;
}
