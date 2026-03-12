import { format } from "date-fns";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return "Not set";
  }

  return format(new Date(date), "d MMM yyyy");
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) {
    return "Not set";
  }

  return format(new Date(date), "d MMM yyyy, h:mm a");
}

export function titleize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function fullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ");
}

export function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Customer", lastName: "Unknown" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Customer" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function compactText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
