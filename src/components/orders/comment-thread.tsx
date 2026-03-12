import { Prisma, UserRole } from "@/generated/prisma/client";
import { addBuildCommentAction } from "@/features/orders/actions";
import { ROLE_LABELS } from "@/features/orders/constants";
import { initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/orders/status-badge";

type ThreadComment = Prisma.BuildCommentGetPayload<{
  include: {
    authorUser: true;
  };
}>;

export function CommentThread({
  buildId,
  comments,
  redirectTo,
  userRole,
}: {
  buildId: string;
  comments: ThreadComment[];
  redirectTo: string;
  userRole: UserRole;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
          Build thread
        </h3>
        <span className="text-xs text-slate-500">{comments.length} comments</span>
      </div>
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No build comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm" key={comment.id}>
              <Avatar className="size-10 border border-slate-200">
                <AvatarFallback className="bg-slate-100 text-slate-700">
                  {initials(comment.authorUser?.name ?? ROLE_LABELS[comment.authorRole ?? UserRole.DEALER_ADMIN])}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {comment.authorUser?.name ?? ROLE_LABELS[comment.authorRole ?? UserRole.DEALER_ADMIN]}
                  </p>
                  {comment.authorRole ? <StatusBadge value={comment.authorRole} /> : null}
                  <StatusBadge value={comment.visibility} />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{comment.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <form action={addBuildCommentAction} className="space-y-3">
        <input name="buildId" type="hidden" value={buildId} />
        <input name="redirectTo" type="hidden" value={redirectTo} />
        <Textarea name="message" placeholder="Add a factory clarification, reply, or customer-safe update..." required rows={3} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {userRole === UserRole.FACTORY_USER ? (
            <input name="visibility" type="hidden" value="DEALER_FACTORY" />
          ) : (
            <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700" defaultValue="DEALER_FACTORY" name="visibility">
              <option value="DEALER_FACTORY">Dealer / factory only</option>
              <option value="CUSTOMER_VISIBLE">Customer visible update</option>
            </select>
          )}
          <Button type="submit">Post comment</Button>
        </div>
      </form>
    </div>
  );
}
