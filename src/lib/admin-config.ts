/**
 * Admin access configuration.
 * Set ADMIN_EMAILS in .env.local (comma-separated) or edit HARDCODED_ADMIN_EMAILS below.
 */
export const HARDCODED_ADMIN_EMAILS: string[] = [
  "YOUR_EMAIL@example.com", // Replace with your Google email
];

export function getAdminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (fromEnv?.length) return fromEnv;
  return HARDCODED_ADMIN_EMAILS.map((e) => e.trim().toLowerCase()).filter(
    (e) => e && !e.includes("YOUR_EMAIL")
  );
}

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "rahulfitzz_admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-before-demo";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}

export function verifyAdminCredentials(
  username: string | undefined,
  password: string | undefined
): boolean {
  if (!username || !password) return false;
  return (
    username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD
  );
}
