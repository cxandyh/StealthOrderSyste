import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { titleize } from "@/lib/format";

const classMap: Record<string, string> = {
  ARRIVED: "bg-sky-100 text-sky-900",
  ARRIVED_IN_COUNTRY: "bg-sky-100 text-sky-900",
  COMPLETED: "bg-emerald-100 text-emerald-900",
  CONFIRMED: "bg-teal-100 text-teal-900",
  CUSTOMER_VISIBLE: "bg-indigo-100 text-indigo-900",
  DEALER_FACTORY: "bg-slate-100 text-slate-800",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  DRAFT: "bg-amber-100 text-amber-900",
  FINAL_PREP: "bg-orange-100 text-orange-900",
  IN_BUILD: "bg-cyan-100 text-cyan-900",
  IN_PRODUCTION: "bg-cyan-100 text-cyan-900",
  IN_REVIEW: "bg-violet-100 text-violet-900",
  NOT_RECEIVED: "bg-red-100 text-red-900",
  OPEN: "bg-red-100 text-red-900",
  ORDER_CONFIRMED: "bg-teal-100 text-teal-900",
  PREPARING_FOR_DELIVERY: "bg-orange-100 text-orange-900",
  QUANTITY_SHORT: "bg-red-100 text-red-900",
  READY: "bg-emerald-100 text-emerald-900",
  READY_FOR_PICKUP: "bg-emerald-100 text-emerald-900",
  RECEIVED_OK: "bg-emerald-100 text-emerald-900",
  RECEIVED_WITH_ISSUE: "bg-amber-100 text-amber-900",
  RECEIVING: "bg-orange-100 text-orange-900",
  RESOLVED: "bg-emerald-100 text-emerald-900",
  REVIEWING: "bg-amber-100 text-amber-900",
  SERIAL_MISMATCH: "bg-red-100 text-red-900",
  SUBMITTED_TO_FACTORY: "bg-violet-100 text-violet-900",
};

export function StatusBadge({ className, value }: { className?: string; value: string }) {
  return (
    <Badge className={cn("rounded-full border-0 px-3 py-1 text-[11px] tracking-wide", classMap[value] ?? "bg-slate-100 text-slate-900", className)}>
      {titleize(value)}
    </Badge>
  );
}
