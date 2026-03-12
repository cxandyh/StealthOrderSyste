import { notFound } from "next/navigation";

import { ReceivingSessionView } from "@/components/orders/receiving-session-view";
import { canManageDealerData } from "@/features/auth/permissions";
import { requireUser } from "@/features/auth/session";
import { getReceivingSessionForUser } from "@/features/orders/data";

export default async function ReceivingSessionPage({
  params,
}: {
  params: Promise<{ orderId: string; sessionId: string }>;
}) {
  const { orderId, sessionId } = await params;
  const user = await requireUser();

  if (!canManageDealerData(user)) {
    notFound();
  }

  const session = await getReceivingSessionForUser(user, orderId, sessionId);

  if (!session) {
    notFound();
  }

  return <ReceivingSessionView session={session} />;
}
