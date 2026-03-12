import { cache } from "react";

import {
  DiscrepancyStatus,
  FactoryOrderStatus,
  Prisma,
  UserRole,
} from "@/generated/prisma/client";
import { SessionUser, canAccessDealer, canManageDealerData, isAdmin, isFactoryUser } from "@/features/auth/permissions";
import { db } from "@/lib/db";

const factoryVisibleStatuses = [
  FactoryOrderStatus.IN_REVIEW,
  FactoryOrderStatus.CONFIRMED,
  FactoryOrderStatus.ARRIVED,
  FactoryOrderStatus.RECEIVING,
  FactoryOrderStatus.COMPLETED,
];

function orderScopeForUser(user: SessionUser): Prisma.FactoryOrderWhereInput {
  if (isAdmin(user)) {
    return {};
  }

  if (isFactoryUser(user)) {
    return {
      supplierId: user.supplierId ?? "",
      status: {
        in: factoryVisibleStatuses,
      },
    };
  }

  return {
    dealerId: user.dealerId ?? "",
  };
}

export async function listDealers() {
  return db.dealer.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listSuppliers() {
  return db.supplier.findMany({
    orderBy: { name: "asc" },
  });
}

export const getDashboardData = cache(async (user: SessionUser) => {
  const orderWhere = orderScopeForUser(user);
  const buildWhere: Prisma.KayakBuildWhereInput = isAdmin(user)
    ? {}
    : isFactoryUser(user)
      ? {
          factoryOrder: {
            supplierId: user.supplierId ?? "",
            status: {
              in: factoryVisibleStatuses,
            },
          },
        }
      : {
          dealerId: user.dealerId ?? "",
        };
  const discrepancyWhere: Prisma.DiscrepancyWhereInput = isAdmin(user)
    ? { status: { in: [DiscrepancyStatus.OPEN, DiscrepancyStatus.REVIEWING] } }
    : {
        status: { in: [DiscrepancyStatus.OPEN, DiscrepancyStatus.REVIEWING] },
        dealerId: user.dealerId ?? "",
      };

  const [orders, builds, discrepancies, arrivals] = await Promise.all([
    db.factoryOrder.count({ where: orderWhere }),
    db.kayakBuild.count({ where: buildWhere }),
    isFactoryUser(user) ? Promise.resolve(0) : db.discrepancy.count({ where: discrepancyWhere }),
    db.factoryOrder.count({
      where: {
        ...orderWhere,
        status: {
          in: [FactoryOrderStatus.ARRIVED, FactoryOrderStatus.RECEIVING],
        },
      },
    }),
  ]);

  return { arrivals, builds, discrepancies, orders };
});

export async function listOrdersForUser(
  user: SessionUser,
  status?: FactoryOrderStatus | "ALL",
) {
  const where: Prisma.FactoryOrderWhereInput = {
    ...orderScopeForUser(user),
    ...(status && status !== "ALL" ? { status } : {}),
  };

  return db.factoryOrder.findMany({
    where,
    include: {
      _count: {
        select: {
          builds: true,
          items: true,
        },
      },
      dealer: true,
      supplier: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getOrderForUser(user: SessionUser, orderId: string) {
  return db.factoryOrder.findFirst({
    where: {
      id: orderId,
      ...orderScopeForUser(user),
    },
    include: {
      dealer: true,
      supplier: true,
      createdByUser: true,
      builds: {
        include: {
          comments: {
            include: {
              authorUser: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          customer: true,
          itemLines: true,
          portalToken: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      discrepancies: {
        where: {
          status: {
            in: [DiscrepancyStatus.OPEN, DiscrepancyStatus.REVIEWING],
          },
        },
        include: {
          createdByUser: true,
          kayakBuild: true,
          orderItem: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      items: {
        include: {
          linkedKayakBuild: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      receivingSessions: {
        orderBy: {
          startedAt: "desc",
        },
      },
    },
  });
}

export async function getBuildForForm(
  user: SessionUser,
  orderId: string,
  buildId: string,
) {
  if (!canManageDealerData(user)) {
    return null;
  }

  return db.kayakBuild.findFirst({
    where: {
      id: buildId,
      factoryOrderId: orderId,
      dealerId: isAdmin(user) ? undefined : user.dealerId ?? "",
    },
    include: {
      customer: true,
      factoryOrder: {
        include: {
          dealer: true,
          supplier: true,
        },
      },
    },
  });
}

export async function getReceivingSessionForUser(
  user: SessionUser,
  orderId: string,
  sessionId: string,
) {
  if (!canManageDealerData(user)) {
    return null;
  }

  return db.receivingSession.findFirst({
    where: {
      id: sessionId,
      factoryOrderId: orderId,
      dealerId: isAdmin(user) ? undefined : user.dealerId ?? "",
    },
    include: {
      buildChecks: true,
      factoryOrder: {
        include: {
          builds: {
            include: {
              customer: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          discrepancies: {
            where: {
              status: {
                in: [DiscrepancyStatus.OPEN, DiscrepancyStatus.REVIEWING],
              },
            },
            include: {
              kayakBuild: true,
              orderItem: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          items: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
      itemChecks: true,
      startedByUser: true,
    },
  });
}

export async function getPortalBuildByToken(token: string) {
  const portalToken = await db.customerPortalToken.findFirst({
    where: {
      token,
      isRevoked: false,
      OR: [
        { expiresAt: null },
        {
          expiresAt: {
            gt: new Date(),
          },
        },
      ],
    },
    include: {
      kayakBuild: {
        include: {
          comments: {
            where: {
              visibility: "CUSTOMER_VISIBLE",
            },
            include: {
              authorUser: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          customer: true,
          factoryOrder: {
            include: {
              dealer: true,
              supplier: true,
            },
          },
        },
      },
    },
  });

  if (!portalToken) {
    return null;
  }

  await db.customerPortalToken.update({
    where: { id: portalToken.id },
    data: { lastAccessedAt: new Date() },
  });

  return portalToken.kayakBuild;
}

export async function listNewOrderContext(user: SessionUser) {
  if (!canManageDealerData(user)) {
    return null;
  }

  const [dealers, suppliers] = await Promise.all([
    isAdmin(user)
      ? listDealers()
      : db.dealer.findMany({
          where: { id: user.dealerId ?? "" },
        }),
    listSuppliers(),
  ]);

  return { dealers, suppliers };
}

export function assertCanManageOrder(user: SessionUser, dealerId: string) {
  return canManageDealerData(user) && canAccessDealer(user, dealerId);
}
