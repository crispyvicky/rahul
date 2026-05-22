import { readFileSync, writeFileSync } from "fs";

const p = "src/app/gym-mode/page.tsx";
const c = readFileSync(p, "utf8");
const poolEnd = c.indexOf("export default function GymModePage");
const headerEnd = c.indexOf("// 7 Days");
const footer = c.slice(poolEnd);

const newHeader = `"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell, Plus, Minus, ChevronRight, Timer, CheckCircle, Volume2, RefreshCw, Trash2, Calendar, Sparkles, Trophy, Heart, Activity, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/use-user-store";
import {
  useGymPlanStore,
  DAYS_OF_WEEK,
  getDynamicWarmups,
  getDynamicCooldowns,
  generateExercises,
} from "@/store/use-gym-plan-store";
import type { ExercisePoolItem, DayPlan, SetLog } from "@/lib/gym-plan-types";
import { exercisePool } from "@/lib/exercise-library";
import { ExerciseSwapModal } from "@/components/gym/exercise-swap-modal";
import { saveAiPlan } from "@/lib/supabase-service";
import toast from "react-hot-toast";

const muscleGroups = [
  { id: "chest", label: "Chest", emoji: "🔥" },
  { id: "back", label: "Back", emoji: "💪" },
  { id: "shoulders", label: "Shoulders", emoji: "⚡" },
  { id: "legs", label: "Legs", emoji: "🦵" },
  { id: "arms", label: "Arms", emoji: "💪" },
  { id: "core", label: "Core", emoji: "🎯" },
];

`;

writeFileSync(p, newHeader + footer);
console.log("Updated", p);
