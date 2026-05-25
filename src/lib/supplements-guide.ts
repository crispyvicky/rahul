/**
 * Evidence-informed supplement guide (general wellness / fitness education).
 * Not medical advice — users should consult a doctor before starting anything new.
 */

export type SupplementGoalId =
  | "muscle_gain"
  | "fat_loss"
  | "hair_growth"
  | "gut_health"
  | "energy"
  | "joint_recovery"
  | "general_health"
  | "skin_health"
  | "sleep_recovery";

export type DietPref = "any" | "veg" | "vegan";

export type SupplementGuideInput = {
  goals: SupplementGoalId[];
  diet: DietPref;
  trainsRegularly: boolean;
  ageGroup: "under18" | "18-35" | "36-50" | "50plus";
};

export type SupplementEntry = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  what: string;
  who: string;
  when: string;
  how: string;
  cautions: string;
  goals: SupplementGoalId[];
  priority: Partial<Record<SupplementGoalId, number>>;
  vegFriendly: boolean;
  avoidUnder18?: boolean;
};

export const SUPPLEMENT_GOALS: {
  id: SupplementGoalId;
  label: string;
  description: string;
}[] = [
  {
    id: "muscle_gain",
    label: "Muscle & strength",
    description: "Hypertrophy, gym performance, recovery",
  },
  {
    id: "fat_loss",
    label: "Fat loss",
    description: "Cutting, metabolism, appetite control",
  },
  {
    id: "hair_growth",
    label: "Hair health",
    description: "Thickness, shedding, scalp support",
  },
  {
    id: "gut_health",
    label: "Gut health",
    description: "Digestion, bloating, regularity",
  },
  {
    id: "energy",
    label: "Energy & focus",
    description: "Training drive, fatigue, alertness",
  },
  {
    id: "joint_recovery",
    label: "Joints & recovery",
    description: "Mobility, soreness, long-term joint care",
  },
  {
    id: "general_health",
    label: "General health",
    description: "Daily baseline for active Indians",
  },
  {
    id: "skin_health",
    label: "Skin health",
    description: "Glow, hydration from inside",
  },
  {
    id: "sleep_recovery",
    label: "Sleep & recovery",
    description: "Rest, cortisol, night routine",
  },
];

export const SUPPLEMENTS: SupplementEntry[] = [
  {
    id: "whey",
    name: "Whey protein",
    emoji: "🥛",
    category: "Protein",
    what: "Fast-digesting milk protein with high leucine — helps hit daily protein for muscle repair.",
    who: "Anyone struggling to reach 1.6–2.2 g/kg protein from food alone; post-workout users.",
    when: "After training or between meals when whole food protein is low.",
    how: "1 scoop (20–30 g protein) in water/milk; adjust to your daily protein target. Food first — whey is a top-up.",
    cautions: "Skip if dairy allergic. Lactose-sensitive: try isolate. Not a meal replacement.",
    goals: ["muscle_gain", "fat_loss", "energy", "general_health"],
    priority: { muscle_gain: 10, fat_loss: 7, energy: 5, general_health: 4 },
    vegFriendly: true,
  },
  {
    id: "creatine",
    name: "Creatine monohydrate",
    emoji: "⚡",
    category: "Performance",
    what: "Most studied ergogenic — supports strength, power, and lean mass when paired with training.",
    who: "Gym-goers doing resistance training 3+ days/week; vegetarians often benefit more (lower baseline creatine).",
    when: "Any time daily — consistency matters more than timing.",
    how: "3–5 g/day monohydrate powder. Mix in water. Optional 5-day load (20 g/day) then 3–5 g — not required.",
    cautions: "Drink extra water. May cause brief water weight. Avoid if kidney disease — ask your doctor.",
    goals: ["muscle_gain", "energy", "general_health"],
    priority: { muscle_gain: 10, energy: 6, general_health: 5 },
    vegFriendly: true,
  },
  {
    id: "fish_oil",
    name: "Fish oil (Omega-3)",
    emoji: "🐟",
    category: "Essential fats",
    what: "EPA/DHA support heart health, inflammation balance, and joint comfort.",
    who: "People eating little fatty fish; joint soreness; general cardiovascular wellness.",
    when: "With a main meal (fat improves absorption).",
    how: "Roughly 1–2 g combined EPA+DHA daily from label (often 2–3 capsules). Choose third-party tested brands.",
    cautions: "Blood thinners: check with doctor. Vegans: use algae omega-3 instead.",
    goals: ["joint_recovery", "general_health", "skin_health", "hair_growth"],
    priority: { joint_recovery: 9, general_health: 8, skin_health: 6, hair_growth: 5 },
    vegFriendly: false,
  },
  {
    id: "algae_omega",
    name: "Algae Omega-3 (vegan)",
    emoji: "🌿",
    category: "Essential fats",
    what: "Plant-based EPA/DHA — same role as fish oil without animal products.",
    who: "Vegetarians/vegans; fish allergy.",
    when: "With lunch or dinner.",
    how: "Follow label for ~1 g EPA+DHA total daily. Store cool, away from heat.",
    cautions: "Usually pricier than fish oil. Quality varies — pick tested brands.",
    goals: ["joint_recovery", "general_health", "skin_health"],
    priority: { joint_recovery: 8, general_health: 7, skin_health: 5 },
    vegFriendly: true,
  },
  {
    id: "multivitamin",
    name: "Multivitamin",
    emoji: "💊",
    category: "Micronutrients",
    what: "Fills small gaps in vitamins/minerals when diet is inconsistent — not a fix for bad nutrition.",
    who: "Busy athletes, restrictive diets, frequent travel, low vegetable intake.",
    when: "Morning with breakfast.",
    how: "1 serving of a reputable men's/women's or general multi. Don't double-dose.",
    cautions: "More is not better — avoid mega-doses. Separate high-dose zinc/iron unless prescribed.",
    goals: ["general_health", "energy", "hair_growth", "skin_health"],
    priority: { general_health: 8, energy: 5, hair_growth: 4, skin_health: 4 },
    vegFriendly: true,
  },
  {
    id: "vitamin_d",
    name: "Vitamin D3",
    emoji: "☀️",
    category: "Micronutrients",
    what: "Supports bone health, immunity, mood, and hormones — many Indians are deficient despite sun.",
    who: "Office workers, low sun exposure, darker skin in low-sun seasons, blood test showing low D.",
    when: "Morning with fat-containing meal.",
    how: "1000–2000 IU/day common; higher only if doctor confirms deficiency. Recheck levels after 8–12 weeks.",
    cautions: "Fat-soluble — avoid huge doses without labs. Pair with doctor if on medications.",
    goals: ["general_health", "muscle_gain", "hair_growth", "sleep_recovery"],
    priority: { general_health: 9, muscle_gain: 5, hair_growth: 6, sleep_recovery: 4 },
    vegFriendly: true,
  },
  {
    id: "zinc",
    name: "Zinc",
    emoji: "✨",
    category: "Minerals",
    what: "Mineral needed for immunity, testosterone support pathways, and hair tissue cycling.",
    who: "Low zinc intake (little meat/nuts), shedding hair with confirmed low zinc, acne-prone athletes.",
    when: "Evening with food — empty stomach can cause nausea.",
    how: "15–30 mg elemental zinc daily from label; don't exceed 40 mg long-term without supervision.",
    cautions: "High zinc blocks copper — use balanced formula or cycle. Can upset stomach.",
    goals: ["hair_growth", "skin_health", "general_health"],
    priority: { hair_growth: 8, skin_health: 6, general_health: 5 },
    vegFriendly: true,
  },
  {
    id: "biotin",
    name: "Biotin (B7)",
    emoji: "💇",
    category: "Vitamins",
    what: "Supports keratin infrastructure — helps when diet is low in biotin-rich foods.",
    who: "Hair thinning with poor diet; brittle nails (secondary benefit). Not a miracle for genetic hair loss.",
    when: "Morning with breakfast.",
    how: "2.5–5 mg/day typical in hair formulas. Give 3+ months before judging.",
    cautions: "Can skew some lab tests (thyroid/heart) — tell your doctor before blood work.",
    goals: ["hair_growth", "skin_health"],
    priority: { hair_growth: 7, skin_health: 5 },
    vegFriendly: true,
  },
  {
    id: "probiotic",
    name: "Probiotics",
    emoji: "🦠",
    category: "Gut",
    what: "Live beneficial bacteria strains that may improve digestion, bloating, and gut consistency.",
    who: "Antibiotic recovery, bloating, irregular digestion, high processed-food diets.",
    when: "Morning or night — pick one time and stay consistent.",
    how: "Follow CFU/strain on label (Lactobacillus + Bifidobacterium common). Refrigerate if label says so.",
    cautions: "Start low if bloating increases. Immunocompromised: ask doctor first.",
    goals: ["gut_health", "general_health", "skin_health"],
    priority: { gut_health: 10, general_health: 5, skin_health: 4 },
    vegFriendly: true,
  },
  {
    id: "fiber",
    name: "Psyllium husk (fiber)",
    emoji: "🌾",
    category: "Gut",
    what: "Soluble fiber adds bulk, supports regular bowel movements, and helps satiety during fat loss.",
    who: "Low vegetable intake, constipation, high-protein diets needing fiber balance.",
    when: "Between meals with a full glass of water — not right before training.",
    how: "Start 1 tsp in water, build to 1 tbsp. Minimum 250 ml water per serving.",
    cautions: "Take 2 h away from medicines — can affect absorption. Choking risk if not enough water.",
    goals: ["gut_health", "fat_loss"],
    priority: { gut_health: 9, fat_loss: 6 },
    vegFriendly: true,
  },
  {
    id: "collagen",
    name: "Collagen peptides",
    emoji: "🦴",
    category: "Recovery",
    what: "Hydrolyzed collagen supports connective tissue, skin elasticity, and joint comfort over time.",
    who: "Joint niggles, skin hydration focus, older athletes, high impact sports.",
    when: "Any time — often post-workout or night.",
    how: "10–15 g collagen peptides daily in coffee/water. Needs weeks for noticeable effects.",
    cautions: "Not vegetarian (marine/bovine source). Not a complete protein for muscle.",
    goals: ["joint_recovery", "skin_health", "hair_growth"],
    priority: { joint_recovery: 7, skin_health: 7, hair_growth: 4 },
    vegFriendly: false,
  },
  {
    id: "caffeine",
    name: "Caffeine (pre-workout)",
    emoji: "☕",
    category: "Performance",
    what: "Stimulant that boosts alertness, endurance, and perceived effort — cheap effective ergogenic.",
    who: "Low-energy training days; experienced users tolerating stimulants.",
    when: "30–45 min before workout. Cut off by 2 pm if sleep suffers.",
    how: "100–200 mg caffeine (coffee or pill). Count tea/coffee already consumed.",
    cautions: "Anxiety, palpitations, sleep issues — reduce dose. Under 18: avoid high stimulants.",
    goals: ["energy", "fat_loss"],
    priority: { energy: 9, fat_loss: 5 },
    vegFriendly: true,
    avoidUnder18: true,
  },
  {
    id: "electrolytes",
    name: "Electrolytes",
    emoji: "💧",
    category: "Hydration",
    what: "Sodium, potassium, magnesium mix prevents cramps and brain fog in heavy sweaters / long sessions.",
    who: "Hyderabad heat training, 60+ min sessions, low-carb diets, cramping.",
    when: "During or after sweaty workouts; hot weather days.",
    how: "1 serving in 500–750 ml water. Don't over-salt sedentary days.",
    cautions: "High blood pressure: monitor sodium. Kidney issues: ask doctor.",
    goals: ["energy", "general_health", "muscle_gain"],
    priority: { energy: 7, general_health: 6, muscle_gain: 4 },
    vegFriendly: true,
  },
  {
    id: "magnesium",
    name: "Magnesium (glycinate)",
    emoji: "🌙",
    category: "Recovery",
    what: "Supports sleep quality, muscle relaxation, and nerve function — common gap in athletes.",
    who: "Poor sleep, night cramps, high stress, heavy training blocks.",
    when: "30–60 min before bed.",
    how: "200–400 mg elemental magnesium from glycinate/citrate label. Start low to test tolerance.",
    cautions: "Citrate can loosen stools. Kidney disease: medical guidance required.",
    goals: ["sleep_recovery", "joint_recovery", "general_health"],
    priority: { sleep_recovery: 9, joint_recovery: 5, general_health: 6 },
    vegFriendly: true,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    emoji: "🧘",
    category: "Adaptogen",
    what: "Ayurvedic adaptogen studied for stress, cortisol, and recovery — popular in Indian fitness circles.",
    who: "High stress, poor sleep, overreaching training phases (not for acute pregnancy).",
    when: "Evening with food or post-dinner.",
    how: "300–600 mg standardized root extract daily for 8+ weeks. Pause if thyroid meds — ask doctor.",
    cautions: "Thyroid/autoimmune meds: consult doctor. May cause drowsiness — adjust timing.",
    goals: ["sleep_recovery", "general_health", "muscle_gain"],
    priority: { sleep_recovery: 7, general_health: 5, muscle_gain: 4 },
    vegFriendly: true,
  },
  {
    id: "b12",
    name: "Vitamin B12",
    emoji: "🔋",
    category: "Vitamins",
    what: "Critical for energy metabolism and nerves — vegetarians/vegans often need supplementation.",
    who: "Pure veg/vegan diets, low dairy/eggs, fatigue with low B12 labs.",
    when: "Morning with breakfast.",
    how: "250–1000 mcg cyanocobalamin or methylcobalamin daily, or weekly higher per doctor.",
    cautions: "Confirm deficiency if possible. Part of most multis — don't double blindly.",
    goals: ["energy", "general_health", "hair_growth"],
    priority: { energy: 8, general_health: 7, hair_growth: 4 },
    vegFriendly: true,
  },
  {
    id: "iron",
    name: "Iron (only if deficient)",
    emoji: "🩸",
    category: "Minerals",
    what: "Rebuilds hemoglobin — low iron causes fatigue, weak training, hair shedding in women.",
    who: "Only with blood tests showing low ferritin/hemoglobin — especially menstruating women.",
    when: "Empty stomach if tolerated; else with vitamin C, away from tea/coffee/calcium.",
    how: "Doctor-prescribed dose only — self-dosing iron is risky.",
    cautions: "Never take blindly — iron overload harms liver. Test first.",
    goals: ["energy", "hair_growth", "general_health"],
    priority: { energy: 6, hair_growth: 5, general_health: 4 },
    vegFriendly: true,
  },
];

export function getRecommendations(input: SupplementGuideInput): {
  primary: SupplementEntry[];
  alsoConsider: SupplementEntry[];
  stackSummary: string;
} {
  const goals = input.goals.length ? input.goals : (["general_health"] as SupplementGoalId[]);

  const scored = SUPPLEMENTS.map((s) => {
    let score = 0;
    for (const g of goals) {
      score += s.priority[g] ?? (s.goals.includes(g) ? 3 : 0);
    }
    if (input.diet === "veg" || input.diet === "vegan") {
      if (!s.vegFriendly) score -= 20;
      if (s.id === "algae_omega") score += 4;
      if (s.id === "b12" && input.diet === "vegan") score += 3;
    }
    if (!input.trainsRegularly) {
      if (s.id === "creatine" || s.id === "caffeine" || s.id === "whey") score -= 4;
    }
    if (input.ageGroup === "under18" && s.avoidUnder18) score -= 30;
    return { supplement: s, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = scored.slice(0, 5).map((x) => x.supplement);
  const alsoConsider = scored.slice(5, 9).map((x) => x.supplement);

  const goalLabels = goals
    .map((g) => SUPPLEMENT_GOALS.find((x) => x.id === g)?.label)
    .filter(Boolean)
    .join(", ");

  const stackSummary = `Stack tuned for: ${goalLabels}. ${
    input.diet !== "any" ? `Diet: ${input.diet}. ` : ""
  }${input.trainsRegularly ? "Training-aware picks prioritized. " : "Recovery & health basics prioritized. "}
Food and sleep come first — supplements only fill gaps.`;

  return { primary, alsoConsider, stackSummary };
}
