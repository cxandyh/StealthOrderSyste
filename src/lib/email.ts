import { Resend } from "resend";

type EmailMessage = {
  html: string;
  subject: string;
  text: string;
  to: string;
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

export async function sendEmail(message: EmailMessage) {
  const client = getResendClient();
  const from = process.env.EMAIL_FROM;

  if (!client || !from) {
    return {
      delivered: false,
      reason: "Email provider not configured.",
    };
  }

  await client.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return {
    delivered: true,
  };
}
