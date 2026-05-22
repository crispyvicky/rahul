import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getTransporter(): nodemailer.Transporter {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendMailMessage(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromBrand?: boolean;
}): Promise<void> {
  const user = process.env.SMTP_USER;
  if (!user) throw new Error("SMTP_USER is not set");

  const from = options.fromBrand
    ? `"RahulFitzz" <${user}>`
    : `"RahulFitzz Systems" <${user}>`;

  await getTransporter().sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
