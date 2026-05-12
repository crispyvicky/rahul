"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Dumbbell,
  Salad,
  Camera,
  Sparkles,
  Loader2,
  ChevronRight,
  Check,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useUserStore, DEMO_USER } from "@/store/use-user-store";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "workout", label: "Workout Plan", icon: Dumbbell },
  { id: "diet", label: "Diet Plan", icon: Salad },
  { id: "analyze", label: "Physique Scan", icon: Camera },
] as const;

// Mock generated workout plan
const mockWorkoutPlan = {
  title: "Hypertrophy Push/Pull/Legs — Week 1",
  days: [
    {
      day: "Monday",
      focus: "Push (Chest, Shoulders, Triceps)",
      exercises: [
        { name: "Flat Barbell Bench Press", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "75s" },
        { name: "Overhead Press (Standing)", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Lateral Raises", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Tricep Cable Pushdowns", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", rest: "60s" },
      ],
    },
    {
      day: "Tuesday",
      focus: "Pull (Back, Biceps)",
      exercises: [
        { name: "Barbell Rows", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Pull-ups / Lat Pulldowns", sets: 4, reps: "8-12", rest: "75s" },
        { name: "Seated Cable Rows", sets: 3, reps: "10-12", rest: "75s" },
        { name: "Face Pulls", sets: 3, reps: "15-20", rest: "60s" },
        { name: "Barbell Curls", sets: 3, reps: "10-12", rest: "60s" },
        { name: "Hammer Curls", sets: 3, reps: "12-15", rest: "60s" },
      ],
    },
    {
      day: "Wednesday",
      focus: "Legs (Quads, Hams, Glutes)",
      exercises: [
        { name: "Barbell Back Squats", sets: 4, reps: "6-8", rest: "120s" },
        { name: "Romanian Deadlifts", sets: 4, reps: "8-10", rest: "90s" },
        { name: "Leg Press", sets: 3, reps: "10-12", rest: "90s" },
        { name: "Walking Lunges", sets: 3, reps: "12/leg", rest: "75s" },
        { name: "Leg Curls", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Calf Raises", sets: 4, reps: "15-20", rest: "60s" },
      ],
    },
  ],
};

const mockDietPlan = {
  calories: 2400,
  protein: 180,
  carbs: 260,
  fats: 67,
  meals: [
    { time: "7:00 AM", name: "Breakfast", items: "4 egg whites + 2 whole eggs, oats (60g), banana, black coffee", cal: 480 },
    { time: "10:00 AM", name: "Snack", items: "Greek yogurt (200g), mixed nuts (30g), honey", cal: 280 },
    { time: "1:00 PM", name: "Lunch", items: "Chicken breast (200g), brown rice (100g), steamed broccoli, olive oil", cal: 550 },
    { time: "4:00 PM", name: "Pre-Workout", items: "Whey protein shake, banana, peanut butter (15g)", cal: 350 },
    { time: "7:00 PM", name: "Dinner", items: "Grilled salmon (180g), sweet potato, mixed salad, avocado (50g)", cal: 520 },
    { time: "9:30 PM", name: "Night", items: "Casein protein, almonds (20g)", cal: 220 },
  ],
};

export default function AICoachPage() {
  const [activeTab, setActiveTab] = useState<"workout" | "diet" | "analyze">("workout");
  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { user } = useUserStore();
  const currentUser = user || DEMO_USER;

  // Form State
  const [customData, setCustomData] = useState({
    weight: currentUser.onboardingData?.weight || 75,
    goal: currentUser.onboardingData?.goal || "muscle_gain",
    fitnessLevel: currentUser.onboardingData?.fitnessLevel || "intermediate",
    workoutLocation: "gym", // home or gym
  });
  
  // Real data state
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Download plan as a clean branded PDF
  const downloadPlanAsPDF = (title: string, content: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${title} — RahulFitzz</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #111; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #eb0000; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 900; color: #eb0000; text-transform: uppercase; letter-spacing: -1px; }
        .subtitle { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; }
        h1 { font-size: 20px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: -0.5px; }
        .day { margin-bottom: 18px; page-break-inside: avoid; }
        .day-title { font-size: 14px; font-weight: 800; background: #f5f5f5; padding: 8px 12px; border-left: 4px solid #eb0000; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        th { text-align: left; font-size: 10px; text-transform: uppercase; color: #888; padding: 4px 8px; border-bottom: 1px solid #ddd; }
        td { padding: 6px 8px; font-size: 12px; border-bottom: 1px solid #eee; }
        .meal { margin-bottom: 12px; padding: 10px 14px; border: 1px solid #eee; border-radius: 8px; }
        .meal-time { font-size: 11px; font-weight: 700; color: #eb0000; text-transform: uppercase; }
        .meal-food { font-size: 12px; margin-top: 4px; }
        .macros { display: flex; gap: 16px; margin-bottom: 20px; }
        .macro { text-align: center; padding: 12px 16px; background: #f9f9f9; border-radius: 8px; flex: 1; }
        .macro-val { font-size: 20px; font-weight: 900; }
        .macro-label { font-size: 10px; color: #888; text-transform: uppercase; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 12px; text-align: center; font-size: 10px; color: #aaa; }
      </style></head><body>
      <div class="header">
        <div><div class="brand">RahulFitzz</div><div class="subtitle">AI-Powered Fitness Ecosystem</div></div>
        <div style="text-align:right"><div style="font-size:11px;color:#888;">Generated: ${new Date().toLocaleDateString()}</div></div>
      </div>
      <h1>${title}</h1>
      ${content}
      <div class="footer">Generated by RahulFitzz AI Coach — rahulfitzz.com</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  const handleDownloadWorkout = () => {
    if (!workoutPlan) return;
    const days = workoutPlan.days || mockWorkoutPlan.days;
    const rows = days.map((d: any) => `
      <div class="day">
        <div class="day-title">${d.day} — ${d.title || d.focus || ""}</div>
        <table><tr><th>#</th><th>Exercise</th><th>Sets × Reps</th><th>Notes</th></tr>
        ${d.exercises.map((ex: any, i: number) => `<tr><td>${i+1}</td><td>${ex.name}</td><td>${ex.sets}×${ex.reps}</td><td>${ex.notes || ex.rest || ""}</td></tr>`).join("")}
        </table>
      </div>`).join("");
    downloadPlanAsPDF(workoutPlan.planName || "Workout Plan", rows);
  };

  const handleDownloadDiet = () => {
    if (!dietPlan) return;
    const meals = dietPlan.meals || mockDietPlan.meals;
    const macroHtml = `<div class="macros">
      <div class="macro"><div class="macro-val">${dietPlan.dailyCalories || mockDietPlan.calories}</div><div class="macro-label">Calories</div></div>
      <div class="macro"><div class="macro-val">${dietPlan.macros?.protein || mockDietPlan.protein + "g"}</div><div class="macro-label">Protein</div></div>
      <div class="macro"><div class="macro-val">${dietPlan.macros?.carbs || mockDietPlan.carbs + "g"}</div><div class="macro-label">Carbs</div></div>
      <div class="macro"><div class="macro-val">${dietPlan.macros?.fats || mockDietPlan.fats + "g"}</div><div class="macro-label">Fats</div></div>
    </div>`;
    const mealHtml = meals.map((m: any) => `
      <div class="meal">
        <div class="meal-time">${m.time} — ${m.name || ""}</div>
        <div class="meal-food">${Array.isArray(m.foods) ? m.foods.join(", ") : m.items}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">${m.calories || m.cal} cal</div>
      </div>`).join("");
    downloadPlanAsPDF(dietPlan.planName || "Personalized Diet Plan", macroHtml + mealHtml);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPlanGenerated(false);
    
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          userData: {
            ...currentUser.onboardingData,
            weight: customData.weight,
            goal: customData.goal,
            fitnessLevel: customData.fitnessLevel,
            workoutLocation: customData.workoutLocation,
            age: currentUser.onboardingData?.age || 25,
            height: currentUser.onboardingData?.height || 175,
            workoutDays: currentUser.onboardingData?.workoutDays || 4
          }
        })
      });
      
      const data = await res.json();
      
      if (activeTab === "workout") {
        setWorkoutPlan(data);
      } else if (activeTab === "diet") {
        setDietPlan(data);
      }
      setPlanGenerated(true);
    } catch (err) {
      console.error("AI Generation Error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "physique",
          userData: currentUser.onboardingData,
          photoData: uploadedImage // base64 string
        })
      });
      
      const data = await res.json();
      setAnalysisResult({
        bodyFat: data.estimatedBodyFat,
        muscleMass: "Analyzed", // Gemini provides more nuanced feedback
        weakAreas: data.weakAreas || [],
        strongAreas: data.strongAreas || [],
        suggestions: data.actionPlan || [data.feedback],
      });
    } catch (err) {
      console.error("Analysis Error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tighter font-heading">
          AI <span className="text-brand">Coach</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Personalized plans powered by artificial intelligence
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPlanGenerated(false); setAnalysisResult(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
              activeTab === tab.id
                ? "bg-brand text-white shadow-[0_0_20px_rgba(235,0,0,0.2)]"
                : "bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Customization Form */}
      {!isGenerating && !planGenerated && activeTab !== "analyze" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-card border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Customize Your Plan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Current Weight (kg)</label>
              <input 
                type="number" 
                value={customData.weight} 
                onChange={(e) => setCustomData({...customData, weight: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Primary Goal</label>
              <select 
                value={customData.goal}
                onChange={(e) => setCustomData({...customData, goal: e.target.value as any})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand focus:outline-none"
              >
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="maintain">Maintenance</option>
                <option value="endurance">Endurance & Core</option>
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Fitness Level</label>
              <select 
                value={customData.fitnessLevel}
                onChange={(e) => setCustomData({...customData, fitnessLevel: e.target.value as any})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 block">Workout Location</label>
              <select 
                value={customData.workoutLocation}
                onChange={(e) => setCustomData({...customData, workoutLocation: e.target.value})}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-brand focus:outline-none"
              >
                <option value="gym">Full Gym (Machines & Free Weights)</option>
                <option value="home">Home (Bodyweight & Dumbbells)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-4 px-5 py-4 bg-brand hover:bg-brand-dark text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(235,0,0,0.2)]"
          >
            <Sparkles className="w-5 h-5" />
            Generate {activeTab === "workout" ? "Workout" : "Diet"} Plan
          </button>
        </motion.div>
      )}

      {/* Generating animation */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-surface-card border border-brand/20 rounded-2xl p-8 sm:p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">AI is crafting your plan...</h3>
            <p className="text-text-secondary text-sm">
              Analyzing your profile and optimizing for {currentUser.onboardingData?.goal?.replace("_", " ")}
            </p>
            <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden max-w-xs mx-auto">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-full bg-brand rounded-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "workout" && planGenerated && workoutPlan && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest">
              {workoutPlan.planName || mockWorkoutPlan.title}
            </h2>
            <div className="flex gap-2">
              <button onClick={handleDownloadWorkout} className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDownloadWorkout} className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-colors">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {(workoutPlan.days || mockWorkoutPlan.days).map((day: any, i: number) => (
            <div key={day.day} className="bg-surface-card border border-white/5 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{day.day}</p>
                    <p className="text-text-secondary text-xs">{day.focus}</p>
                  </div>
                </div>
                <ChevronRight className={cn("w-4 h-4 text-text-muted transition-transform", expandedDay === i && "rotate-90")} />
              </button>

              <AnimatePresence>
                {expandedDay === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2">
                      {day.exercises.map((ex: any, j: number) => (
                        <div
                          key={j}
                          className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-text-muted text-xs font-mono w-5 shrink-0">{j + 1}</span>
                            <p className="text-white text-sm font-medium truncate">{ex.name}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-brand text-xs font-bold">{ex.sets}×{ex.reps}</span>
                            <span className="text-text-muted text-[10px] hidden sm:inline">{ex.rest}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      )}

      {/* Diet Plan Result */}
      {activeTab === "diet" && planGenerated && dietPlan && !isGenerating && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm uppercase tracking-widest">
              {dietPlan?.planName || "Personalized Diet Plan"}
            </h2>
            <div className="flex gap-2">
              <button onClick={handleDownloadDiet} className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Macro summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Calories", value: dietPlan.dailyCalories || `${mockDietPlan.calories}`, unit: "kcal", color: "text-brand" },
              { label: "Protein", value: dietPlan.macros?.protein || `${mockDietPlan.protein}g`, unit: "", color: "text-blue-400" },
              { label: "Carbs", value: dietPlan.macros?.carbs || `${mockDietPlan.carbs}g`, unit: "", color: "text-yellow-400" },
              { label: "Fats", value: dietPlan.macros?.fats || `${mockDietPlan.fats}g`, unit: "", color: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-black font-heading ${m.color}`}>{m.value}</p>
                <p className="text-text-muted text-xs uppercase tracking-widest mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Meals */}
          <div className="space-y-3">
            {(dietPlan.meals || mockDietPlan.meals).map((meal: any) => (
              <div key={meal.time} className="bg-surface-card border border-white/5 rounded-2xl p-4 sm:p-5 flex gap-4">
                <div className="text-center shrink-0">
                  <p className="text-brand text-xs font-bold">{meal.time}</p>
                  <p className="text-text-muted text-[10px] uppercase">{meal.name}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm leading-relaxed">{Array.isArray(meal.foods) ? meal.foods.join(", ") : meal.items}</p>
                </div>
                <div className="shrink-0">
                  <p className="text-text-secondary text-xs font-bold">{meal.calories || meal.cal} cal</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Physique Analyzer */}
      {activeTab === "analyze" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {!analysisResult && !isGenerating && (
            <div className="bg-surface-card border border-dashed border-white/10 rounded-2xl p-8 sm:p-12 text-center">
              <Camera className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">Upload Your Physique Photo</h3>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Our AI will estimate body fat %, muscle distribution, and give actionable suggestions
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(235,0,0,0.3)]">
                <Camera className="w-4 h-4" />
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setUploadedImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {uploadedImage && (
                <div className="mt-6">
                  <img src={uploadedImage} alt="Uploaded" className="w-40 h-40 object-cover rounded-2xl mx-auto border border-white/10" />
                  <button
                    onClick={handleAnalyze}
                    className="mt-4 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-4 h-4" /> Analyze Now
                  </button>
                </div>
              )}
            </div>
          )}

          {analysisResult && !isGenerating && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5 text-center">
                  <p className="text-brand text-3xl font-black font-heading">{analysisResult.bodyFat}%</p>
                  <p className="text-text-muted text-xs uppercase tracking-widest mt-1">Body Fat</p>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5 text-center">
                  <p className="text-emerald-400 text-xl font-black font-heading">{analysisResult.muscleMass}</p>
                  <p className="text-text-muted text-xs uppercase tracking-widest mt-1">Muscle Mass</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5">
                  <h4 className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Strong Areas 💪</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.strongAreas.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-surface-card border border-white/5 rounded-2xl p-5">
                  <h4 className="text-brand text-xs font-bold uppercase tracking-widest mb-3">Needs Work ⚡</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.weakAreas.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/20">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-surface-card border border-white/5 rounded-2xl p-5">
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-3">AI Suggestions</h4>
                <div className="space-y-3">
                  {analysisResult.suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <p className="text-text-secondary text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-brand/10 border border-brand/20 text-brand font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-brand/20 transition-all">
                  <Share2 className="w-4 h-4" /> Share Result
                </button>
                <button
                  onClick={() => { setAnalysisResult(null); setUploadedImage(null); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Re-analyze
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
