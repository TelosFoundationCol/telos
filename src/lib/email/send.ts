import { render } from "@react-email/render";
import { resend } from "./client";
import { getEnv } from "@/lib/env";
import MagicLinkEmail from "./templates/magic-link";
import DonationReceivedEmail from "./templates/donation-received";
import DonationConfirmedEmail from "./templates/donation-confirmed";
import RfpOpenedEmail from "./templates/rfp-opened";

type Recipient = string | string[];

async function sendEmail(opts: {
  to: Recipient;
  subject: string;
  react: React.ReactElement;
}) {
  const env = getEnv();
  const html = await render(opts.react);
  const text = await render(opts.react, { plainText: true });
  try {
    const result = await resend().emails.send({
      from: env.RESEND_FROM,
      to: opts.to,
      subject: opts.subject,
      html,
      text,
    });
    return result;
  } catch (err) {
    console.error("[email] send failed", err);
    throw err;
  }
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  url: string;
  lang?: "es" | "en";
}) {
  return sendEmail({
    to: opts.to,
    subject: opts.lang === "en" ? "Sign in to Telos" : "Entra a Telos",
    react: MagicLinkEmail({ url: opts.url, lang: opts.lang ?? "es" }),
  });
}

export async function sendDonationReceivedEmail(opts: {
  to: string;
  reference: string;
  amount: string;
  donorName?: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Recibimos tu comprobante · ${opts.reference}`,
    react: DonationReceivedEmail(opts),
  });
}

export async function sendDonationConfirmedEmail(opts: {
  to: string;
  reference: string;
  amount: string;
  donorName?: string;
  ledgerUrl?: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Tu aporte está validado · ${opts.reference}`,
    react: DonationConfirmedEmail(opts),
  });
}

export async function sendRfpOpenedEmail(opts: {
  to: string;
  agencyName: string;
  smbName: string;
  smbCity: string;
  need: string;
  budget: string;
  deadlineDays: number;
  rfpUrl: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Nuevo RFP abierto · ${opts.smbName}`,
    react: RfpOpenedEmail(opts),
  });
}

/** Best-effort broadcast: sends in parallel, swallows individual failures. */
export async function broadcastRfpOpenedEmail(
  recipients: Array<{ to: string; agencyName: string }>,
  baseInfo: Omit<Parameters<typeof sendRfpOpenedEmail>[0], "to" | "agencyName">,
) {
  await Promise.allSettled(
    recipients.map((r) =>
      sendRfpOpenedEmail({ ...baseInfo, to: r.to, agencyName: r.agencyName }),
    ),
  );
}
