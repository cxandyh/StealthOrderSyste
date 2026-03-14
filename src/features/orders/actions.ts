"use server";

import {
  CommentVisibility,
  DiscrepancyStatus,
  DiscrepancyType,
  FactoryOrderStatus,
  ReceivedBuildStatus,
} from "@/generated/prisma/client";
import { canManageDealerData, isAdmin, isFactoryUser } from "@/features/auth/permissions";
import { requireUser } from "@/features/auth/session";
import { notifyCustomerStatusChanged } from "@/features/notifications/service";
import {
  buildCheckSchema,
  buildCommentSchema,
  buildSchema,
  buildStatusSchema,
  completeReceivingSchema,
  factoryOrderSchema,
  itemCheckSchema,
  orderItemSchema,
  receivingStartSchema,
} from "@/features/orders/schemas";
import { db } from "@/lib/db";
import { compactText, splitName } from "@/lib/format";
import { generatePortalToken } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function accentFieldsForColourType(
  data: ReturnType<typeof buildSchema.parse>,
) {
  switch (data.colourType) {
    case "FADED_TIPS":
    case "PAINTED_TIPS":
      return {
        bandColour1: null,
        bandColour2: null,
        bandColour3: null,
        bandColour4: null,
        bandColour5: null,
        stripeColour1: null,
        stripeColour2: null,
        tipColour1: data.tipColour1 ?? null,
        tipColour2: data.tipColour2 ?? null,
      };
    case "BANDED":
      return {
        bandColour1: data.bandColour1 ?? null,
        bandColour2: data.bandColour2 ?? null,
        bandColour3: data.bandColour3 ?? null,
        bandColour4: null,
        bandColour5: null,
        stripeColour1: null,
        stripeColour2: null,
        tipColour1: data.tipColour1 ?? null,
        tipColour2: data.tipColour2 ?? null,
      };
    case "SINGLE_RACING_STRIPE":
    case "DOUBLE_RACING_STRIPE":
      return {
        bandColour1: null,
        bandColour2: null,
        bandColour3: null,
        bandColour4: null,
        bandColour5: null,
        stripeColour1: data.stripeColour1 ?? null,
        stripeColour2: null,
        tipColour1: null,
        tipColour2: null,
      };
    case "PLAIN":
    default:
      return {
        bandColour1: null,
        bandColour2: null,
        bandColour3: null,
        bandColour4: null,
        bandColour5: null,
        stripeColour1: null,
        stripeColour2: null,
        tipColour1: null,
        tipColour2: null,
      };
  }
}

function buildSummaryJson(data: ReturnType<typeof buildSchema.parse>) {
  const colours = [
    data.deckColour,
    data.hullColour,
    data.tapeColour,
    data.tipColour1,
    data.tipColour2,
    data.bandColour1,
    data.bandColour2,
    data.bandColour3,
    data.bandColour4,
    data.bandColour5,
    data.stripeColour1,
    data.stripeColour2,
  ].filter((value): value is string => Boolean(value));

  return {
    allocationLabel: data.intendedForStock ? data.allocationLabel : data.customerName,
    colours,
    model: data.model,
    stock: data.intendedForStock,
  };
}

async function getManagedOrder(orderId: string) {
  const user = await requireUser();

  if (!canManageDealerData(user)) {
    throw new Error("Forbidden");
  }

  const order = await db.factoryOrder.findFirst({
    where: {
      id: orderId,
      ...(isAdmin(user) ? {} : { dealerId: user.dealerId ?? "" }),
    },
    include: {
      dealer: true,
      supplier: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return { order, user };
}

async function upsertCustomerForBuild(params: {
  customerEmail?: string;
  customerId?: string | null;
  customerName?: string | null;
  dealerId: string;
  intendedForStock: boolean;
}) {
  if (params.intendedForStock) {
    return null;
  }

  if (!params.customerName) {
    return null;
  }

  const name = splitName(params.customerName);

  if (params.customerId) {
    return db.customer.update({
      where: { id: params.customerId },
      data: {
        email: params.customerEmail ?? null,
        firstName: name.firstName,
        lastName: name.lastName,
      },
    });
  }

  return db.customer.create({
    data: {
      dealerId: params.dealerId,
      email: params.customerEmail ?? null,
      firstName: name.firstName,
      lastName: name.lastName,
    },
  });
}

async function ensureBuildPortalToken(buildId: string) {
  const existingToken = await db.customerPortalToken.findUnique({
    where: { kayakBuildId: buildId },
  });

  if (existingToken) {
    return existingToken.token;
  }

  const token = generatePortalToken();
  await db.customerPortalToken.create({
    data: {
      kayakBuildId: buildId,
      token,
    },
  });

  return token;
}

async function syncDiscrepancy(params: {
  createdByUserId: string;
  dealerId: string;
  description: string;
  factoryOrderId: string;
  orderItemId?: string | null;
  shouldBeOpen: boolean;
  type: DiscrepancyType;
  kayakBuildId?: string | null;
}) {
  const existing = await db.discrepancy.findFirst({
    where: {
      discrepancyType: params.type,
      factoryOrderId: params.factoryOrderId,
      kayakBuildId: params.kayakBuildId ?? undefined,
      orderItemId: params.orderItemId ?? undefined,
      status: {
        in: [DiscrepancyStatus.OPEN, DiscrepancyStatus.REVIEWING],
      },
    },
  });

  if (params.shouldBeOpen) {
    if (existing) {
      await db.discrepancy.update({
        where: { id: existing.id },
        data: {
          description: params.description,
          resolutionNotes: null,
          resolvedAt: null,
          status: DiscrepancyStatus.OPEN,
        },
      });
      return;
    }

    await db.discrepancy.create({
      data: {
        createdByUserId: params.createdByUserId,
        dealerId: params.dealerId,
        description: params.description,
        discrepancyType: params.type,
        factoryOrderId: params.factoryOrderId,
        kayakBuildId: params.kayakBuildId ?? null,
        orderItemId: params.orderItemId ?? null,
      },
    });
    return;
  }

  if (existing) {
    await db.discrepancy.update({
      where: { id: existing.id },
      data: {
        resolvedAt: new Date(),
        resolutionNotes: "Resolved during receiving review.",
        status: DiscrepancyStatus.RESOLVED,
      },
    });
  }
}

export async function createFactoryOrderAction(formData: FormData) {
  const user = await requireUser();

  if (!canManageDealerData(user)) {
    throw new Error("Forbidden");
  }

  const parsed = factoryOrderSchema.parse({
    dealerId: compactText(formData.get("dealerId")),
    notes: compactText(formData.get("notes")),
    orderNumber: compactText(formData.get("orderNumber")),
    status: formData.get("status"),
    supplierId: compactText(formData.get("supplierId")),
    title: compactText(formData.get("title")),
  });

  const dealerId = isAdmin(user) ? parsed.dealerId : user.dealerId;

  if (!dealerId) {
    throw new Error("Dealer is required");
  }

  const order = await db.factoryOrder.create({
    data: {
      createdByUserId: user.id,
      dealerId,
      notes: parsed.notes ?? null,
      orderNumber: parsed.orderNumber,
      status: parsed.status,
      submittedAt: parsed.status === FactoryOrderStatus.DRAFT ? null : new Date(),
      supplierId: parsed.supplierId,
      title: parsed.title ?? null,
    },
  });

  redirect(`/app/orders/${order.id}`);
}

export async function updateFactoryOrderAction(formData: FormData) {
  const parsed = factoryOrderSchema.parse({
    notes: compactText(formData.get("notes")),
    orderId: compactText(formData.get("orderId")),
    orderNumber: compactText(formData.get("orderNumber")),
    redirectTo: compactText(formData.get("redirectTo")),
    status: formData.get("status"),
    supplierId: compactText(formData.get("supplierId")),
    title: compactText(formData.get("title")),
  });

  const { order } = await getManagedOrder(parsed.orderId!);

  await db.factoryOrder.update({
    where: { id: order.id },
    data: {
      notes: parsed.notes ?? null,
      orderNumber: parsed.orderNumber,
      status: parsed.status,
      submittedAt:
        parsed.status === FactoryOrderStatus.DRAFT
          ? null
          : order.submittedAt ?? new Date(),
      supplierId: parsed.supplierId,
      title: parsed.title ?? null,
    },
  });

  revalidatePath(parsed.redirectTo ?? `/app/orders/${order.id}`);
}

export async function saveBuildAction(formData: FormData) {
  const parsed = buildSchema.parse({
    additionalNotes: compactText(formData.get("additionalNotes")),
    allocationLabel: compactText(formData.get("allocationLabel")),
    bandColour1: compactText(formData.get("bandColour1")),
    bandColour2: compactText(formData.get("bandColour2")),
    bandColour3: compactText(formData.get("bandColour3")),
    bandColour4: compactText(formData.get("bandColour4")),
    bandColour5: compactText(formData.get("bandColour5")),
    buildId: compactText(formData.get("buildId")),
    colourType: compactText(formData.get("colourType")),
    customerEmail: compactText(formData.get("customerEmail")) ?? undefined,
    customerName: compactText(formData.get("customerName")),
    customerVisibleStatus: formData.get("customerVisibleStatus"),
    decals: compactText(formData.get("decals")),
    deckColour: compactText(formData.get("deckColour")),
    hullColour: compactText(formData.get("hullColour")),
    intendedForStock: formData.get("intendedForStock") === "on",
    internalStatus: formData.get("internalStatus"),
    materialType: compactText(formData.get("materialType")),
    model: compactText(formData.get("model")),
    orderId: compactText(formData.get("orderId")),
    redirectTo: compactText(formData.get("redirectTo")),
    rodHolderDetails: compactText(formData.get("rodHolderDetails")),
    serialNumber: compactText(formData.get("serialNumber")),
    specialRequests: compactText(formData.get("specialRequests")),
    stripeColour1: compactText(formData.get("stripeColour1")),
    stripeColour2: compactText(formData.get("stripeColour2")),
    tapeColour: compactText(formData.get("tapeColour")),
    tipColour1: compactText(formData.get("tipColour1")),
    tipColour2: compactText(formData.get("tipColour2")),
  });

  const { order } = await getManagedOrder(parsed.orderId);
  const existingBuild = parsed.buildId
    ? await db.kayakBuild.findFirst({
        where: {
          id: parsed.buildId,
          factoryOrderId: order.id,
        },
        include: {
          customer: true,
          portalToken: true,
        },
      })
    : null;

  const customer = await upsertCustomerForBuild({
    customerEmail: parsed.customerEmail,
    customerId: existingBuild?.customerId ?? null,
    customerName: parsed.customerName,
    dealerId: order.dealerId,
    intendedForStock: parsed.intendedForStock,
  });

  const baseData = {
    additionalNotes: parsed.additionalNotes ?? null,
    allocationLabel: parsed.intendedForStock
      ? parsed.allocationLabel ?? "Stock build"
      : parsed.customerName ?? null,
    buildSummaryJson: buildSummaryJson(parsed),
    colourType: parsed.colourType,
    customerId: customer?.id ?? null,
    customerVisibleStatus: parsed.customerVisibleStatus,
    dealerId: order.dealerId,
    decals: parsed.decals ?? null,
    deckColour: parsed.deckColour,
    hullColour: parsed.hullColour,
    intendedForStock: parsed.intendedForStock,
    internalStatus: parsed.internalStatus,
    materialType: parsed.materialType,
    model: parsed.model,
    rodHolderDetails: parsed.rodHolderDetails ?? null,
    serialNumber: parsed.serialNumber ?? null,
    specialRequests: parsed.specialRequests ?? null,
    tapeColour: parsed.tapeColour ?? null,
    ...accentFieldsForColourType(parsed),
  };

  const build = existingBuild
    ? await db.kayakBuild.update({
        where: { id: existingBuild.id },
        data: baseData,
      })
    : await db.kayakBuild.create({
        data: {
          ...baseData,
          factoryOrderId: order.id,
        },
      });

  let plainPortalToken: string | null = null;
  if (!parsed.intendedForStock) {
    plainPortalToken = await ensureBuildPortalToken(build.id);
  }

  if (
    existingBuild &&
    existingBuild.customerVisibleStatus !== parsed.customerVisibleStatus
  ) {
    await notifyCustomerStatusChanged({
      buildId: build.id,
      customerEmail: customer?.email ?? existingBuild.customer?.email ?? null,
      customerName:
        parsed.customerName ??
        [existingBuild.customer?.firstName, existingBuild.customer?.lastName]
          .filter(Boolean)
          .join(" "),
      dealerId: order.dealerId,
      model: parsed.model,
      orderNumber: order.orderNumber,
      portalToken: plainPortalToken,
      previousStatus: existingBuild.customerVisibleStatus,
      status: parsed.customerVisibleStatus,
    });
  }

  redirect(parsed.redirectTo ?? `/app/orders/${order.id}`);
}

export async function addOrderItemAction(formData: FormData) {
  const parsed = orderItemSchema.parse({
    category: formData.get("category"),
    linkedKayakBuildId: compactText(formData.get("linkedKayakBuildId")),
    name: compactText(formData.get("name")),
    notes: compactText(formData.get("notes")),
    orderId: compactText(formData.get("orderId")),
    quantity: formData.get("quantity"),
    sku: compactText(formData.get("sku")),
  });

  const { order } = await getManagedOrder(parsed.orderId);

  await db.orderItem.create({
    data: {
      category: parsed.category,
      dealerId: order.dealerId,
      factoryOrderId: order.id,
      linkedKayakBuildId: parsed.linkedKayakBuildId ?? null,
      name: parsed.name,
      notes: parsed.notes ?? null,
      quantity: parsed.quantity,
      sku: parsed.sku,
    },
  });

  revalidatePath(`/app/orders/${order.id}`);
}

export async function duplicateBuildAction(formData: FormData) {
  const parsedBuildId = compactText(formData.get("buildId"));
  const parsedOrderId = compactText(formData.get("orderId"));

  if (!parsedBuildId || !parsedOrderId) {
    throw new Error("Build and order are required");
  }

  const { order } = await getManagedOrder(parsedOrderId);
  const sourceBuild = await db.kayakBuild.findFirst({
    where: {
      id: parsedBuildId,
      factoryOrderId: order.id,
    },
    include: {
      itemLines: true,
    },
  });

  if (!sourceBuild) {
    throw new Error("Build not found");
  }

  const duplicatedBuild = await db.kayakBuild.create({
    data: {
      additionalNotes: sourceBuild.additionalNotes,
      allocationLabel: sourceBuild.intendedForStock
        ? `${sourceBuild.allocationLabel ?? "Stock build"} copy`
        : sourceBuild.allocationLabel,
      bandColour1: sourceBuild.bandColour1,
      bandColour2: sourceBuild.bandColour2,
      bandColour3: sourceBuild.bandColour3,
      bandColour4: sourceBuild.bandColour4,
      bandColour5: sourceBuild.bandColour5,
      buildSummaryJson: sourceBuild.buildSummaryJson ?? undefined,
      colourType: sourceBuild.colourType,
      customerVisibleStatus: sourceBuild.customerVisibleStatus,
      decals: sourceBuild.decals,
      dealerId: sourceBuild.dealerId,
      deckColour: sourceBuild.deckColour,
      factoryOrderId: sourceBuild.factoryOrderId,
      hullColour: sourceBuild.hullColour,
      intendedForStock: sourceBuild.intendedForStock,
      internalStatus: sourceBuild.internalStatus,
      materialType: sourceBuild.materialType,
      model: sourceBuild.model,
      rodHolderDetails: sourceBuild.rodHolderDetails,
      serialNumber: null,
      specialRequests: sourceBuild.specialRequests,
      stripeColour1: sourceBuild.stripeColour1,
      stripeColour2: sourceBuild.stripeColour2,
      tapeColour: sourceBuild.tapeColour,
      tipColour1: sourceBuild.tipColour1,
      tipColour2: sourceBuild.tipColour2,
    },
  });

  if (sourceBuild.itemLines.length > 0) {
    await db.orderItem.createMany({
      data: sourceBuild.itemLines.map((item) => ({
        category: item.category,
        dealerId: item.dealerId,
        factoryOrderId: item.factoryOrderId,
        linkedKayakBuildId: duplicatedBuild.id,
        name: item.name,
        notes: item.notes,
        quantity: item.quantity,
        sku: item.sku,
        catalogueItemId: item.catalogueItemId,
      })),
    });
  }

  redirect(`/app/orders/${order.id}/builds/${duplicatedBuild.id}/edit`);
}

export async function addBuildCommentAction(formData: FormData) {
  const user = await requireUser();
  const parsed = buildCommentSchema.parse({
    buildId: compactText(formData.get("buildId")),
    message: compactText(formData.get("message")),
    redirectTo: compactText(formData.get("redirectTo")),
    visibility:
      isFactoryUser(user)
        ? CommentVisibility.DEALER_FACTORY
        : formData.get("visibility"),
  });

  const build = await db.kayakBuild.findFirst({
    where: {
      id: parsed.buildId,
      ...(isAdmin(user)
        ? {}
        : isFactoryUser(user)
          ? {
              factoryOrder: {
                supplierId: user.supplierId ?? "",
                status: {
                  not: FactoryOrderStatus.DRAFT,
                },
              },
            }
          : { dealerId: user.dealerId ?? "" }),
    },
    include: {
      factoryOrder: true,
    },
  });

  if (!build) {
    throw new Error("Build not found");
  }

  await db.buildComment.create({
    data: {
      authorRole: user.role,
      authorUserId: user.id,
      kayakBuildId: build.id,
      message: parsed.message,
      visibility: parsed.visibility,
    },
  });

  revalidatePath(parsed.redirectTo ?? `/app/orders/${build.factoryOrderId}`);
}

export async function updateBuildInternalStatusAction(formData: FormData) {
  const user = await requireUser();
  const parsed = buildStatusSchema.parse({
    buildId: compactText(formData.get("buildId")),
    internalStatus: formData.get("internalStatus"),
    redirectTo: compactText(formData.get("redirectTo")),
  });

  const build = await db.kayakBuild.findFirst({
    where: {
      id: parsed.buildId,
      ...(isAdmin(user)
        ? {}
        : isFactoryUser(user)
          ? {
              factoryOrder: {
                supplierId: user.supplierId ?? "",
                status: {
                  not: FactoryOrderStatus.DRAFT,
                },
              },
            }
          : {
              dealerId: user.dealerId ?? "",
            }),
    },
  });

  if (!build) {
    throw new Error("Build not found");
  }

  await db.kayakBuild.update({
    where: { id: build.id },
    data: {
      internalStatus: parsed.internalStatus,
    },
  });

  revalidatePath(parsed.redirectTo ?? `/app/orders/${build.factoryOrderId}`);
}

export async function startReceivingSessionAction(formData: FormData) {
  const parsed = receivingStartSchema.parse({
    orderId: compactText(formData.get("orderId")),
  });

  const { order, user } = await getManagedOrder(parsed.orderId);
  if (
    order.status !== FactoryOrderStatus.CONFIRMED &&
    order.status !== FactoryOrderStatus.ARRIVED
  ) {
    throw new Error("Receiving can only start once the order is confirmed or marked arrived.");
  }

  const existingSession = await db.receivingSession.findFirst({
    where: {
      factoryOrderId: order.id,
      status: "IN_PROGRESS",
    },
    orderBy: {
      startedAt: "desc",
    },
  });

  const session =
    existingSession ??
    (await db.receivingSession.create({
      data: {
        dealerId: order.dealerId,
        factoryOrderId: order.id,
        startedByUserId: user.id,
      },
    }));

  await db.factoryOrder.update({
    where: { id: order.id },
    data: {
      status: FactoryOrderStatus.RECEIVING,
    },
  });

  redirect(`/app/orders/${order.id}/receiving/${session.id}`);
}

export async function saveBuildCheckAction(formData: FormData) {
  const parsed = buildCheckSchema.parse({
    buildId: compactText(formData.get("buildId")),
    notes: compactText(formData.get("notes")),
    orderId: compactText(formData.get("orderId")),
    receivedSerialNumber: compactText(formData.get("receivedSerialNumber")),
    receivedStatus: formData.get("receivedStatus"),
    redirectTo: compactText(formData.get("redirectTo")),
    sessionId: compactText(formData.get("sessionId")),
  });

  const { order, user } = await getManagedOrder(parsed.orderId);
  const build = await db.kayakBuild.findFirst({
    where: {
      id: parsed.buildId,
      factoryOrderId: order.id,
    },
  });

  if (!build) {
    throw new Error("Build not found");
  }

  const serialMatch = build.serialNumber
    ? build.serialNumber === parsed.receivedSerialNumber
    : null;

  await db.receivedBuildCheck.upsert({
    where: {
      receivingSessionId_kayakBuildId: {
        kayakBuildId: build.id,
        receivingSessionId: parsed.sessionId,
      },
    },
    create: {
      kayakBuildId: build.id,
      notes: parsed.notes ?? null,
      receivedSerialNumber: parsed.receivedSerialNumber ?? null,
      receivedStatus: parsed.receivedStatus,
      receivingSessionId: parsed.sessionId,
      serialMatch,
    },
    update: {
      notes: parsed.notes ?? null,
      receivedSerialNumber: parsed.receivedSerialNumber ?? null,
      receivedStatus: parsed.receivedStatus,
      serialMatch,
    },
  });

  await syncDiscrepancy({
    createdByUserId: user.id,
    dealerId: order.dealerId,
    description: `${build.model} was not received during intake.`,
    factoryOrderId: order.id,
    kayakBuildId: build.id,
    shouldBeOpen: parsed.receivedStatus === ReceivedBuildStatus.NOT_RECEIVED,
    type: DiscrepancyType.MISSING_ITEM,
  });

  await syncDiscrepancy({
    createdByUserId: user.id,
    dealerId: order.dealerId,
    description: `Serial mismatch for ${build.model}. Expected ${build.serialNumber ?? "n/a"}, received ${parsed.receivedSerialNumber ?? "n/a"}.`,
    factoryOrderId: order.id,
    kayakBuildId: build.id,
    shouldBeOpen:
      Boolean(build.serialNumber) &&
      Boolean(parsed.receivedSerialNumber) &&
      serialMatch === false,
    type: DiscrepancyType.SERIAL_MISMATCH,
  });

  await syncDiscrepancy({
    createdByUserId: user.id,
    dealerId: order.dealerId,
    description: `${build.model} arrived with an unspecified issue.`,
    factoryOrderId: order.id,
    kayakBuildId: build.id,
    shouldBeOpen:
      parsed.receivedStatus === ReceivedBuildStatus.RECEIVED_WITH_ISSUE,
    type: DiscrepancyType.OTHER,
  });

  revalidatePath(parsed.redirectTo ?? `/app/orders/${order.id}/receiving/${parsed.sessionId}`);
}

export async function saveItemCheckAction(formData: FormData) {
  const parsed = itemCheckSchema.parse({
    itemId: compactText(formData.get("itemId")),
    notes: compactText(formData.get("notes")),
    orderId: compactText(formData.get("orderId")),
    receivedQty: formData.get("receivedQty"),
    redirectTo: compactText(formData.get("redirectTo")),
    sessionId: compactText(formData.get("sessionId")),
  });

  const { order, user } = await getManagedOrder(parsed.orderId);
  const item = await db.orderItem.findFirst({
    where: {
      id: parsed.itemId,
      factoryOrderId: order.id,
    },
  });

  if (!item) {
    throw new Error("Order item not found");
  }

  await db.receivedItemCheck.upsert({
    where: {
      receivingSessionId_orderItemId: {
        orderItemId: item.id,
        receivingSessionId: parsed.sessionId,
      },
    },
    create: {
      expectedQty: item.quantity,
      notes: parsed.notes ?? null,
      orderItemId: item.id,
      receivedQty: parsed.receivedQty,
      receivingSessionId: parsed.sessionId,
    },
    update: {
      expectedQty: item.quantity,
      notes: parsed.notes ?? null,
      receivedQty: parsed.receivedQty,
    },
  });

  await syncDiscrepancy({
    createdByUserId: user.id,
    dealerId: order.dealerId,
    description: `${item.name} was not received.`,
    factoryOrderId: order.id,
    orderItemId: item.id,
    shouldBeOpen: parsed.receivedQty === 0,
    type: DiscrepancyType.MISSING_ITEM,
  });

  await syncDiscrepancy({
    createdByUserId: user.id,
    dealerId: order.dealerId,
    description: `${item.name} received ${parsed.receivedQty} of ${item.quantity}.`,
    factoryOrderId: order.id,
    orderItemId: item.id,
    shouldBeOpen: parsed.receivedQty > 0 && parsed.receivedQty < item.quantity,
    type: DiscrepancyType.QUANTITY_SHORT,
  });

  revalidatePath(parsed.redirectTo ?? `/app/orders/${order.id}/receiving/${parsed.sessionId}`);
}

export async function completeReceivingSessionAction(formData: FormData) {
  const parsed = completeReceivingSchema.parse({
    orderId: compactText(formData.get("orderId")),
    redirectTo: compactText(formData.get("redirectTo")),
    sessionId: compactText(formData.get("sessionId")),
  });

  const { order, user } = await getManagedOrder(parsed.orderId);

  await db.receivingSession.update({
    where: { id: parsed.sessionId },
    data: {
      completedAt: new Date(),
      completedByUserId: user.id,
      status: "COMPLETED",
    },
  });

  await db.factoryOrder.update({
    where: { id: order.id },
    data: {
      status: FactoryOrderStatus.COMPLETED,
    },
  });

  redirect(parsed.redirectTo ?? `/app/orders/${order.id}`);
}
