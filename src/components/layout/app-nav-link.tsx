"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AppNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/app" && pathname.startsWith(href));

  return (
    <Link
      className={cn(
        "block rounded-2xl px-4 py-3 text-sm font-medium transition",
        isActive
          ? "bg-teal-500 text-white shadow-lg shadow-teal-900/20"
          : "text-slate-300 hover:bg-white/8 hover:text-white",
      )}
      href={href}
    >
      {label}
    </Link>
  );
}
