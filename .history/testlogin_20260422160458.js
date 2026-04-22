const hasher = require("wordpress-hash-node");

const hash = "$wp$2y$10$ZKcdGC9pKgRMhcXH/gJQ4uUQ5H1sBXnCNBh2q9MygRWmUNRSwb0Oe";
const pass = "@n@m7)50h@que";

// Remove $wp$ prefix first
const cleanHash = hash.replace("$wp$", "$");
console.log("Clean hash:", cleanHash);

const result = hasher.CheckPassword(pass, cleanHash);
console.log("Result:", result);
