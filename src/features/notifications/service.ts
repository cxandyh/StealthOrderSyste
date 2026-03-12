"use server";

import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEntityType,
  NotificationEventType,
} from "@/generated/prisma/client";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { titleize } from "@/lib/format";

type StatusEmailInput = {
  buildId: string;
  customerEmail: string | null;
  customerName: string;
  dealerId: string;
  model: string;
  orderNumber: string;
  portalToken: string | null;
  previousStatus: string;
  status: string;
};

export async function notifyCustomerStatusChanged(input: StatusEmailInput) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const portalUrl = input.portalToken ? `${appUrl}/portal/${input.portalToken}` : null;

  if (!input.customerEmail || !portalUrl) {
    await db.notificationEvent.create({
      data: {
        dealerId: input.dealerId,
        eventType: NotificationEventType.CUSTOMER_STATUS_CHANGED,
        entityType: NotificationEntityType.KAYAK_BUILD,
        entityId: input.buildId,
        recipientEmail: input.customerEmail,
        channel: NotificationChannel.EMAIL,
        status: NotificationDeliveryStatus.SKIPPED,
        payloadJson: {
          portalUrl,
          previousStatus: input.previousStatus,
          status: input.status,
        },
      },
    });
    return;
  }

  const subject = `${input.model} update: ${titleize(input.status)}`;
  const text = [
    `Hi ${input.customerName},`,
    "",
    `Your Stealth kayak build on order ${input.orderNumber} has moved from ${titleize(input.previousStatus)} to ${titleize(input.status)}.`,
    `Check your live build portal here: ${portalUrl}`,
    "",
    "Stealth Order Hub",
  ].join("\n");
  const html = `
    <div style="font-family: Arial, sans-serif; color: #171717; line-height: 1.6;">
      <p>Hi ${input.customerName},</p>
      <p>Your Stealth kayak build on order <strong>${input.orderNumber}</strong> has moved from <strong>${titleize(input.previousStatus)}</strong> to <strong>${titleize(input.status)}</strong>.</p>
      <p><a href="${portalUrl}">View your live build portal</a></p>
      <p>Stealth Order Hub</p>
    </div>
  `;

  try {
    await sendEmail({
      html,
      subject,
      text,
      to: input.customerEmail,
    });

    await db.notificationEvent.create({
      data: {
        dealerId: input.dealerId,
        eventType: NotificationEventType.CUSTOMER_STATUS_CHANGED,
        entityType: NotificationEntityType.KAYAK_BUILD,
        entityId: input.buildId,
        recipientEmail: input.customerEmail,
        channel: NotificationChannel.EMAIL,
        status: process.env.RESEND_API_KEY
          ? NotificationDeliveryStatus.SENT
          : NotificationDeliveryStatus.SKIPPED,
        sentAt: process.env.RESEND_API_KEY ? new Date() : null,
        payloadJson: {
          portalUrl,
          previousStatus: input.previousStatus,
          status: input.status,
        },
      },
    });
  } catch (error) {
    await db.notificationEvent.create({
      data: {
        dealerId: input.dealerId,
        eventType: NotificationEventType.CUSTOMER_STATUS_CHANGED,
        entityType: NotificationEntityType.KAYAK_BUILD,
        entityId: input.buildId,
        recipientEmail: input.customerEmail,
        channel: NotificationChannel.EMAIL,
        status: NotificationDeliveryStatus.FAILED,
        payloadJson: {
          error: error instanceof Error ? error.message : "Unknown email error",
          portalUrl,
          previousStatus: input.previousStatus,
          status: input.status,
        },
      },
    });
  }
}
