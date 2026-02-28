import type { User } from "@/services/auth/types";

export function buildFullName(payload?: User | null): string {
  if (!payload) {
    return "";
  }

  const directName =
    payload.fullName?.trim() || payload.fio?.trim() || payload.name?.trim();
  if (directName) {
    return directName;
  }

  const parts = [
    payload.lastName?.trim(),
    payload.firstName?.trim(),
    payload.middleName?.trim(),
  ].filter(Boolean);

  return parts.join(" ").trim();
}
