export interface ExercisePoolItem { name: string; targetSets: number; targetReps: string; tip: string; group: string; steps: string[]; }

// Warm-up database based on upper/lower day target
export const warmupPool: Record<string, ExercisePoolItem[]> = {
  upper: [
    {
      name: "Arm Circles & Rotator Cuff Circles",
      targetSets: 2,
      targetReps: "15 reps",
      tip: "Lubricate shoulder joints, increase blood flow to rotator cuffs.",
      group: "warmup",
      steps: [
        "Stand tall with feet shoulder-width apart.",
        "Extend arms straight out to the sides, parallel to the floor.",
        "Perform 15 small controlled forward circles, then reverse for 15 reps.",
        "Keep movements smooth and active to warm up the joint capsule."
      ]
    },
    {
      name: "Dynamic Scapular Push-ups",
      targetSets: 2,
      targetReps: "10-12 reps",
      tip: "Activate the serratus anterior and chest support muscles.",
      group: "warmup",
      steps: [
        "Get into a standard push-up plank position with straight arms.",
        "Without bending your elbows, lower your chest by squeezing your shoulder blades together.",
        "Push your chest away from the floor, rounding your upper back at the peak.",
        "Keep your core tight and do not let your hips sag."
      ]
    }
  ],
  lower: [
    {
      name: "Dynamic Bodyweight Squats",
      targetSets: 2,
      targetReps: "15 reps",
      tip: "Warm up quad, glutes, and knee/ankle mobility.",
      group: "warmup",
      steps: [
        "Stand with feet shoulder-width apart, toes pointing slightly out.",
        "Squat deep, driving your knees outward over your toes.",
        "Keep your chest proud and upper body upright.",
        "Stand up fully, squeezing your glutes at the top."
      ]
    },
    {
      name: "The World's Greatest Stretch",
      targetSets: 2,
      targetReps: "5 reps/side",
      tip: "Open up hip flexors, thoracic spine rotation, and hamstrings.",
      group: "warmup",
      steps: [
        "Step forward into a deep lunge position, dropping back knee close to floor.",
        "Place both hands flat on the inside of your front foot.",
        "Lift the arm closest to your front foot and rotate your upper body, reaching high to the ceiling.",
        "Return hand down, hinge your hips backwards, and straighten front leg to stretch hamstrings."
      ]
    }
  ],
  general: [
    {
      name: "Jumping Jacks & Dynamic Reaches",
      targetSets: 2,
      targetReps: "1 min",
      tip: "Elevate your core body temperature and heart rate.",
      group: "warmup",
      steps: [
        "Begin standing tall with arms at sides.",
        "Jump feet out while swinging arms overhead in a smooth motion.",
        "Immediately return to start and repeat at a steady rhythm.",
        "Reach overhead vigorously to stretch side lats."
      ]
    }
  ]
};

// Cool-down stretches database
export const cooldownPool: Record<string, ExercisePoolItem[]> = {
  upper: [
    {
      name: "Doorway Chest & Front Delt Stretch",
      targetSets: 2,
      targetReps: "30s hold",
      tip: "Elongate contracted pectoral fibers to kickstart recovery.",
      group: "cooldown",
      steps: [
        "Stand in a doorway or next to a sturdy frame/pillar.",
        "Place your forearm flat against the frame, elbow bent at 90 degrees.",
        "Gently step forward with the inner leg and lean your weight forward until you feel a deep stretch in your chest.",
        "Hold for 30 seconds, breathing deeply, then swap arms."
      ]
    },
    {
      name: "Cross-Body Rear Delt Stretch",
      targetSets: 2,
      targetReps: "30s hold",
      tip: "Stretch rear delts and rotator cuffs after heavy pressing.",
      group: "cooldown",
      steps: [
        "Stand tall and pull one arm straight across your chest.",
        "Use your opposite forearm to hook and pull the arm closer to your torso.",
        "Keep your shoulder down (do not let it shrug up to your ear).",
        "Hold for 30 seconds and repeat on the other side."
      ]
    }
  ],
  lower: [
    {
      name: "Kneeling Hip Flexor Stretch",
      targetSets: 2,
      targetReps: "30s hold",
      tip: "Relieve tension in deep hip flexors after leg work.",
      group: "cooldown",
      steps: [
        "Kneel on your left knee, with right foot flat on the floor in front of you.",
        "Tuck your pelvis under (squeeze your left glute) to pre-stretch the hip.",
        "Gently shift your weight forward slightly until you feel a deep front hip stretch.",
        "Hold for 30 seconds, then switch sides."
      ]
    },
    {
      name: "Seated Single-Leg Hamstring Stretch",
      targetSets: 2,
      targetReps: "30s hold",
      tip: "Relax hamstrings and calves, calming nervous system down.",
      group: "cooldown",
      steps: [
        "Sit on the floor, extend your right leg forward, and fold your left foot flat against your right inner thigh.",
        "Hinge forward from your hips (keep spine straight, do not round back).",
        "Reach your hands towards your right foot, pull toes back to stretch calf.",
        "Hold for 30 seconds, breathing slowly, then switch legs."
      ]
    }
  ],
  general: [
    {
      name: "Child's Pose Lat Stretch",
      targetSets: 2,
      targetReps: "45s hold",
      tip: "Decompress spinal discs and stretch tight lats.",
      group: "cooldown",
      steps: [
        "Kneel on the floor, knees wide, and sit your hips back onto your heels.",
        "Reach your arms far forward on the floor, sinking your chest down to the ground.",
        "Walk your hands slightly to the left to stretch the right lat, hold, then switch sides.",
        "Breathe deeply into your stomach."
      ]
    }
  ]
};

// Rich Pool of Shuffled Exercises per Group (8-10 exercises each to ensure high variety)
export const exercisePool: Record<string, ExercisePoolItem[]> = {
  chest: [
    { 
      name: "Flat Barbell Bench Press", 
      targetSets: 4, 
      targetReps: "8-10", 
      tip: "Retract scapulae, arch back, drive feet into ground", 
      group: "chest",
      steps: [
        "Lie flat on the bench, grip the bar slightly wider than shoulder width.",
        "Retract your shoulder blades (pull them back and down) and arch your lower back slightly.",
        "Lower the bar slowly to your mid-chest level, keeping elbows at a 45-degree angle.",
        "Drive your feet into the floor and press the bar back up explosively to lock out."
      ]
    },
    { 
      name: "Incline Dumbbell Press", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "30° incline, squeeze at top, slow eccentric", 
      group: "chest",
      steps: [
        "Set an incline bench to roughly 30 degrees and sit with a dumbbell in each hand.",
        "Bring dumbbells to your chest, elbows tucked at 45 degrees, wrist stacked over elbows.",
        "Press the weights straight up over your upper chest, squeezing hard at the top.",
        "Control the weights back down slowly, feeling a deep stretch across your upper pectorals."
      ]
    },
    { 
      name: "Low-To-High Cable Flyes", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Slight bend in elbows, pull upwards to collarbone level", 
      group: "chest",
      steps: [
        "Set dual pulleys to the lowest position and grab the handles with palms facing up.",
        "Step forward to create tension, chest proud, elbows slightly bent.",
        "Sweep your arms upward and inward, bringing your hands together in front of your upper chest.",
        "Squeeze the inner/upper pecs for 1 second before slowly reversing."
      ]
    },
    { 
      name: "Dips (Chest-focused)", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Lean forward, elbows flared, push through lower pectorals", 
      group: "chest",
      steps: [
        "Grip the dip bar handles, press yourself up to straight arms.",
        "Lean your torso forward at a 30-degree angle, flaring your elbows slightly outwards.",
        "Lower yourself until your shoulders are slightly below your elbows to stretch pecs.",
        "Press back up using your chest, squeezing hard at the peak."
      ]
    },
    { 
      name: "Decline Barbell Press", 
      targetSets: 4, 
      targetReps: "8-10", 
      tip: "Keep bar path towards lower chest, press explosively", 
      group: "chest",
      steps: [
        "Secure your legs under the pads of a decline bench and lie back.",
        "Unrack the bar with a medium grip and position it above your lower chest.",
        "Lower the bar slowly to touch the lower chest/upper abdomen.",
        "Press upwards and slightly back in a controlled trajectory."
      ]
    },
    { 
      name: "Dumbbell Pull-Overs", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Keep hips low, feel deep chest and lat stretch at bottom", 
      group: "chest",
      steps: [
        "Lie across a flat bench with only your upper back supported by the pad.",
        "Hold a single dumbbell with both hands directly above your chest.",
        "With a slight bend in your elbows, lower the weight back behind your head in an arc.",
        "Feel the stretch in your pecs and lats, then pull the dumbbell back over your chest."
      ]
    },
    { 
      name: "Pec Deck Machine Flyes", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Squeeze handles together, pause 1s at peak contraction", 
      group: "chest",
      steps: [
        "Adjust seat height so handles are at chest level. Pull shoulder blades back against pad.",
        "Grab the handles and sweep your arms together, keeping elbows slightly bent.",
        "Contract your chest strongly at the peak, holding for 1 second.",
        "Slowly open your arms to feel a deep chest stretch."
      ]
    },
    { 
      name: "Weighted Push-ups", 
      targetSets: 3, 
      targetReps: "15-20", 
      tip: "Keep torso rigid, control body as single unit", 
      group: "chest",
      steps: [
        "Place a weight plate on your back, or use a resistance band over your shoulders.",
        "Assume a perfect plank push-up position, hands slightly wider than shoulders.",
        "Lower your chest until it is 1 inch off the floor, keeping your elbows tucked.",
        "Press up explosively while bracing your core."
      ]
    },
  ],
  back: [
    { 
      name: "Barbell Rows (Overhand)", 
      targetSets: 4, 
      targetReps: "8-10", 
      tip: "Hinge at hips, pull bar to your lower belly button", 
      group: "back",
      steps: [
        "Hold bar with a medium overhand grip, stand tall, brace core.",
        "Hinge forward from your hips at 45 degrees, keeping your spine straight and neutral.",
        "Pull the barbell upwards towards your lower belly button, driving your elbows high.",
        "Control the bar back down to a full arm extension."
      ]
    },
    { 
      name: "Weighted Pull-ups", 
      targetSets: 4, 
      targetReps: "8-12", 
      tip: "Dead hang stretch, pull chest all the way to bar", 
      group: "back",
      steps: [
        "Grab pull-up bar with hands wider than shoulder-width, hang with straight arms.",
        "Pull shoulder blades down and back, then drive elbows down to lift chest to bar.",
        "Keep core tight, avoiding swinging or kipping.",
        "Lower slowly back to a full dead hang stretch."
      ]
    },
    { 
      name: "Seated Cable Rows (V-Bar)", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Upright posture, drive elbows back, squeeze scapulae", 
      group: "back",
      steps: [
        "Sit at row station, feet on footplates, grip V-Bar handle.",
        "Push back slightly, keeping knees soft, chest proud, spine straight.",
        "Pull handles to your lower ribs, driving elbows close to sides.",
        "Hold for 1s, squeezing lats, then extend arms fully."
      ]
    },
    { 
      name: "Single-Arm Dumbbell Row", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Drive elbow to hip, don't rotate hips at bottom", 
      group: "back",
      steps: [
        "Place same-side knee and hand on flat bench for support.",
        "Hold dumbbell in opposite hand, arm extended straight down.",
        "Pull the dumbbell up and back in a sweeping motion towards your hip.",
        "Lower the weight back to standard stretch under control."
      ]
    },
    { 
      name: "Wide Grip Lat Pulldown", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Pull bar to upper collarbone, resist weight on way up", 
      group: "back",
      steps: [
        "Grab pulldown bar with a wide grip, sit and lock thighs under pads.",
        "Slightly lean back, pull the bar down to your collarbones, driving elbows down.",
        "Contract your lats, then slowly allow bar to return to dead stretch."
      ]
    },
    { 
      name: "Straight-Arm Lat Pulldown", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Hinge slightly, press bar down with straight elbows", 
      group: "back",
      steps: [
        "Stand facing cable pulley, holding straight bar with overhand grip.",
        "Hinge forward at hips 30 degrees, arms overhead with slight bend in elbows.",
        "Pull bar down in a wide arc until it touches your thighs, keeping arms straight.",
        "Return slowly to feel lat stretch."
      ]
    },
    { 
      name: "T-Bar Chest-Supported Row", 
      targetSets: 4, 
      targetReps: "8-10", 
      tip: "Keep chest firmly against pad, pull through elbows", 
      group: "back",
      steps: [
        "Lie face down on the angled pad, grab handles with wide or neutral grip.",
        "Pull weight up dynamically by pulling elbows high and back.",
        "Squeeze the middle-back muscles, then lower back to start stretch."
      ]
    },
    { 
      name: "Hyperextensions (Weighted)", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Hinge at hips, squeeze lower back and glutes at top", 
      group: "back",
      steps: [
        "Set up on a 45-degree extension bench, hold a weight plate across your chest.",
        "Hinge down slowly at your hips, keeping your spine straight and long.",
        "Contract your lower back and glutes to raise your upper body up.",
        "Do not over-extend your spine at the top."
      ]
    },
  ],
  shoulders: [
    { 
      name: "Overhead Barbell Press", 
      targetSets: 4, 
      targetReps: "6-8", 
      tip: "Brace glutes and core, press bar in straight vertical line", 
      group: "shoulders",
      steps: [
        "Hold barbell on front shoulders with a slightly wider than shoulder grip.",
        "Squeeze glutes and core tight, tilt head back slightly to clear bar trajectory.",
        "Press the bar straight up to fully locked elbows, pushing head forward at lockout.",
        "Control bar back down to collarbone height."
      ]
    },
    { 
      name: "Dumbbell Lateral Raises", 
      targetSets: 4, 
      targetReps: "12-15", 
      tip: "Lead with side delts, raise dumbbells to shoulder level", 
      group: "shoulders",
      steps: [
        "Stand tall with dumbbells at your sides, chest proud, lean forward 5 degrees.",
        "Raise the weights out to your sides, leading with your elbows, hands tilted slightly down.",
        "Pause for a fraction of a second at shoulder height.",
        "Lower dumbbells slowly back to sides under control."
      ]
    },
    { 
      name: "Rear Delt Dumbbell Flyes", 
      targetSets: 3, 
      targetReps: "15-20", 
      tip: "Bent over at 90°, pull elbows outwards and back", 
      group: "shoulders",
      steps: [
        "Bend at the hips until your torso is parallel to the floor, knees soft.",
        "Hold dumbbells underneath your chest with palms facing each other.",
        "Pull your elbows up and out sideways, squeezing the back of your shoulders.",
        "Slowly lower weights back down, keeping constant tension."
      ]
    },
    { 
      name: "Arnold Dumbbell Press", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Start with palms in, rotate to face forward as you press", 
      group: "shoulders",
      steps: [
        "Sit on a vertical bench, hold dumbbells in front of your chest with palms facing you.",
        "As you press weights overhead, rotate your wrists outwards so palms face forward.",
        "Lock weights out overhead, then rotate wrists back on way down."
      ]
    },
    { 
      name: "Cable Lateral Raises", 
      targetSets: 4, 
      targetReps: "12-15", 
      tip: "Set pulley at bottom, pull cable across body side to side", 
      group: "shoulders",
      steps: [
        "Stand next to bottom pulley, grab handle with opposite hand behind your back.",
        "Pull handle out and up sideways to shoulder height, keeping elbow straight.",
        "Ensure movement is initiated from side shoulder, then return under control."
      ]
    },
    { 
      name: "Upright EZ-Bar Rows", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Keep hands close, pull elbows higher than shoulders", 
      group: "shoulders",
      steps: [
        "Grip EZ-Bar in middle, stand tall, bar resting on thighs.",
        "Pull the bar straight up along your body towards collarbones, driving elbows up.",
        "Lower slowly back to start under control."
      ]
    },
    { 
      name: "Face Pulls (Rope)", 
      targetSets: 3, 
      targetReps: "15-20", 
      tip: "Pull rope towards eyes, external rotate wrists at peak", 
      group: "shoulders",
      steps: [
        "Set cable pulley to eye height, grab rope ends with thumbs pointing back.",
        "Step back to create tension, pull rope towards your eyes, flaring elbows out.",
        "Pull hands apart past your ears, squeezing rear delts and traps.",
        "Return slowly under load."
      ]
    },
    { 
      name: "Heavy Dumbbell Shrugs", 
      targetSets: 3, 
      targetReps: "15-20", 
      tip: "Raise shoulders straight up to ears, squeeze upper traps", 
      group: "shoulders",
      steps: [
        "Hold heavy dumbbells at your sides, stand tall.",
        "Squeeze traps to raise shoulders straight up towards your ears (do not roll back).",
        "Hold for 1 second, then control back to full drop stretch."
      ]
    },
  ],
  legs: [
    { 
      name: "Barbell Back Squats", 
      targetSets: 4, 
      targetReps: "6-8", 
      tip: "Hinge backward first, track knees outward over toes", 
      group: "legs",
      steps: [
        "Rest barbell on upper traps, stand with feet slightly wider than shoulders.",
        "Brace core, push hips backward and bend knees to drop into deep squat.",
        "Keep chest proud, drop until thighs are at least parallel to floor.",
        "Drive through heels, extending hips and knees to lock out."
      ]
    },
    { 
      name: "Romanian Deadlifts (RDLs)", 
      targetSets: 4, 
      targetReps: "8-10", 
      tip: "Hinge at hips, keep dumbbells close to legs, feel hamstring stretch", 
      group: "legs",
      steps: [
        "Stand tall holding barbell/dumbbells against thighs.",
        "With soft knees, push your hips backwards, sliding weights down close to your shins.",
        "Keep spine neutral, stop when you feel deep hamstring stretch.",
        "Drive hips forward to stand, squeezing glutes."
      ]
    },
    { 
      name: "Heavy Leg Press", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Feet hip-width, lower slowly, do not lock knees at top", 
      group: "legs",
      steps: [
        "Sit in leg press, place feet flat on sled, release lock pins.",
        "Lower platform slowly towards chest until knees are bent at 90 degrees.",
        "Press platform back up using heels, stop just short of locking knees out."
      ]
    },
    { 
      name: "Bulgarian Split Squats", 
      targetSets: 3, 
      targetReps: "10-12/leg", 
      tip: "Elevate back foot, drop hips straight down vertically", 
      group: "legs",
      steps: [
        "Elevate one foot behind you on a flat bench. Hold dumbbells in hands.",
        "Hop forward front foot, lower hips vertically until front thigh is parallel to floor.",
        "Ensure front knee tracks over front toes.",
        "Press up through front heel."
      ]
    },
    { 
      name: "Lying Leg Curls", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Keep pelvis down, squeeze hamstrings aggressively at top", 
      group: "legs",
      steps: [
        "Lie face down on leg curl machine, place back of ankles against roller pad.",
        "Hold handles, keep hips flat on pad, curl legs upwards towards glutes.",
        "Squeeze hamstrings for 1 second, then slowly lower legs back straight."
      ]
    },
    { 
      name: "Seated Leg Extensions", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Extend legs fully, flare toes outwards to target inner quad", 
      group: "legs",
      steps: [
        "Adjust back pad so knees sit flush with edge. Place pad on lower shins.",
        "Extend legs completely straight, pulling toes upward to maximize quad contraction.",
        "Squeeze quads for 1 second, then lower pad slowly."
      ]
    },
    { 
      name: "Standing Smith Calf Raises", 
      targetSets: 4, 
      targetReps: "15-20", 
      tip: "Deep stretch at bottom, explosive rise onto tiptoes", 
      group: "legs",
      steps: [
        "Place balls of feet on raised block, rest Smith bar on shoulders.",
        "Drop heels down below the block level to get a deep stretch.",
        "Push up explosively on the balls of your feet, squeezing calf muscles.",
        "Lower under complete control."
      ]
    },
    { 
      name: "Dumbbell Walking Lunges", 
      targetSets: 3, 
      targetReps: "12/leg", 
      tip: "Long controlled strides, keep front knee at 90°", 
      group: "legs",
      steps: [
        "Hold dumbbells at your sides, stand tall.",
        "Take a long step forward, lowering your back knee until it is 1 inch off floor.",
        "Keep front knee behind front toes, then push off back foot to step forward."
      ]
    },
  ],
  biceps: [
    {
      name: "Barbell Bicep Curls",
      targetSets: 3,
      targetReps: "10-12",
      tip: "Pin elbows to sides, curl upwards, resist the negative",
      group: "biceps",
      steps: [
        "Grip barbell with shoulder-width underhand grip, stand tall.",
        "Keep elbows pinned to sides, curl bar upwards toward chest.",
        "Squeeze biceps, then lower bar slowly over 3 seconds."
      ],
    },
    {
      name: "EZ-Bar Preacher Curls",
      targetSets: 3,
      targetReps: "10-12",
      tip: "Keep armpit flat against bench pad, full contraction",
      group: "biceps",
      steps: [
        "Position yourself on preacher bench, back of arms flat against pad.",
        "Grip EZ-bar underhand, curl bar upwards toward chin.",
        "Squeeze biceps at top, lower bar slowly to a soft stretch."
      ],
    },
    {
      name: "Hammer Dumbbell Curls",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Neutral grip — targets brachialis and forearms",
      group: "biceps",
      steps: [
        "Hold dumbbells with palms facing each other.",
        "Curl weights up without rotating wrists, elbows tucked.",
        "Lower slowly back to your sides."
      ],
    },
    {
      name: "Bicep Concentration Curls",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Brace elbow on inner thigh, squeeze at the top",
      group: "biceps",
      steps: [
        "Sit on a bench, lean forward, arm hanging straight down.",
        "Brace elbow against inner thigh.",
        "Curl dumbbell toward shoulder without swinging."
      ],
    },
    {
      name: "Incline Dumbbell Curls",
      targetSets: 3,
      targetReps: "10-12",
      tip: "Set bench to 45°, let arms hang for a deep stretch",
      group: "biceps",
      steps: [
        "Lie on incline bench holding dumbbells at your sides.",
        "Curl both weights up while keeping elbows slightly behind torso.",
        "Lower under control to full stretch at the bottom."
      ],
    },
    {
      name: "Cable Bicep Curl",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Constant tension — don't let stack touch between reps",
      group: "biceps",
      steps: [
        "Attach straight bar to low cable, stand facing the stack.",
        "Curl bar up with elbows fixed at your sides.",
        "Squeeze hard at top, resist on the way down."
      ],
    },
    {
      name: "Reverse Grip EZ-Bar Curls",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Overhand grip targets outer bicep and forearms",
      group: "biceps",
      steps: [
        "Hold EZ-bar with overhand shoulder-width grip.",
        "Curl bar up keeping wrists straight and elbows tucked.",
        "Lower slowly — avoid using momentum."
      ],
    },
    {
      name: "21s Bicep Curls",
      targetSets: 3,
      targetReps: "21",
      tip: "7 bottom half + 7 top half + 7 full reps per set",
      group: "biceps",
      steps: [
        "Use a manageable weight on EZ-bar or dumbbells.",
        "Perform 7 reps from bottom to midpoint only.",
        "Then 7 reps from midpoint to top, then 7 full-range curls."
      ],
    },
  ],
  triceps: [
    {
      name: "Close Grip Bench Press",
      targetSets: 4,
      targetReps: "8-10",
      tip: "Shoulder-width grip, lower to sternum, lock out triceps",
      group: "triceps",
      steps: [
        "Lie on flat bench, grip bar shoulder-width.",
        "Lower bar to mid-sternum with elbows tucked.",
        "Press up forcefully to full tricep lockout."
      ],
    },
    {
      name: "Overhead Dumbbell Extension",
      targetSets: 3,
      targetReps: "10-12",
      tip: "Keep elbows forward, stretch long head of triceps",
      group: "triceps",
      steps: [
        "Hold one dumbbell overhead with both hands.",
        "Lower weight behind head under control.",
        "Extend back up without flaring elbows out."
      ],
    },
    {
      name: "Rope Tricep Pushdowns",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Flare rope apart at bottom for max contraction",
      group: "triceps",
      steps: [
        "Grip rope at cable station, slight forward hinge.",
        "Push down to full extension, elbows at sides.",
        "Spread rope ends apart at the bottom."
      ],
    },
    {
      name: "Tricep Kickbacks (Cable)",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Upper arm parallel to floor, extend fully back",
      group: "triceps",
      steps: [
        "Hinge forward at cable, neutral grip on handle.",
        "Pin upper arm parallel to floor.",
        "Extend arm straight back, squeeze tricep."
      ],
    },
    {
      name: "Skull Crushers (EZ-Bar)",
      targetSets: 3,
      targetReps: "10-12",
      tip: "Lower bar to forehead, elbows stay in place",
      group: "triceps",
      steps: [
        "Lie on bench, hold EZ-bar with arms extended.",
        "Bend elbows to lower bar toward forehead.",
        "Press back up using triceps only."
      ],
    },
    {
      name: "Tricep Dips",
      targetSets: 3,
      targetReps: "10-12",
      tip: "Torso upright, elbows back — not chest-forward dips",
      group: "triceps",
      steps: [
        "Grip parallel bars, start at straight arms.",
        "Keep torso upright, bend elbows straight back.",
        "Press up until arms lock out."
      ],
    },
    {
      name: "Single-Arm Cable Pushdown",
      targetSets: 3,
      targetReps: "12-15",
      tip: "One arm at a time — control rotation at wrist",
      group: "triceps",
      steps: [
        "Stand sideways to cable, grip handle with one hand.",
        "Push down to lockout keeping elbow at your side.",
        "Complete all reps, then switch arms."
      ],
    },
    {
      name: "Bench Dips",
      targetSets: 3,
      targetReps: "12-15",
      tip: "Feet on floor or elevated — add plate on lap for load",
      group: "triceps",
      steps: [
        "Hands on bench behind you, legs extended forward.",
        "Lower body by bending elbows to 90°.",
        "Press through palms to straight arms."
      ],
    },
  ],
  core: [
    { 
      name: "Hanging Leg Raises", 
      targetSets: 3, 
      targetReps: "12-15", 
      tip: "Curl hips upwards, avoid swinging torso", 
      group: "core",
      steps: [
        "Hang from pull-up bar, arms fully straight, legs together.",
        "Contract lower abs to curl hips up and raise legs forward.",
        "Lower legs slowly back down without swinging body."
      ]
    },
    { 
      name: "Cable Ab Crunches", 
      targetSets: 3, 
      targetReps: "15-20", 
      tip: "Kneel, curl spine downwards to pull ribs into pelvis", 
      group: "core",
      steps: [
        "Kneel in front of cable station, hold rope ends behind your head.",
        "Brace hips static, contract abs to pull ribs down into hips, rounding spine.",
        "Hold bottom contraction for 1s, then slowly sit back upright."
      ]
    },
    { 
      name: "Weighted Russian Twists", 
      targetSets: 3, 
      targetReps: "20", 
      tip: "Lean torso back slightly, float heels, rotate side to side", 
      group: "core",
      steps: [
        "Sit on floor holding weight plate/med ball.",
        "Lean back 30 degrees, lift feet slightly off floor, brace abs.",
        "Rotate shoulders side-to-side, tapping weight to floor on each side."
      ]
    },
    { 
      name: "Ab Wheel Rollouts", 
      targetSets: 3, 
      targetReps: "10-12", 
      tip: "Roll forward slowly, brace abs to keep spine straight", 
      group: "core",
      steps: [
        "Kneel on floor holding ab wheel handles under chest.",
        "Roll wheel forward, extending body out straight.",
        "Brace abs tight to prevent lower back arching, then pull wheel back."
      ]
    },
    { 
      name: "Weighted Decline Crunches", 
      targetSets: 3, 
      targetReps: "15", 
      tip: "Hold plate to chest, rise slowly using abs only", 
      group: "core",
      steps: [
        "Lock legs on decline bench, hold weight plate against chest.",
        "Lower upper back to pad, then contract abs to curl chest upward.",
        "Squeeze abs at top, control descent."
      ]
    },
    { 
      name: "Weighted Plank Hold", 
      targetSets: 3, 
      targetReps: "45-60s", 
      tip: "Place plate on back, squeeze abs, glutes and quads tight", 
      group: "core",
      steps: [
        "Place a weight plate on your lower back in a standard low plank.",
        "Keep spine straight, neck neutral.",
        "Contract abs, glutes, and quadriceps as tightly as possible."
      ]
    },
  ],
};

