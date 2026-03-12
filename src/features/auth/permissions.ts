import { UserRole } from "@/generated/prisma/client";

export type SessionUser = {
  dealerId?: string | null;
  email?: string | null;
  id: string;
  name?: string | null;
  role: UserRole;
  supplierId?: string | null;
};

export function isAdmin(user: SessionUser) {
  return user.role === UserRole.ADMIN;
}

export function isDealerAdmin(user: SessionUser) {
  return user.role === UserRole.DEALER_ADMIN;
}

export function isFactoryUser(user: SessionUser) {
  return user.role === UserRole.FACTORY_USER;
}

export function canManageDealerData(user: SessionUser) {
  return isAdmin(user) || isDealerAdmin(user);
}

export function canAccessDealer(user: SessionUser, dealerId: string) {
  if (isAdmin(user)) {
    return true;
  }

  return user.dealerId === dealerId;
}
