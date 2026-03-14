import Link from "next/link";

import { Prisma } from "@/generated/prisma/client";
import { duplicateBuildAction, updateBuildInternalStatusAction } from "@/features/orders/actions";
import { SessionUser, canManageDealerData } from "@/features/auth/permissions";
import { INTERNAL_STATUS_OPTIONS } from "@/features/orders/constants";
import { fullName } from "@/lib/format";
import { CommentThread } from "@/components/orders/comment-thread";
import { KayakPreview } from "@/components/orders/kayak-preview";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";

type BuildCardBuild = Prisma.KayakBuildGetPayload<{
  include: {
    comments: {
      include: {
        authorUser: true;
      };
    };
    customer: true;
    itemLines: true;
    portalToken: true;
  };
}>;

export function BuildSummaryCard({
  build,
  defaultOpen = false,
  orderId,
  user,
}: {
  build: BuildCardBuild;
  defaultOpen?: boolean;
  orderId: string;
  user: SessionUser;
}) {
  const hullLabel = build.hullColour === "No Hull Override" ? "No override" : build.hullColour;
  const accentColours = [
    build.tipColour1,
    build.tipColour2,
    build.bandColour1,
    build.bandColour2,
    build.bandColour3,
    build.bandColour4,
    build.bandColour5,
    build.stripeColour1,
    build.stripeColour2,
  ].filter(Boolean);
  const displayName = build.customer
    ? fullName(build.customer.firstName, build.customer.lastName)
    : build.allocationLabel ?? "Stock build";

  return (
    <details
      className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-none"
      open={defaultOpen ? true : undefined}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-4 px-5 py-5 marker:hidden lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-950">{build.model}</h3>
            <StatusBadge value={build.internalStatus} />
            <StatusBadge value={build.customerVisibleStatus} />
          </div>
          <p className="mt-2 text-sm text-slate-600">{displayName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {build.deckColour} / {hullLabel}
            {build.tapeColour ? ` • pinline ${build.tapeColour}` : ""}
            {accentColours.length ? ` • accents ${accentColours.join(", ")}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {build.intendedForStock && build.allocationLabel ? (
            <p className="text-sm font-medium text-slate-600">{build.allocationLabel}</p>
          ) : null}
          <span className="text-sm font-medium text-teal-700">Open details</span>
        </div>
      </summary>

      <div className="space-y-6 border-t border-slate-200 bg-slate-50/60 px-5 py-5">
        <div className="flex flex-wrap gap-3">
          {canManageDealerData(user) ? (
            <Button asChild variant="outline">
              <Link href={`/app/orders/${orderId}/builds/${build.id}/edit`}>Edit build</Link>
            </Button>
          ) : null}
          {canManageDealerData(user) ? (
            <form action={duplicateBuildAction}>
              <input name="buildId" type="hidden" value={build.id} />
              <input name="orderId" type="hidden" value={orderId} />
              <Button type="submit" variant="outline">
                Duplicate build
              </Button>
            </form>
          ) : null}
          {canManageDealerData(user) && build.portalToken ? (
            <Button asChild variant="outline">
              <Link href={`/portal/${build.portalToken.token}`} target="_blank">
                Customer portal
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <KayakPreview
            accentColours={accentColours}
            className="bg-white"
            colourType={build.colourType}
            deckColour={build.deckColour}
            hullColour={build.hullColour}
            materialType={build.materialType}
            model={build.model}
            tapeColour={build.tapeColour}
          />

          <div className="rounded-3xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Build specification
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Material</dt>
                <dd className="font-medium text-slate-900">{build.materialType}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Colour type</dt>
                <dd className="font-medium text-slate-900">{build.colourType.replaceAll("_", " ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Deck / Hull</dt>
                <dd className="text-right font-medium text-slate-900">
                  {build.deckColour} / {hullLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Hull override</dt>
                <dd className="text-right font-medium text-slate-900">
                  {hullLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Pinline</dt>
                <dd className="font-medium text-slate-900">{build.tapeColour ?? "Not specified"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Serial</dt>
                <dd className="font-medium text-slate-900">{build.serialNumber ?? "Pending"}</dd>
              </div>
              {build.intendedForStock ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Stock designation</dt>
                  <dd className="font-medium text-slate-900">{build.allocationLabel ?? "Not specified"}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-3xl bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Options
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                <span className="font-semibold text-slate-900">Accent colours:</span>{" "}
                <span className="text-slate-700">
                  {accentColours.length ? accentColours.join(", ") : "None"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Decals:</span>{" "}
                <span className="text-slate-700">{build.decals ?? "Standard"}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Rod holders:</span>{" "}
                <span className="text-slate-700">{build.rodHolderDetails ?? "Not specified"}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Special requests:</span>{" "}
                <span className="text-slate-700">{build.specialRequests ?? "None"}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Notes:</span>{" "}
                <span className="text-slate-700">{build.additionalNotes ?? "None"}</span>
              </p>
            </div>
          </div>
        </div>

        <form action={updateBuildInternalStatusAction} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <input name="buildId" type="hidden" value={build.id} />
          <input name="redirectTo" type="hidden" value={`/app/orders/${orderId}`} />
          <div>
            <p className="text-sm font-semibold text-slate-900">Internal workflow status</p>
            <p className="text-sm text-slate-500">
              Factory users can move the internal build stage without editing the full build spec.
            </p>
          </div>
          <div className="flex gap-3">
            <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={build.internalStatus} name="internalStatus">
              {INTERNAL_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Update
            </Button>
          </div>
        </form>

        {build.itemLines.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Linked item lines
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {build.itemLines.map((item) => (
                <p className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700" key={item.id}>
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <CommentThread buildId={build.id} comments={build.comments} redirectTo={`/app/orders/${orderId}`} userRole={user.role} />
      </div>
    </details>
  );
}
