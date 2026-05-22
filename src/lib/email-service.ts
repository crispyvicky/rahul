import { enqueueEmailJob } from "./notification-queue";
import type { EmailTemplateData } from "./email-templates";

export async function sendClaimApprovedEmail(params: {
  to: string;
  name: string;
  action: string;
  points: number;
  userId?: string | null;
}) {
  const data: EmailTemplateData = {
    name: params.name,
    action: params.action,
    points: params.points,
  };

  return enqueueEmailJob({
    template: "claim_approved",
    to: params.to,
    data,
    title: "Giveaway points approved",
    userId: params.userId ?? null,
  });
}
