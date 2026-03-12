import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/orders/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalBuildByToken } from "@/features/orders/data";
import { fullName } from "@/lib/format";

export default async function CustomerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const build = await getPortalBuildByToken(token);

  if (!build) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#edf6f4_100%)] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2.5rem] bg-slate-950 px-6 py-8 text-slate-50 shadow-2xl shadow-slate-950/15">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-300">
            Stealth Order Hub
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            {build.customer
              ? `${fullName(build.customer.firstName, build.customer.lastName)}'s build`
              : "Your build portal"}
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            This portal shows the approved customer-facing view of your kayak specification and current status.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge value={build.customerVisibleStatus} />
            <StatusBadge value={build.factoryOrder.status} />
          </div>
        </div>

        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle>{build.model}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-900">Material:</span> {build.materialType}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Colour type:</span> {build.colourType.replaceAll("_", " ")}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Deck colour:</span> {build.deckColour}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Hull colour:</span> {build.hullColour}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Tape colour:</span> {build.tapeColour ?? "Pending"}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Serial number:</span> {build.serialNumber ?? "Will appear once available"}
            </p>
            <p className="md:col-span-2">
              <span className="font-semibold text-slate-900">Decals:</span> {build.decals ?? "Standard"}
            </p>
            <p className="md:col-span-2">
              <span className="font-semibold text-slate-900">Rod holder details:</span> {build.rodHolderDetails ?? "Not supplied"}
            </p>
            <p className="md:col-span-2">
              <span className="font-semibold text-slate-900">Special requests:</span> {build.specialRequests ?? "None"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle>Latest updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {build.comments.length === 0 ? (
              <p className="text-sm text-slate-500">No customer-visible updates yet.</p>
            ) : (
              build.comments.map((comment) => (
                <div className="rounded-3xl border border-slate-200 bg-white p-4" key={comment.id}>
                  <p className="text-sm text-slate-700">{comment.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
