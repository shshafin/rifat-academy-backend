const bcrypt = require("bcryptjs");

const hash = "$wp$2y$10$ZKcdGC9pKgRMhcXH/gJQ4uUQ5H1sBXnCNBh2q9MygRWmUNRSwb0Oe";
const pass = "@n@m7)50h@que";

// WordPress internally uses the password + a pepper sometimes
// Try all possible conversions
const variants = [
  hash.replace("$wp$2y$", "$2y$"),
  hash.replace("$wp$2y$", "$2a$"),
  hash.replace("$wp$2y$", "$2b$"),
  hash.replace("$wp$", ""),
  hash.substring(4), // remove first 4 chars ($wp$)
];

variants.forEach((h, i) => {
  try {
    const result = bcrypt.compareSync(pass, h);
    console.log(`Variant ${i}: ${result} — ${h.substring(0, 10)}...`);
  } catch (e) {
    console.log(`Variant ${i}: ERROR — ${e.message}`);
  }
});
