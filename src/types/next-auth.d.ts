import { DefaultSession } from "next-auth";
import { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      dealerId?: string | null;
      id: string;
      role: UserRole;
      supplierId?: string | null;
    };
  }

  interface User {
    dealerId?: string | null;
    id: string;
    role: UserRole;
    supplierId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dealerId?: string | null;
    role: UserRole;
    supplierId?: string | null;
  }
}
