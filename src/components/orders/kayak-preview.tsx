import { useId } from "react";

import { STANDARD_COLOUR_OPTIONS } from "@/features/orders/constants";
import { cn } from "@/lib/utils";

function resolveColour(value?: string | null) {
  if (!value) {
    return "#e5e7eb";
  }

  if (value.toLowerCase() === "no hull override") {
    return "#e5e7eb";
  }

  if (value.toLowerCase() === "white hull") {
    return "#ffffff";
  }

  if (value.toLowerCase() === "clear hull") {
    return "#d8e2e8";
  }

  const matched = STANDARD_COLOUR_OPTIONS.find(
    (option) =>
      option.value.toLowerCase() === value.toLowerCase() ||
      option.label.toLowerCase() === value.toLowerCase(),
  );

  if (matched && matched.swatch !== "transparent") {
    return matched.swatch;
  }

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) {
    return value.trim();
  }

  return "#cbd5e1";
}

function resolveModelShape(model: string) {
  const normalized = model.toLowerCase();

  if (normalized.includes("fusion")) {
    return "M14 96C44 70 116 64 218 64C311 64 388 72 420 96C390 120 311 128 218 128C117 128 43 122 14 96Z";
  }

  if (normalized.includes("evolution")) {
    return "M18 96C56 62 138 52 218 56C293 60 370 72 416 96C374 120 296 132 218 136C134 140 54 128 18 96Z";
  }

  if (normalized.includes("supalite")) {
    return "M24 96C70 72 138 68 218 70C294 72 358 80 408 96C362 112 293 120 218 122C143 124 72 118 24 96Z";
  }

  return "M12 96C42 58 128 46 218 50C304 54 386 68 424 96C386 124 304 138 218 142C128 146 42 134 12 96Z";
}

export function KayakPreview({
  accentColours = [],
  className,
  colourType,
  deckColour,
  hullColour,
  materialType,
  model,
  tapeColour,
}: {
  accentColours?: Array<string | null | undefined>;
  className?: string;
  colourType?: string;
  deckColour?: string | null;
  hullColour?: string | null;
  materialType?: string | null;
  model?: string | null;
  tapeColour?: string | null;
}) {
  const previewId = useId().replace(/:/g, "");
  const filteredAccents = accentColours.filter(Boolean).slice(0, 5) as string[];
  const deck = resolveColour(deckColour);
  const hull = hullColour?.toLowerCase() === "no hull override" ? deck : resolveColour(hullColour);
  const tape = resolveColour(tapeColour);
  const accents = filteredAccents.map(resolveColour);
  const silhouette = resolveModelShape(model ?? "Stealth");
  const deckGradientId = `${previewId}-deck-gradient`;
  const hullGradientId = `${previewId}-hull-gradient`;
  const hullLabel = hullColour?.toLowerCase() === "no hull override" ? "No override" : hullColour ?? "Not set";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#eef4f8_100%)] shadow-sm",
        className,
      )}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
          Build preview
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-950">{model ?? "Select a model"}</p>
            <p className="text-sm text-slate-500">
              {materialType ?? "Material pending"}{colourType ? ` • ${colourType.replaceAll("_", " ")}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6">
        <div className="rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] p-5">
          <svg aria-label="Kayak preview" className="h-auto w-full" viewBox="0 0 436 196">
            <defs>
              <linearGradient id={deckGradientId} x1="0%" x2="100%">
                <stop offset="0%" stopColor={deck} />
                <stop offset="100%" stopColor={deck} />
              </linearGradient>
              <linearGradient id={hullGradientId} x1="0%" x2="100%">
                <stop offset="0%" stopColor={hull} />
                <stop offset="100%" stopColor={hull} />
              </linearGradient>
            </defs>

            <path
              d={silhouette}
              fill={`url(#${hullGradientId})`}
              stroke="#0f172a"
              strokeOpacity="0.14"
              strokeWidth="4"
            />
            <path
              d="M42 96C75 74 143 68 218 70C294 72 359 78 393 96C358 112 293 118 218 120C142 122 74 116 42 96Z"
              fill={`url(#${deckGradientId})`}
              opacity="0.95"
            />
            <path
              d="M92 96C125 88 170 85 218 85C267 85 311 88 344 96C311 104 267 107 218 107C170 107 125 104 92 96Z"
              fill={tape}
              opacity="0.9"
            />
            {accents.map((accent, index) => (
              <rect
                fill={accent}
                height="10"
                key={`${accent}-${index}`}
                opacity="0.95"
                rx="5"
                width="32"
                x={130 + index * 36}
                y="91"
              />
            ))}
            <circle cx="88" cy="96" fill={accents[0] ?? deck} opacity="0.95" r="10" />
            <circle cx="348" cy="96" fill={accents[1] ?? hull} opacity="0.95" r="10" />
          </svg>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Deck", deckColour ?? "Not set", deck],
            ["Hull", hullLabel, hull],
            ["Pinline", tapeColour ?? "Not set", tape],
          ].map(([label, value, swatch]) => (
            <div className="rounded-2xl bg-slate-50 px-3 py-3" key={label}>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="inline-block size-4 rounded-full border border-slate-300"
                  style={{ backgroundColor: swatch as string }}
                />
                <span className="text-sm font-medium text-slate-800">{value}</span>
              </div>
            </div>
          ))}
        </div>
        {filteredAccents.length ? (
          <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Accent colours</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {filteredAccents.map((accent) => (
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-slate-700" key={accent}>
                  <span
                    className="inline-block size-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: resolveColour(accent) }}
                  />
                  {accent}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
