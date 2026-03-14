import {
  CommentVisibility,
  CustomerVisibleStatus,
  FactoryOrderStatus,
  KayakBuildInternalStatus,
  OrderItemCategory,
  ReceivedBuildStatus,
} from "@/generated/prisma/client";
import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();
const optionalString = z.string().trim().optional().nullable();

export const factoryOrderSchema = z.object({
  dealerId: optionalString,
  notes: optionalText,
  orderId: optionalString,
  orderNumber: z.string().trim().min(1, "Order number is required."),
  redirectTo: optionalString,
  status: z.nativeEnum(FactoryOrderStatus),
  supplierId: z.string().trim().min(1, "Supplier is required."),
  title: optionalText,
});

export const buildSchema = z.object({
  additionalNotes: optionalText,
  allocationLabel: optionalText,
  bandColour1: optionalText,
  bandColour2: optionalText,
  bandColour3: optionalText,
  bandColour4: optionalText,
  bandColour5: optionalText,
  buildId: optionalString,
  colourType: z.string().trim().min(1),
  customerEmail: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().email().optional()),
  customerName: optionalText,
  customerVisibleStatus: z.nativeEnum(CustomerVisibleStatus),
  decals: optionalText,
  deckColour: z.string().trim().min(1),
  hullColour: z.string().trim().min(1),
  intendedForStock: z.boolean(),
  internalStatus: z.nativeEnum(KayakBuildInternalStatus),
  materialType: z.string().trim().min(1),
  model: z.string().trim().min(1),
  orderId: z.string().trim().min(1),
  redirectTo: optionalString,
  rodHolderDetails: optionalText,
  serialNumber: optionalText,
  specialRequests: optionalText,
  stripeColour1: optionalText,
  stripeColour2: optionalText,
  tapeColour: optionalText,
  tipColour1: optionalText,
  tipColour2: optionalText,
}).superRefine((data, ctx) => {
  if (data.intendedForStock && !data.allocationLabel) {
    ctx.addIssue({
      code: "custom",
      message: "Stock designation is required for stock builds.",
      path: ["allocationLabel"],
    });
  }

  if (!data.tapeColour) {
    ctx.addIssue({
      code: "custom",
      message: "Pinline colour is required.",
      path: ["tapeColour"],
    });
  }

  if (
    (data.colourType === "FADED_TIPS" || data.colourType === "PAINTED_TIPS") &&
    (!data.tipColour1 || !data.tipColour2)
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Front and back tip colours are required for tip designs.",
      path: ["tipColour1"],
    });
  }

  if (data.colourType === "BANDED") {
    const hasAllBandedColours = [
      data.tipColour1,
      data.bandColour1,
      data.bandColour2,
      data.bandColour3,
      data.tipColour2,
    ].every(Boolean);

    if (!hasAllBandedColours) {
      ctx.addIssue({
        code: "custom",
        message:
          "Banded builds need front tip, front band, middle band, back band, and back tip colours.",
        path: ["bandColour1"],
      });
    }
  }

  if (
    (data.colourType === "SINGLE_RACING_STRIPE" ||
      data.colourType === "DOUBLE_RACING_STRIPE") &&
    !data.stripeColour1
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Stripe colour is required for racing stripe designs.",
      path: ["stripeColour1"],
    });
  }
});

export const orderItemSchema = z.object({
  category: z.nativeEnum(OrderItemCategory),
  linkedKayakBuildId: optionalText,
  name: z.string().trim().min(1),
  notes: optionalText,
  orderId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  sku: z.string().trim().min(1),
});

export const buildCommentSchema = z.object({
  buildId: z.string().trim().min(1),
  message: z.string().trim().min(1),
  redirectTo: optionalString,
  visibility: z.nativeEnum(CommentVisibility),
});

export const buildStatusSchema = z.object({
  buildId: z.string().trim().min(1),
  internalStatus: z.nativeEnum(KayakBuildInternalStatus),
  redirectTo: optionalString,
});

export const receivingStartSchema = z.object({
  orderId: z.string().trim().min(1),
});

export const buildCheckSchema = z.object({
  buildId: z.string().trim().min(1),
  notes: optionalText,
  orderId: z.string().trim().min(1),
  receivedSerialNumber: optionalText,
  receivedStatus: z.nativeEnum(ReceivedBuildStatus),
  redirectTo: optionalString,
  sessionId: z.string().trim().min(1),
});

export const itemCheckSchema = z.object({
  itemId: z.string().trim().min(1),
  notes: optionalText,
  orderId: z.string().trim().min(1),
  receivedQty: z.coerce.number().int().min(0),
  redirectTo: optionalString,
  sessionId: z.string().trim().min(1),
});

export const completeReceivingSchema = z.object({
  orderId: z.string().trim().min(1),
  redirectTo: optionalString,
  sessionId: z.string().trim().min(1),
});
