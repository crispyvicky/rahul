/** Client-safe helper for admin redemption contact chips. */

export type RedemptionContactRow = {
  contact_phone?: string | null;
  contact_instagram?: string | null;
  user_profiles?: {
    instagram_handle?: string | null;
    phone?: string | null;
  } | null;
};

export function getRedemptionContactDisplay(alert: RedemptionContactRow) {
  const instagram = (
    alert.contact_instagram ||
    alert.user_profiles?.instagram_handle ||
    ""
  )
    .trim()
    .replace(/^@+/, "");
  const phone = (alert.contact_phone || alert.user_profiles?.phone || "").trim();
  return { instagram, phone };
}
