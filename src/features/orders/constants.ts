import {
  CustomerVisibleStatus,
  FactoryOrderStatus,
  KayakBuildInternalStatus,
  OrderItemCategory,
  ReceivedBuildStatus,
  UserRole,
} from "@/generated/prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  DEALER_ADMIN: "Dealer Admin",
  FACTORY_USER: "Factory User",
};

export const FACTORY_ORDER_STATUS_OPTIONS = Object.values(FactoryOrderStatus);
export const INTERNAL_STATUS_OPTIONS = Object.values(KayakBuildInternalStatus);
export const CUSTOMER_STATUS_OPTIONS = Object.values(CustomerVisibleStatus);
export const ORDER_ITEM_CATEGORY_OPTIONS = Object.values(OrderItemCategory);
export const RECEIVED_BUILD_STATUS_OPTIONS = Object.values(ReceivedBuildStatus);

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
