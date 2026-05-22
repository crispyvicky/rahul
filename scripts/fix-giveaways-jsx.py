from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/app/giveaways/page.tsx"
s = p.read_text(encoding="utf-8")

WRONG = "</" + "motion.div>"
DIV = "</" + "div>"
MOTION = "</" + "motion.div>"

# Referral header: <motion.div> opened line 222, wrong close
s = s.replace(
    "+150 pts each signup</span>\n        " + WRONG + "\n        <div className=\"flex gap-2\">",
    "+150 pts each signup</span>\n        " + DIV + "\n        <div className=\"flex gap-2\">",
)

# Icon box: <motion.div> line 278, wrong close line 280
s = s.replace(
    'done ? "text-emerald-400" : "text-brand")} />\n        ' + WRONG + "\n                <div className=\"flex-1",
    'done ? "text-emerald-400" : "text-brand")} />\n                ' + DIV + "\n                <div className=\"flex-1",
)

# Earn row: <motion.div> line 271, wrong </div> close line 309
s = s.replace(
    "                )}\n              </motion.div>\n            );\n          })}\n        </div>\n      )}\n\n      {tab === \"leaderboard\"",
    "                )}\n              " + MOTION + "\n            );\n          })}\n        </div>\n      )}\n\n      {tab === \"leaderboard\"",
)

# If earn row still has plain div close, fix it
s = s.replace(
    "                )}\n              </motion.div>\n            );\n          })}\n        </div>\n      )}\n\n      {tab === \"leaderboard\"",
    "                )}\n              " + MOTION + "\n            );\n          })}\n        </div>\n      )}\n\n      {tab === \"leaderboard\"",
)

# Earn row fix - use DIV variable for wrong close
s = s.replace(
    "                )}\n              " + DIV + "\n            );\n          })}\n        </div>\n      )}\n\n      {tab === \"leaderboard\"",
    "                )}\n              " + MOTION + "\n            );\n          })}\n        </div>\n      )}\n\n      {tab === \"leaderboard\"",
)

p.write_text(s, encoding="utf-8")
print("fixed")
