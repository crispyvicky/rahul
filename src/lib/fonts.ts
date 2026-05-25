import { Orbitron, Space_Grotesk } from "next/font/google";

/** Self-hosted via next/font — no render-blocking Google Fonts CSS. */
export const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
  preload: true,
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
});

export const fontClassNames = `${orbitron.variable} ${spaceGrotesk.variable}`;
