import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { BuildForm } from "@/components/orders/build-form";
import { Button } from "@/components/ui/button";
import { canManageDealerData } from "@/features/auth/permissions";
import { requireUser } from "@/features/auth/session";
import { getBuildForForm } from "@/features/orders/data";

export default async function EditBuildPage({
  params,
}: {
  params: Promise<{ buildId: string; orderId: string }>;
}) {
  const { buildId, orderId } = await params;
  const user = await requireUser();

  if (!canManageDealerData(user)) {
    notFound();
  }

  const build = await getBuildForForm(user, orderId, buildId);

  if (!build) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Edit build
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {build.model}
          </h1>
        </div>
        {build.portalToken ? (
          <Button asChild variant="outline">
            <Link href={`/portal/${build.portalToken.token}`} target="_blank">
              <ExternalLink className="mr-2 size-4" />
              Open customer portal
            </Link>
          </Button>
        ) : null}
      </div>
      <BuildForm build={build} orderId={orderId} redirectTo={`/app/orders/${orderId}`} />
    </div>
  );
}
