"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { RefreshCw, Sparkles, X, GripVertical } from "lucide-react";
import type { ExercisePoolItem } from "@/lib/exercise-library";
import { cn } from "@/lib/utils";

interface ExerciseSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: ExercisePoolItem;
  dayName: string;
  exerciseIndex: number;
  onShuffle: () => Promise<ExercisePoolItem | null>;
  onAiReplace: () => Promise<void>;
  onReorder?: (direction: "up" | "down") => Promise<void>;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  disabled?: boolean;
}

export function ExerciseSwapModal({
  open,
  onOpenChange,
  exercise,
  dayName,
  exerciseIndex,
  onShuffle,
  onAiReplace,
  onReorder,
  canMoveUp,
  canMoveDown,
  disabled = false,
}: ExerciseSwapModalProps) {
  const [loading, setLoading] = useState<"shuffle" | "ai" | null>(null);
  const busy = disabled || loading !== null;

  const handleShuffle = async () => {
    if (busy) return;
    setLoading("shuffle");
    try {
      await onShuffle();
      onOpenChange(false);
    } finally {
      setLoading(null);
    }
  };

  const handleAi = async () => {
    if (busy) return;
    setLoading("ai");
    try {
      await onAiReplace();
      onOpenChange(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "bg-[#0c0c0e] border border-white/10 p-6 shadow-2xl focus:outline-none"
          )}
        >
          <Dialog.Close
            type="button"
            className="absolute right-4 top-4 w-9 h-9 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Dialog.Close>

          <SwapModalHeader exercise={exercise} dayName={dayName} exerciseIndex={exerciseIndex} />

          <div className="space-y-3">
            <button
              type="button"
              disabled={busy}
              onClick={handleShuffle}
              className="w-full flex items-center gap-3 p-4 border border-white/10 hover:border-[#eb0000]/40 hover:bg-[#eb0000]/5 transition-all text-left disabled:opacity-50"
            >
              <RefreshCw className={cn("w-5 h-5 text-[#eb0000]", loading === "shuffle" && "animate-spin")} />
              <div>
                <p className="text-white text-sm font-bold">Shuffle from library</p>
                <p className="text-[#96979c] text-xs">Another exercise from the same muscle group</p>
              </div>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={handleAi}
              className="w-full flex items-center gap-3 p-4 border border-[#eb0000]/30 bg-[#eb0000]/5 hover:bg-[#eb0000]/10 transition-all text-left disabled:opacity-50"
            >
              <Sparkles className={cn("w-5 h-5 text-[#eb0000]", loading === "ai" && "animate-pulse")} />
              <div>
                <p className="text-white text-sm font-bold">Replace with AI suggestion</p>
                <p className="text-[#96979c] text-xs">Saves AI plan and updates your weekly split</p>
              </div>
            </button>

            {onReorder && (
              <SwapReorderRow
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                busy={busy}
                onReorder={onReorder}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SwapModalHeader({
  exercise,
  dayName,
  exerciseIndex,
}: {
  exercise: ExercisePoolItem;
  dayName: string;
  exerciseIndex: number;
}) {
  return (
    <div className="pr-10 mb-4">
      <Dialog.Title className="text-white font-black text-lg uppercase tracking-tight font-heading">
        Swap Exercise
      </Dialog.Title>
      <p className="text-white text-sm font-bold mt-1 truncate">{exercise.name}</p>
      <Dialog.Description className="text-[#96979c] text-xs mt-0.5">
        {dayName} · Exercise {exerciseIndex + 1}
      </Dialog.Description>
    </div>
  );
}

function SwapReorderRow({
  canMoveUp,
  canMoveDown,
  busy,
  onReorder,
}: {
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  busy?: boolean;
  onReorder: (direction: "up" | "down") => Promise<void>;
}) {
  return (
    <div className="flex gap-2 pt-2 border-t border-white/5">
      <button
        type="button"
        disabled={!canMoveUp || busy}
        onClick={() => !busy && onReorder("up")}
        className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white disabled:opacity-30"
      >
        <GripVertical className="w-4 h-4 rotate-90" /> Move up
      </button>
      <button
        type="button"
        disabled={!canMoveDown || busy}
        onClick={() => !busy && onReorder("down")}
        className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white disabled:opacity-30"
      >
        <GripVertical className="w-4 h-4 -rotate-90" /> Move down
      </button>
    </div>
  );
}
