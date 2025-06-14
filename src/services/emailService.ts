// src/services/emailService.ts
import sgMail from "@sendgrid/mail";
import { senders } from "../utils/senders";
import type { EmailRequest } from "../types/email-request";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

/**
 * Send confirmation emails to each recipient and
 * a notification to the internal address.
 */
export async function sendEmails(data: EmailRequest) {
  const sender = senders[data.fromKey];
  const confirmationMsg = {
    to: data.recipient,
    from: {
      email: "no-reply@ritzshrivastav.com", // This must be your VERIFIED sender
      name: sender.split("|")[0], // This is what the user will see
    },
    reply_to: {
      email: sender.split("|")[1].trim(), // your real Gmail for replies
      name: sender.split("|")[0],
    },
    templateId: sender.split("|")[2].trim(),
    dynamic_template_data: {
      name: data.name ?? data.recipient.split("@")[0],
    },
  };
  const confirmationPromises = await sgMail.send(confirmationMsg);
  const notifyMsg = {
    to: sender.split("|")[1], // your real Gmail for replies
    from: {
      email: "no-reply@ritzshrivastav.com", // This must be your VERIFIED sender
      name: data.name ?? data.recipient.split("@")[0], // This is what the user will see
    },
    reply_to: {
      email: data.recipient, // your real Gmail for replies
      name: data.name ?? data.recipient.split("@")[0],
    },
    templateId: "d-a813783c82d748a993b9bb596c187c3f",
    dynamic_template_data: {
      name: data.name ?? data.recipient.split("@")[0].toUpperCase(),
      email: data.recipient,
      msg: data.message,
    },
  };

  const notificationPromise = await sgMail.send(notifyMsg);

  return Promise.all([...confirmationPromises, ...notificationPromise]);
}
