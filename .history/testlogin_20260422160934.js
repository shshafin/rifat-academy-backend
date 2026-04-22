const hasher = require("wordpress-hash-node");

const hash = "$wp$2y$10$v719Zyb/5DiglXjaGmtVoO.58ZfZLBkfIyjXnYyIbWYYFsofeucua";
const pass = "test123";

// Try with $wp$ prefix
console.log("With $wp$:", hasher.CheckPassword(pass, hash));

// Try without $wp$ prefix
const cleanHash = hash.replace("$wp$", "$");
console.log("Without $wp$:", hasher.CheckPassword(pass, cleanHash));
