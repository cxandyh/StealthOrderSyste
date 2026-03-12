"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import type { Prisma } from "@/generated/prisma/client";
import { saveBuildAction } from "@/features/orders/actions";
import {
  COLOUR_TYPES,
  CUSTOMER_STATUS_OPTIONS,
  INTERNAL_STATUS_OPTIONS,
  MATERIAL_TYPES,
  MODEL_SUGGESTIONS,
} from "@/features/orders/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type EditableBuild = Prisma.KayakBuildGetPayload<{
  include: {
    customer: true;
  };
}>;

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : isEditing ? "Save build" : "Create build"}
    </Button>
  );
}

export function BuildForm({
  build,
  orderId,
  redirectTo,
}: {
  build?: EditableBuild | null;
  orderId: string;
  redirectTo: string;
}) {
  const [intendedForStock, setIntendedForStock] = useState(build?.intendedForStock ?? false);
  const [colourType, setColourType] = useState(build?.colourType ?? "SOLID");
  const customerName = useMemo(() => {
    if (!build?.customer) {
      return "";
    }

    return `${build.customer.firstName} ${build.customer.lastName}`.trim();
  }, [build]);
  const showAccentFields = colourType === "MULTI_BAND" || colourType === "CUSTOM";

  return (
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>{build ? "Edit build" : "Add build"}</CardTitle>
        <CardDescription>
          Capture the Stealth-specific build specification in a review-first format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveBuildAction} className="space-y-8">
          <input name="orderId" type="hidden" value={orderId} />
          <input name="redirectTo" type="hidden" value={redirectTo} />
          {build ? <input name="buildId" type="hidden" value={build.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:col-span-2">
              <input
                checked={intendedForStock}
                className="size-4 rounded border-slate-300"
                id="intendedForStock"
                name="intendedForStock"
                onChange={(event) => setIntendedForStock(event.target.checked)}
                type="checkbox"
              />
              <Label className="cursor-pointer" htmlFor="intendedForStock">
                This build is intended for stock rather than a named customer.
              </Label>
            </div>
            {intendedForStock ? (
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="allocationLabel">Stock designation</Label>
                <Input defaultValue={build?.allocationLabel ?? ""} id="allocationLabel" name="allocationLabel" placeholder="Floor stock or customer to be assigned" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer name</Label>
                  <Input defaultValue={customerName} id="customerName" name="customerName" placeholder="Jules Barker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer email</Label>
                  <Input defaultValue={build?.customer?.email ?? ""} id="customerEmail" name="customerEmail" placeholder="jules@example.com" type="email" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input defaultValue={build?.model ?? ""} id="model" list="model-suggestions" name="model" placeholder="Pro Fisha 475" required />
              <datalist id="model-suggestions">
                {MODEL_SUGGESTIONS.map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialType">Material type</Label>
              <Input defaultValue={build?.materialType ?? ""} id="materialType" list="material-suggestions" name="materialType" placeholder="Carbon Hybrid" required />
              <datalist id="material-suggestions">
                {MATERIAL_TYPES.map((material) => (
                  <option key={material} value={material} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="colourType">Colour type</Label>
              <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={colourType} id="colourType" name="colourType" onChange={(event) => setColourType(event.target.value)}>
                {COLOUR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial number</Label>
              <Input defaultValue={build?.serialNumber ?? ""} id="serialNumber" name="serialNumber" placeholder="SA-480-66291" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deckColour">Deck colour</Label>
              <Input defaultValue={build?.deckColour ?? ""} id="deckColour" name="deckColour" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hullColour">Hull colour</Label>
              <Input defaultValue={build?.hullColour ?? ""} id="hullColour" name="hullColour" required />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="tapeColour">Tape colour</Label>
              <Input defaultValue={build?.tapeColour ?? ""} id="tapeColour" name="tapeColour" />
            </div>
            {showAccentFields ? (
              <>
                {[
                  ["tipColour1", "Tip colour 1"],
                  ["tipColour2", "Tip colour 2"],
                  ["bandColour1", "Band colour 1"],
                  ["bandColour2", "Band colour 2"],
                  ["bandColour3", "Band colour 3"],
                  ["bandColour4", "Band colour 4"],
                  ["bandColour5", "Band colour 5"],
                  ["stripeColour1", "Stripe colour 1"],
                  ["stripeColour2", "Stripe colour 2"],
                ].map(([field, label]) => (
                  <div className="space-y-2" key={field}>
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      defaultValue={(build?.[field as keyof EditableBuild] as string | null | undefined) ?? ""}
                      id={field}
                      name={field}
                    />
                  </div>
                ))}
              </>
            ) : null}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="decals">Decals</Label>
              <Input defaultValue={build?.decals ?? ""} id="decals" name="decals" placeholder="Minimal logo set" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="rodHolderDetails">Rod holder details</Label>
              <Textarea defaultValue={build?.rodHolderDetails ?? ""} id="rodHolderDetails" name="rodHolderDetails" placeholder="Locations, star ports, or install notes." rows={3} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="specialRequests">Special requests</Label>
              <Textarea defaultValue={build?.specialRequests ?? ""} id="specialRequests" name="specialRequests" placeholder="Any build-specific request for the factory." rows={3} />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="additionalNotes">Internal notes</Label>
              <Textarea defaultValue={build?.additionalNotes ?? ""} id="additionalNotes" name="additionalNotes" placeholder="Dealer-only notes and handover context." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalStatus">Internal status</Label>
              <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={build?.internalStatus ?? "DRAFT"} id="internalStatus" name="internalStatus">
                {INTERNAL_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerVisibleStatus">Customer status</Label>
              <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" defaultValue={build?.customerVisibleStatus ?? "ORDER_CONFIRMED"} id="customerVisibleStatus" name="customerVisibleStatus">
                {CUSTOMER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SubmitButton isEditing={Boolean(build)} />
        </form>
      </CardContent>
    </Card>
  );
}
