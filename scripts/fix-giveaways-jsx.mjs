import fs from "fs";

const p = "src/app/giveaways/page.tsx";
let s = fs.readFileSync(p, "utf8");

// Referral header: div open, motion close -> div close
s = s.replace(
  `+150 pts each signup</span>
        </motion.div>
        <motion.div className="flex gap-2">`,
  `+150 pts each signup</span>
        </motion.div>
        <motion.div className="flex gap-2">`
);

// Fix referral header close
s = s.replace(
  "+150 pts each signup</span>\n        </motion.div>\n        <div className=\"flex gap-2\">",
  "+150 pts each signup</span>\n        </div>\n        <div className=\"flex gap-2\">"
);

// Icon box: div open, motion close
s = s.replace(
  /(<action\.icon className=\{cn\("w-5 h-5", done \? "text-emerald-400" : "text-brand"\)\} \/>)\n                <\/motion\.div>/,
  "$1\n                </div>"
);

// Earn row: motion open, div close
s = s.replace(
  /(\{claiming === action\.action \? <Loader2 className="w-3 h-3 animate-spin" \/> : action\.cta\}\n                  <\/button>\n                \)\}\n              )<\/div>/,
  `$1</motion.div>`
);

fs.writeFileSync(p, s);
console.log("fixed");
