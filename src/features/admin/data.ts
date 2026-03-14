import { cache } from "react";

import { Prisma, UserRole } from "@/generated/prisma/client";
import { SessionUser, canAccessDealer, isAdmin } from "@/features/auth/permissions";
import { db } from "@/lib/db";

export const getDealerManagementData = cache(async () => {
  return db.dealer.findMany({
    include: {
      _count: {
        select: {
          customers: true,
          factoryOrders: true,
          users: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
});

export async function listUsersForManagement(user: SessionUser) {
  const where: Prisma.UserWhereInput = isAdmin(user)
    ? {}
    : {
        dealerId: user.dealerId ?? "",
      };

  return db.user.findMany({
    where,
    include: {
      dealer: true,
      supplier: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function getUserManagementContext(user: SessionUser) {
  const [users, dealers, suppliers] = await Promise.all([
    listUsersForManagement(user),
    isAdmin(user)
      ? db.dealer.findMany({
          orderBy: { name: "asc" },
        })
      : db.dealer.findMany({
          where: {
            id: user.dealerId ?? "",
          },
        }),
    db.supplier.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return { dealers, suppliers, users };
}

export function canManageTargetUser(
  actor: SessionUser,
  target: { dealerId: string | null; role: UserRole },
) {
  if (isAdmin(actor)) {
    return true;
  }

  if (!target.dealerId) {
    return false;
  }

  return (
    actor.role === UserRole.DEALER_ADMIN &&
    target.role === UserRole.DEALER_ADMIN &&
    canAccessDealer(actor, target.dealerId)
  );
}
