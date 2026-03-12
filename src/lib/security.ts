import { createHash, randomBytes } from "crypto";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePortalToken() {
  return randomBytes(24).toString("hex");
}
