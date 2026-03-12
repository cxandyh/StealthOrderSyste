import type { UserRole } from "@/generated/prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  DEALER_ADMIN: "Dealer Admin",
  FACTORY_USER: "Factory User",
};

export const FACTORY_ORDER_STATUS_OPTIONS = [
  "DRAFT",
  "IN_REVIEW",
  "CONFIRMED",
  "ARRIVED",
  "RECEIVING",
  "COMPLETED",
] as const;

export const INTERNAL_STATUS_OPTIONS = [
  "DRAFT",
  "CONFIRMING_CUSTOMISATION",
  "QUOTED",
  "ACCEPTED",
  "DEPOSIT_PAID",
  "SUBMITTED_TO_FACTORY",
  "IN_BUILD",
  "WAITING_ON_PARTS",
  "COMPLETED",
  "ARRIVED",
  "UNPACKED_CHECKED",
  "POST_INSTALLS",
  "READY_FOR_PICKUP",
  "DELIVERED",
] as const;

export const CUSTOMER_STATUS_OPTIONS = [
  "ORDER_CONFIRMED",
  "IN_PRODUCTION",
  "PREPARING_FOR_DELIVERY",
  "ARRIVED_IN_COUNTRY",
  "FINAL_PREP",
  "READY",
] as const;

export const ORDER_ITEM_CATEGORY_OPTIONS = ["ACCESSORY", "PART"] as const;
export const RECEIVED_BUILD_STATUS_OPTIONS = [
  "PENDING",
  "RECEIVED_OK",
  "RECEIVED_WITH_ISSUE",
  "NOT_RECEIVED",
] as const;

export const MATERIAL_TYPES = [
  "Carbon Hybrid",
  "Fiberglass",
  "Vacuum Glass",
  "Carbon",
] as const;

export const COLOUR_TYPES = [
  "SOLID",
  "TWO_TONE",
  "MULTI_BAND",
  "CUSTOM",
] as const;

export const MODEL_SUGGESTIONS = [
  "Pro Fisha 475",
  "Fusion 480",
  "Evolution 465",
  "SupaLite",
] as const;
