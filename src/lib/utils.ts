import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return "👑";
  if (streak >= 14) return "🔥";
  if (streak >= 7) return "⚡";
  if (streak >= 3) return "💪";
  return "🌱";
}

export function calculateLevel(xp: number): { level: number; progress: number; nextLevelXp: number } {
  const baseXp = 100;
  const multiplier = 1.5;
  let level = 1;
  let totalXpForLevel = baseXp;

  while (xp >= totalXpForLevel) {
    xp -= totalXpForLevel;
    level++;
    totalXpForLevel = Math.floor(baseXp * Math.pow(multiplier, level - 1));
  }

  return {
    level,
    progress: (xp / totalXpForLevel) * 100,
    nextLevelXp: totalXpForLevel,
  };
}
