import Link from "next/link";

import { Prisma } from "@/generated/prisma/client";
import { SessionUser, canManageDealerData } from "@/features/auth/permissions";
import { updateBuildInternalStatusAction } from "@/features/orders/actions";
import { INTERNAL_STATUS_OPTIONS } from "@/features/orders/constants";
import { fullName } from "@/lib/format";
import { CommentThread } from "@/components/orders/comment-thread";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  orderId,
  user,
}: {
  build: BuildCardBuild;
  orderId: string;
  user: SessionUser;
}) {
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
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-xl">{build.model}</CardTitle>
            <CardDescription className="mt-2">{displayName}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={build.internalStatus} />
            <StatusBadge value={build.customerVisibleStatus} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {canManageDealerData(user) ? (
            <Button asChild variant="outline">
              <Link href={`/app/orders/${orderId}/builds/${build.id}/edit`}>Edit build</Link>
            </Button>
          ) : null}
          {canManageDealerData(user) && build.portalToken ? (
            <Button asChild variant="outline">
              <Link href={`/portal/${build.portalToken.token}`} target="_blank">
                Customer portal
              </Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Build spec
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
                  {build.deckColour} / {build.hullColour}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Tape</dt>
                <dd className="font-medium text-slate-900">{build.tapeColour ?? "Not specified"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Serial</dt>
                <dd className="font-medium text-slate-900">{build.serialNumber ?? "Pending"}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
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
        <form action={updateBuildInternalStatusAction} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
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
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Linked item lines
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {build.itemLines.map((item) => (
                <StatusBadge key={item.id} value={item.category} />
              ))}
              {build.itemLines.map((item) => (
                <p className="text-sm text-slate-700" key={`${item.id}-name`}>
                  {item.quantity}x {item.name}
                </p>
              ))}
            </div>
          </div>
        ) : null}
        <CommentThread buildId={build.id} comments={build.comments} redirectTo={`/app/orders/${orderId}`} userRole={user.role} />
      </CardContent>
    </Card>
  );
}
