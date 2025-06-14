// —————————————————————————————————————————
// EmailRequest declaration
// —————————————————————————————————————————

export interface EmailRequest {
  /** list of recipient email addresses */
  recipient: string;
  /** optional display name of the sender */
  name?: string;
  /** the body of the message */
  message: string;
  /** optional LinkedIn URL */
  LinkedIn?: string;
  /** key to pick the “from” address from your senders map */
  fromKey: keyof typeof import("../utils/senders").senders;
  /** (optional) SendGrid dynamic template to use */
  templateId?: string;
}
