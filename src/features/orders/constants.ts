import type { UserRole } from "@/generated/prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  DEALER_ADMIN: "Dealer Admin",
  FACTORY_USER: "Factory User",
};

export const USER_ROLE_OPTIONS = [
  "ADMIN",
  "DEALER_ADMIN",
  "FACTORY_USER",
] as const;

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
  "PLAIN",
  "FADED_TIPS",
  "PAINTED_TIPS",
  "BANDED",
  "SINGLE_RACING_STRIPE",
  "DOUBLE_RACING_STRIPE",
] as const;

export const MODEL_SUGGESTIONS = [
  "Pro Fisha 475",
  "Fusion 480",
  "Evolution 465",
  "SupaLite",
] as const;

export const STANDARD_COLOUR_OPTIONS = [
  { label: "White", value: "White", swatch: "#ffffff" },
  { label: "Post Office Red", value: "Post Office Red", swatch: "#df1900" },
  { label: "Bright Orange", value: "Bright Orange", swatch: "#fe3b01" },
  { label: "Canary Yellow", value: "Canary Yellow", swatch: "#fcde0a" },
  { label: "Lime Green", value: "Lime Green", swatch: "#84ad29" },
  { label: "Pool Blue", value: "Pool Blue", swatch: "#d6fefe" },
  { label: "Cornflower Blue", value: "Cornflower Blue", swatch: "#318bc7" },
  { label: "Strong Blue", value: "Strong Blue", swatch: "#091044" },
  { label: "Black", value: "Black", swatch: "#000000" },
  { label: "Mid Gray", value: "Mid Gray", swatch: "#838c91" },
  { label: "Mist Grey", value: "Mist Grey", swatch: "#838c91" },
  {
    label: "Quote for Custom Colour",
    value: "Quote for Custom Colour",
    swatch: "transparent",
  },
] as const;

export const HULL_OVERRIDE_OPTIONS = [
  { label: "No hull override", value: "No Hull Override", swatch: "transparent" },
  { label: "White hull", value: "White Hull", swatch: "#ffffff" },
  { label: "Clear hull", value: "Clear Hull", swatch: "#d8e2e8" },
] as const;
