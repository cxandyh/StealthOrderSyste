import { notFound } from "next/navigation";

import { ArrowRight, Sparkles } from "lucide-react";

import { KayakPreview } from "@/components/orders/kayak-preview";
import { StatusBadge } from "@/components/orders/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalBuildByToken } from "@/features/orders/data";
import { fullName } from "@/lib/format";

const portalStages = [
  {
    description: "Your build has been approved and locked in with the factory.",
    value: "ORDER_CONFIRMED",
  },
  {
    description: "The kayak shell and layup are now moving through production.",
    value: "IN_PRODUCTION",
  },
  {
    description: "The build is complete and being prepared for dispatch.",
    value: "PREPARING_FOR_DELIVERY",
  },
  {
    description: "The shipment has landed and is with your local team.",
    value: "ARRIVED_IN_COUNTRY",
  },
  {
    description: "Final checks and dealer-side setup are underway.",
    value: "FINAL_PREP",
  },
  {
    description: "Your kayak is ready for collection or handover.",
    value: "READY",
  },
] as const;

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

  const currentStageIndex = portalStages.findIndex(
    (stage) => stage.value === build.customerVisibleStatus,
  );
  const hullLabel =
    build.hullColour === "No Hull Override" ? "No override" : build.hullColour;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#edf6f4_100%)] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="overflow-hidden rounded-[2.5rem] bg-slate-950 text-slate-50 shadow-2xl shadow-slate-950/15">
          <div className="grid gap-6 px-6 py-8 md:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-300">
                Stealth Order Hub
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight">
                {build.customer
                  ? `${fullName(build.customer.firstName, build.customer.lastName)}'s build`
                  : "Your build portal"}
              </h1>
              <p className="mt-3 text-sm text-slate-300">
                This is the customer-safe view of your kayak configuration and build progress.
                The illustration reflects the saved spec so you can confirm the general build direction at a glance.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge value={build.customerVisibleStatus} />
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/8 bg-white/6 p-3">
              <KayakPreview
                accentColours={[
                  build.tipColour1,
                  build.tipColour2,
                  build.bandColour1,
                  build.bandColour2,
                  build.bandColour3,
                  build.bandColour4,
                  build.bandColour5,
                  build.stripeColour1,
                  build.stripeColour2,
                ]}
                className="border-white/10"
                colourType={build.colourType}
                deckColour={build.deckColour}
                hullColour={build.hullColour}
                materialType={build.materialType}
                model={build.model}
                tapeColour={build.tapeColour}
              />
            </div>
          </div>
        </section>

        <Card className="rounded-[2rem] border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle>Current stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700">
              Your build is currently at <span className="font-semibold text-slate-950">{build.customerVisibleStatus.replaceAll("_", " ").toLowerCase()}</span>.
              We only show customer-safe milestones here so the updates stay clear and easy to follow.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {portalStages.map((stage, index) => {
                const complete = index <= currentStageIndex;
                const current = stage.value === build.customerVisibleStatus;

                return (
                  <div
                    className={`rounded-3xl border px-4 py-4 ${current ? "border-teal-300 bg-teal-50" : complete ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}
                    key={stage.value}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-medium ${current ? "text-teal-900" : "text-slate-700"}`}>
                        {stage.value.replaceAll("_", " ")}
                      </p>
                      {complete ? <Sparkles className="size-4 text-teal-600" /> : null}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{stage.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
              <span className="font-semibold text-slate-900">Hull override:</span> {hullLabel}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Pinline colour:</span> {build.tapeColour ?? "Pending"}
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
            <p className="md:col-span-2 text-xs text-slate-500">
              This preview is an indicative configuration view, not a photorealistic factory render.
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
                  <div className="flex items-start gap-3">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-teal-700" />
                    <p className="text-sm text-slate-700">{comment.message}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
