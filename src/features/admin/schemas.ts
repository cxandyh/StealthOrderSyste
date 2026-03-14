import { UserRole } from "@/generated/prisma/client";
import { z } from "zod";

const optionalString = z.string().trim().optional().nullable();

export const dealerSchema = z.object({
  currency: z.string().trim().min(1, "Currency is required."),
  dealerId: optionalString,
  isActive: z.boolean(),
  name: z.string().trim().min(1, "Dealer name is required."),
  region: z.string().trim().min(1, "Region is required."),
  slug: z.string().trim().min(1, "Slug is required."),
});

export const userSchema = z.object({
  dealerId: optionalString,
  email: z.string().trim().email("A valid email is required."),
  isActive: z.boolean(),
  name: z.string().trim().min(1, "Name is required."),
  password: optionalString,
  redirectTo: optionalString,
  role: z.nativeEnum(UserRole),
  supplierId: optionalString,
  userId: optionalString,
});
