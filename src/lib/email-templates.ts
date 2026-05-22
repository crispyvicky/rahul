import { escapeHtml } from "./mailer";

export type EmailTemplateId =
  | "claim_approved"
  | "gym_prebook_internal"
  | "gym_prebook_user"
  | "waitlist_internal"
  | "waitlist_user"
  | "collab_internal"
  | "collab_user";

export type EmailTemplateData = Record<string, string | number | null | undefined>;

export function renderEmailTemplate(
  template: EmailTemplateId,
  data: EmailTemplateData
): { subject: string; html: string; text: string; fromBrand?: boolean } {
  switch (template) {
    case "claim_approved":
      return renderClaimApproved(data);
    case "gym_prebook_internal":
      return renderGymPrebookInternal(data);
    case "gym_prebook_user":
      return renderGymPrebookUser(data);
    case "waitlist_internal":
      return renderWaitlistInternal(data);
    case "waitlist_user":
      return renderWaitlistUser(data);
    case "collab_internal":
      return renderCollabInternal(data);
    case "collab_user":
      return renderCollabUser(data);
    default: {
      const _exhaustive: never = template;
      throw new Error(`Unknown email template: ${_exhaustive}`);
    }
  }
}

function renderClaimApproved(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? "Athlete"));
  const action = String(data.action ?? "");
  const points = Number(data.points ?? 0);
  const actionLabel =
    action === "follow"
      ? "Instagram follow"
      : action === "share_story"
        ? "Instagram story share"
        : escapeHtml(action);

  return {
    fromBrand: true,
    subject: `+${points} giveaway points approved`,
    text: `Your ${actionLabel} claim was approved. +${points} giveaway points.`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:32px;">
        <h1 style="color:#eb0000;text-transform:uppercase;">Points approved</h1>
        <p>Hey ${name},</p>
        <p>Your <strong>${actionLabel}</strong> claim was approved.</p>
        <p style="font-size:24px;font-weight:bold;color:#eb0000;">+${points} points</p>
        <p>Check your rank on the Giveaways page in the app.</p>
        <p style="color:#888;font-size:12px;">RahulFitzz · Keep grinding</p>
      </div>
    `,
  };
}

function renderGymPrebookInternal(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? ""));
  const email = escapeHtml(String(data.email ?? ""));
  const phone = escapeHtml(String(data.phone ?? "—"));
  const city = escapeHtml(String(data.city ?? "—"));
  const notes = escapeHtml(String(data.notes ?? "—"));
  const source = escapeHtml(String(data.source ?? ""));

  return {
    subject: `[GYM PRE-BOOK] ${name}`,
    text: `New gym pre-booking\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city}\nNotes: ${notes}\nSource: ${source}`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:24px;">
        <h2 style="color:#eb0000;margin:0 0 16px;">New gym pre-booking</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#eb0000">${email}</a></p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Notes:</strong> ${notes}</p>
        <p><strong>Source:</strong> ${source}</p>
      </div>
    `,
  };
}

function renderGymPrebookUser(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? ""));
  const email = escapeHtml(String(data.email ?? ""));

  return {
    fromBrand: true,
    subject: "You're on the list — RahulFitzz Gym Pre-Booking",
    text: `Hi ${name},\n\nThank you for pre-booking your spot at the upcoming RahulFitzz training hub.\n\nWe'll email you at ${email} before we open.\n\nRAHULFITZZ`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:40px 20px;background:#050505;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;">
          <h1 style="color:#eb0000;font-size:22px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Pre-booking confirmed</h1>
          <p style="color:#96979c;font-size:13px;margin:0 0 28px;">RahulFitzz Official Training Hub — opening later this year</p>
          <div style="background:#0a0a0a;border:1px solid #1a1a1a;padding:32px;">
            <p style="font-size:16px;line-height:1.7;color:#dcdcdc;margin-top:0;">Hi <strong>${name}</strong>,</p>
            <p style="font-size:16px;line-height:1.7;color:#96979c;">Thank you for <strong style="color:#fff;">pre-booking</strong> your spot. You're officially on the founding list.</p>
            <p style="font-size:16px;line-height:1.7;color:#96979c;margin-bottom:0;">We'll reach out at <strong style="color:#fff;">${email}</strong> before we open.</p>
          </div>
          <p style="text-align:center;margin-top:32px;font-size:11px;color:#666;letter-spacing:4px;text-transform:uppercase;">RahulFitzz</p>
        </div>
      </body>
      </html>
    `,
  };
}

function renderWaitlistInternal(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? ""));
  const email = escapeHtml(String(data.email ?? ""));

  return {
    subject: `[WAITLIST ACTIVATION] - ${name}`,
    text: `WAITLIST ENTRY\n\nName: ${name}\nEmail: ${email}`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:24px;">
        <h2 style="color:#eb0000;">Waitlist activation</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#eb0000">${email}</a></p>
      </div>
    `,
  };
}

function renderWaitlistUser(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? ""));

  return {
    fromBrand: true,
    subject: "Status Confirmed | RahulFitzz Waitlist",
    text: `Hi ${name},\n\nYou have been added to the exclusive launch waitlist.\n\nRAHULFITZZ`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:32px;">
        <h1 style="color:#eb0000;text-transform:uppercase;">Status confirmed</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p style="color:#96979c;">Your position on the exclusive launch waitlist is secured.</p>
        <p style="color:#888;font-size:12px;">RahulFitzz · The Evolution Edge</p>
      </div>
    `,
  };
}

function renderCollabInternal(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? ""));
  const email = escapeHtml(String(data.email ?? ""));
  const brand = escapeHtml(String(data.brand ?? ""));
  const message = escapeHtml(String(data.message ?? ""));

  return {
    subject: `[NEW PARTNERSHIP LEAD] - ${brand}`,
    text: `Partner: ${name}\nEmail: ${email}\nBrand: ${brand}\n\n${message}`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:24px;">
        <h2 style="color:#eb0000;">New partnership lead</h2>
        <p><strong>Contact:</strong> ${name}</p>
        <p><strong>Brand:</strong> ${brand}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#eb0000">${email}</a></p>
        <p style="white-space:pre-wrap;color:#dcdcdc;">${message}</p>
      </div>
    `,
  };
}

function renderCollabUser(data: EmailTemplateData) {
  const name = escapeHtml(String(data.name ?? ""));
  const brand = escapeHtml(String(data.brand ?? ""));

  return {
    fromBrand: true,
    subject: "Transmission Received | RahulFitzz Select",
    text: `Hi ${name},\n\nWe received your partnership brief for ${brand}.\n\nRAHULFITZZ`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:32px;">
        <h1 style="color:#eb0000;text-transform:uppercase;">Mission received</h1>
        <p>Hello <strong>${name}</strong>,</p>
        <p style="color:#96979c;">We received the partnership brief for <strong>${brand}</strong>. Our team will review alignment and reach out if there is a fit.</p>
        <p style="color:#888;font-size:12px;">RahulFitzz · The Evolution Edge</p>
      </div>
    `,
  };
}
