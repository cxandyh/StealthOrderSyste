"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import type { Prisma } from "@/generated/prisma/client";
import { saveBuildAction } from "@/features/orders/actions";
import {
  COLOUR_TYPES,
  CUSTOMER_STATUS_OPTIONS,
  HULL_OVERRIDE_OPTIONS,
  INTERNAL_STATUS_OPTIONS,
  MATERIAL_TYPES,
  MODEL_SUGGESTIONS,
  STANDARD_COLOUR_OPTIONS,
} from "@/features/orders/constants";
import { KayakPreview } from "@/components/orders/kayak-preview";
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

const CUSTOM_COLOUR_LABEL = "Quote for Custom Colour";
const PRESET_COLOUR_OPTIONS = STANDARD_COLOUR_OPTIONS.filter(
  (option) => option.swatch !== "transparent",
);
const COLOUR_TYPE_COPY: Record<string, { description: string; title: string }> = {
  BANDED: {
    description:
      "Choose base, front tip, front band, middle band, back band, back tip, and pinline colours.",
    title: "Banded",
  },
  DOUBLE_RACING_STRIPE: {
    description: "Choose a base, one stripe colour for both stripes, and a pinline colour.",
    title: "Double racing stripe",
  },
  FADED_TIPS: {
    description: "Choose a base, front tip, back tip, and pinline colour.",
    title: "Faded tips",
  },
  PAINTED_TIPS: {
    description: "Choose a base, front tip, back tip, and pinline colour.",
    title: "Painted tips",
  },
  PLAIN: {
    description: "Choose the base colour and pinline. Hull finish stays as a separate override.",
    title: "Plain",
  },
  SINGLE_RACING_STRIPE: {
    description: "Choose a base, one stripe colour, and a pinline colour.",
    title: "Single racing stripe",
  },
};

function isPresetColour(value?: string | null) {
  return PRESET_COLOUR_OPTIONS.some((option) => option.value === value);
}

function normalizeColourType(value?: string | null) {
  if (!value) {
    return "PLAIN";
  }

  if (COLOUR_TYPES.includes(value as (typeof COLOUR_TYPES)[number])) {
    return value;
  }

  switch (value) {
    case "SOLID":
      return "PLAIN";
    case "TWO_TONE":
      return "PAINTED_TIPS";
    case "MULTI_BAND":
    case "CUSTOM":
      return "BANDED";
    default:
      return "PLAIN";
  }
}

function normalizeHullOverride(value?: string | null) {
  if (!value || value === "No Hull Override") {
    return "No Hull Override";
  }

  if (value === "White" || value === "White Hull") {
    return "White Hull";
  }

  if (value === "Clear" || value === "Clear Hull") {
    return "Clear Hull";
  }

  return "No Hull Override";
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : isEditing ? "Save build" : "Add kayak to order"}
    </Button>
  );
}

function PaletteColourInput({
  description,
  id,
  label,
  name,
  onChange,
  required,
  value,
}: {
  description?: string;
  id: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  required?: boolean;
  value?: string | null;
}) {
  const [isCustomSelected, setIsCustomSelected] = useState(
    Boolean(value) && !isPresetColour(value),
  );

  const selectedValue = value ?? "";

  return (
    <div className="space-y-3">
      <input name={name} type="hidden" value={selectedValue} />
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLOUR_OPTIONS.map((option) => {
          const selected = !isCustomSelected && selectedValue === option.value;

          return (
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition ${
                selected
                  ? "border-teal-400 bg-teal-50 text-teal-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
              key={option.value}
              onClick={() => {
                setIsCustomSelected(false);
                onChange(option.value);
              }}
              type="button"
            >
              <span
                className="inline-block size-3 rounded-full border border-slate-300"
                style={{ backgroundColor: option.swatch }}
              />
              {option.label}
            </button>
          );
        })}
        <button
          className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition ${
            isCustomSelected
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
          }`}
          onClick={() => {
            setIsCustomSelected(true);
            if (isPresetColour(selectedValue)) {
              onChange("");
            }
          }}
          type="button"
        >
          {CUSTOM_COLOUR_LABEL}
        </button>
      </div>
      {isCustomSelected ? (
        <Input
          id={id}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter colour reference, HEX, RAL, Pantone, or notes"
          required={required}
          value={selectedValue}
        />
      ) : null}
    </div>
  );
}

function HullOverrideInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="space-y-3">
      <input name="hullColour" type="hidden" value={value} />
      <div className="space-y-1">
        <Label>Hull finish override</Label>
        <p className="text-xs text-slate-500">
          Keep this as a simple override: no override, white hull, or clear hull.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {HULL_OVERRIDE_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                selected
                  ? "border-teal-400 bg-teal-50 text-teal-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <span
                className="inline-block size-3 rounded-full border border-slate-300"
                style={{
                  backgroundColor:
                    option.swatch === "transparent" ? "#f8fafc" : option.swatch,
                }}
              />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
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
  const [intendedForStock, setIntendedForStock] = useState(
    build?.intendedForStock ?? false,
  );
  const [colourType, setColourType] = useState(normalizeColourType(build?.colourType));
  const [model, setModel] = useState(build?.model ?? MODEL_SUGGESTIONS[0]);
  const [materialType, setMaterialType] = useState(
    build?.materialType ?? MATERIAL_TYPES[0],
  );
  const [deckColour, setDeckColour] = useState(build?.deckColour ?? "");
  const [hullColour, setHullColour] = useState(normalizeHullOverride(build?.hullColour));
  const [tapeColour, setTapeColour] = useState(build?.tapeColour ?? "");
  const [tipColour1, setTipColour1] = useState(build?.tipColour1 ?? "");
  const [tipColour2, setTipColour2] = useState(build?.tipColour2 ?? "");
  const [bandColour1, setBandColour1] = useState(build?.bandColour1 ?? "");
  const [bandColour2, setBandColour2] = useState(build?.bandColour2 ?? "");
  const [bandColour3, setBandColour3] = useState(build?.bandColour3 ?? "");
  const [stripeColour1, setStripeColour1] = useState(build?.stripeColour1 ?? "");
  const customerName = useMemo(() => {
    if (!build?.customer) {
      return "";
    }

    return `${build.customer.firstName} ${build.customer.lastName}`.trim();
  }, [build]);
  const formKey = `${build?.id ?? "new"}-${build?.updatedAt?.toISOString() ?? "fresh"}`;
  const colourTypeCopy = COLOUR_TYPE_COPY[colourType] ?? COLOUR_TYPE_COPY.PLAIN;
  const usesTips = colourType === "FADED_TIPS" || colourType === "PAINTED_TIPS";
  const usesBands = colourType === "BANDED";
  const usesStripe =
    colourType === "SINGLE_RACING_STRIPE" || colourType === "DOUBLE_RACING_STRIPE";
  const previewAccents = [
    tipColour1,
    tipColour2,
    bandColour1,
    bandColour2,
    bandColour3,
    stripeColour1,
  ].filter(Boolean);

  return (
    <Card className="rounded-[2rem] border-slate-200 shadow-none">
      <CardHeader>
        <CardTitle>{build ? "Edit build" : "Add kayak to order"}</CardTitle>
        <CardDescription>
          Use the Stealth design rules: pick one design, choose only the relevant colours,
          and keep the hull finish as a simple override.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <form action={saveBuildAction} className="space-y-8" key={formKey}>
            <input name="orderId" type="hidden" value={orderId} />
            <input name="redirectTo" type="hidden" value={redirectTo} />
            {build ? <input name="buildId" type="hidden" value={build.id} /> : null}

            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Allocation
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Choose whether this is a customer build or a stock build before entering
                  the rest of the spec.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
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
              <div className="grid gap-4 lg:grid-cols-2">
                {intendedForStock ? (
                  <div className="space-y-2 lg:col-span-2">
                    <Label htmlFor="allocationLabel">Stock designation</Label>
                    <Input
                      defaultValue={build?.allocationLabel ?? ""}
                      id="allocationLabel"
                      name="allocationLabel"
                      placeholder="Floor stock, demo boat, or reserved inventory"
                      required={intendedForStock}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer name</Label>
                      <Input
                        defaultValue={customerName}
                        id="customerName"
                        name="customerName"
                        placeholder="Jules Barker"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Customer email</Label>
                      <Input
                        defaultValue={build?.customer?.email ?? ""}
                        id="customerEmail"
                        name="customerEmail"
                        placeholder="jules@example.com"
                        type="email"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Core build
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a model, material, and one Stealth design pattern.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    id="model"
                    name="model"
                    onChange={(event) => setModel(event.target.value)}
                    value={model}
                  >
                    {MODEL_SUGGESTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialType">Material type</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    id="materialType"
                    name="materialType"
                    onChange={(event) => setMaterialType(event.target.value)}
                    value={materialType}
                  >
                    {MATERIAL_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="colourType">Design</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    id="colourType"
                    name="colourType"
                    onChange={(event) => setColourType(event.target.value)}
                    value={colourType}
                  >
                    {COLOUR_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">{colourTypeCopy.description}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial number</Label>
                  <Input
                    defaultValue={build?.serialNumber ?? ""}
                    id="serialNumber"
                    name="serialNumber"
                    placeholder="SA-480-66291"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Base and finish
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  All design fields use the shared Stealth palette. Custom requests need a
                  colour reference.
                </p>
              </div>
              <div className="grid gap-5">
                <PaletteColourInput
                  id="deckColour"
                  label="Base colour"
                  name="deckColour"
                  onChange={setDeckColour}
                  required
                  value={deckColour}
                />
                <HullOverrideInput onChange={setHullColour} value={hullColour} />
                <PaletteColourInput
                  id="tapeColour"
                  label="Pinline colour"
                  name="tapeColour"
                  onChange={setTapeColour}
                  required
                  value={tapeColour}
                />
              </div>
            </div>

            {colourType !== "PLAIN" ? (
              <div className="space-y-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                    {colourTypeCopy.title} colours
                  </p>
                  <p className="mt-2 text-sm text-amber-900">{colourTypeCopy.description}</p>
                </div>

                {usesTips ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <PaletteColourInput
                      id="tipColour1"
                      label="Front tip colour"
                      name="tipColour1"
                      onChange={setTipColour1}
                      required
                      value={tipColour1}
                    />
                    <PaletteColourInput
                      id="tipColour2"
                      label="Back tip colour"
                      name="tipColour2"
                      onChange={setTipColour2}
                      required
                      value={tipColour2}
                    />
                  </div>
                ) : null}

                {usesBands ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <PaletteColourInput
                      id="tipColour1"
                      label="Front tip colour"
                      name="tipColour1"
                      onChange={setTipColour1}
                      required
                      value={tipColour1}
                    />
                    <PaletteColourInput
                      id="bandColour1"
                      label="Front band colour"
                      name="bandColour1"
                      onChange={setBandColour1}
                      required
                      value={bandColour1}
                    />
                    <PaletteColourInput
                      id="bandColour2"
                      label="Middle band colour"
                      name="bandColour2"
                      onChange={setBandColour2}
                      required
                      value={bandColour2}
                    />
                    <PaletteColourInput
                      id="bandColour3"
                      label="Back band colour"
                      name="bandColour3"
                      onChange={setBandColour3}
                      required
                      value={bandColour3}
                    />
                    <PaletteColourInput
                      id="tipColour2"
                      label="Back tip colour"
                      name="tipColour2"
                      onChange={setTipColour2}
                      required
                      value={tipColour2}
                    />
                  </div>
                ) : null}

                {usesStripe ? (
                  <PaletteColourInput
                    description={
                      colourType === "DOUBLE_RACING_STRIPE"
                        ? "This colour applies to both stripes."
                        : undefined
                    }
                    id="stripeColour1"
                    label="Stripe colour"
                    name="stripeColour1"
                    onChange={setStripeColour1}
                    required
                    value={stripeColour1}
                  />
                ) : null}
              </div>
            ) : null}

            <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Options and status
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="decals">Decals</Label>
                  <Input
                    defaultValue={build?.decals ?? ""}
                    id="decals"
                    name="decals"
                    placeholder="Minimal logo set"
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="rodHolderDetails">Rod holder details</Label>
                  <Textarea
                    defaultValue={build?.rodHolderDetails ?? ""}
                    id="rodHolderDetails"
                    name="rodHolderDetails"
                    placeholder="Locations, star ports, or install notes."
                    rows={3}
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="specialRequests">Special requests</Label>
                  <Textarea
                    defaultValue={build?.specialRequests ?? ""}
                    id="specialRequests"
                    name="specialRequests"
                    placeholder="Any build-specific request for the factory."
                    rows={3}
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="additionalNotes">Internal notes</Label>
                  <Textarea
                    defaultValue={build?.additionalNotes ?? ""}
                    id="additionalNotes"
                    name="additionalNotes"
                    placeholder="Dealer-only notes and handover context."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internalStatus">Internal status</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    defaultValue={build?.internalStatus ?? "DRAFT"}
                    id="internalStatus"
                    name="internalStatus"
                  >
                    {INTERNAL_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerVisibleStatus">Customer status</Label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    defaultValue={build?.customerVisibleStatus ?? "ORDER_CONFIRMED"}
                    id="customerVisibleStatus"
                    name="customerVisibleStatus"
                  >
                    {CUSTOMER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <SubmitButton isEditing={Boolean(build)} />
          </form>

          <div className="space-y-4 xl:sticky xl:top-8 xl:self-start">
            <KayakPreview
              accentColours={previewAccents}
              colourType={colourType}
              deckColour={deckColour}
              hullColour={hullColour}
              materialType={materialType}
              model={model}
              tapeColour={tapeColour}
            />
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Entry guidance
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Start with the design type, then only fill the colour fields that design requires.</p>
                <p>The hull stays as a simple finish override: white hull or clear hull.</p>
                <p>For custom colours, choose the custom option and enter the reference directly.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
