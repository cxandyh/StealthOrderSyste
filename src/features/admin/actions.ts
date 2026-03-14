"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { UserRole } from "@/generated/prisma/client";
import { isAdmin } from "@/features/auth/permissions";
import { requireRole } from "@/features/auth/session";
import { dealerSchema, userSchema } from "@/features/admin/schemas";
import { canManageTargetUser } from "@/features/admin/data";
import { db } from "@/lib/db";
import { compactText } from "@/lib/format";

export async function saveDealerAction(formData: FormData) {
  await requireRole([UserRole.ADMIN]);

  const parsed = dealerSchema.parse({
    currency: compactText(formData.get("currency")),
    dealerId: compactText(formData.get("dealerId")),
    isActive: formData.get("isActive") === "on",
    name: compactText(formData.get("name")),
    region: compactText(formData.get("region")),
    slug: compactText(formData.get("slug")),
  });

  if (parsed.dealerId) {
    await db.dealer.update({
      where: { id: parsed.dealerId },
      data: {
        currency: parsed.currency,
        isActive: parsed.isActive,
        name: parsed.name,
        region: parsed.region,
        slug: parsed.slug,
      },
    });
  } else {
    await db.dealer.create({
      data: {
        currency: parsed.currency,
        isActive: parsed.isActive,
        name: parsed.name,
        region: parsed.region,
        slug: parsed.slug,
      },
    });
  }

  revalidatePath("/app/admin/dealers");
}

export async function saveUserAction(formData: FormData) {
  const actor = await requireRole([UserRole.ADMIN, UserRole.DEALER_ADMIN]);

  const parsed = userSchema.parse({
    dealerId: compactText(formData.get("dealerId")),
    email: compactText(formData.get("email")),
    isActive: formData.get("isActive") === "on",
    name: compactText(formData.get("name")),
    password: compactText(formData.get("password")),
    redirectTo: compactText(formData.get("redirectTo")),
    role: formData.get("role"),
    supplierId: compactText(formData.get("supplierId")),
    userId: compactText(formData.get("userId")),
  });

  const dealerId = isAdmin(actor) ? parsed.dealerId ?? null : actor.dealerId ?? null;
  const supplierId = isAdmin(actor) ? parsed.supplierId ?? null : null;
  const role = isAdmin(actor) ? parsed.role : UserRole.DEALER_ADMIN;

  if (!isAdmin(actor) && role !== UserRole.DEALER_ADMIN) {
    throw new Error("Forbidden");
  }

  if (role === UserRole.DEALER_ADMIN && !dealerId) {
    throw new Error("Dealer assignment is required.");
  }

  if (role === UserRole.FACTORY_USER && !supplierId) {
    throw new Error("Supplier assignment is required.");
  }

  if (parsed.userId) {
    const existingUser = await db.user.findUnique({
      where: { id: parsed.userId },
    });

    if (!existingUser || !canManageTargetUser(actor, existingUser)) {
      throw new Error("Forbidden");
    }

    await db.user.update({
      where: { id: parsed.userId },
      data: {
        dealerId,
        email: parsed.email.toLowerCase(),
        isActive: parsed.isActive,
        name: parsed.name,
        passwordHash: parsed.password
          ? await bcrypt.hash(parsed.password, 10)
          : undefined,
        role,
        supplierId,
      },
    });
  } else {
    if (!parsed.password) {
      throw new Error("Password is required for new users.");
    }

    await db.user.create({
      data: {
        dealerId,
        email: parsed.email.toLowerCase(),
        isActive: parsed.isActive,
        name: parsed.name,
        passwordHash: await bcrypt.hash(parsed.password, 10),
        role,
        supplierId,
      },
    });
  }

  revalidatePath(parsed.redirectTo ?? "/app/admin/users");
}
