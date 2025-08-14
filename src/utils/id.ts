import { randomBytes } from "crypto";

export function generateId(length: 16 | 12 = 16): string {
  // length in bytes; 16 -> 32 hex chars, 12 -> 24 hex chars
  return randomBytes(length).toString("hex");
}
