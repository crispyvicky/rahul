import { cn } from "@/lib/utils";

const variantStyles = {
  footer: "text-[10px] tracking-[0.35em] text-white/30",
  app: "text-[10px] tracking-[0.35em] text-white/25 py-6 border-t border-white/5",
  minimal: "text-[9px] tracking-[0.32em] text-white/25",
  sidebar: "text-[8px] tracking-[0.28em] text-white/20 text-left",
} as const;

type BravooCreditVariant = keyof typeof variantStyles;

export function BravooCredit({
  variant = "footer",
  className,
}: {
  variant?: BravooCreditVariant;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "uppercase",
        variant === "sidebar" ? "text-left" : "text-center",
        variantStyles[variant],
        className
      )}
    >
      <a
        href="https://bravoo.in"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/45 hover:text-white font-semibold no-underline transition-colors duration-300"
      >
        BRAVOO
      </a>
    </p>
  );
}
