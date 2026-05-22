import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Settings",
  description: "Manage your RahulFitzz profile settings.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
