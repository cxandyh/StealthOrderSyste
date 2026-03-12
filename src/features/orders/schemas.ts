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

export const factoryOrderSchema = z.object({
  dealerId: z.string().trim().optional(),
  notes: optionalText,
  orderId: z.string().trim().optional(),
  orderNumber: z.string().trim().min(1, "Order number is required."),
  redirectTo: z.string().trim().optional(),
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
  buildId: z.string().trim().optional(),
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
  redirectTo: z.string().trim().optional(),
  rodHolderDetails: optionalText,
  serialNumber: optionalText,
  specialRequests: optionalText,
  stripeColour1: optionalText,
  stripeColour2: optionalText,
  tapeColour: optionalText,
  tipColour1: optionalText,
  tipColour2: optionalText,
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
  redirectTo: z.string().trim().optional(),
  visibility: z.nativeEnum(CommentVisibility),
});

export const buildStatusSchema = z.object({
  buildId: z.string().trim().min(1),
  internalStatus: z.nativeEnum(KayakBuildInternalStatus),
  redirectTo: z.string().trim().optional(),
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
  redirectTo: z.string().trim().optional(),
  sessionId: z.string().trim().min(1),
});

export const itemCheckSchema = z.object({
  itemId: z.string().trim().min(1),
  notes: optionalText,
  orderId: z.string().trim().min(1),
  receivedQty: z.coerce.number().int().min(0),
  redirectTo: z.string().trim().optional(),
  sessionId: z.string().trim().min(1),
});

export const completeReceivingSchema = z.object({
  orderId: z.string().trim().min(1),
  redirectTo: z.string().trim().optional(),
  sessionId: z.string().trim().min(1),
});
