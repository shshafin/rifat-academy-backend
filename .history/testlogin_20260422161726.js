const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const hash = "$wp$2y$10$v719Zyb/5DiglXjaGmtVoO.58ZfZLBkfIyjXnYyIbWYYFsofeucua";
const pass = "test123";

// WordPress exact algorithm
const hmac = crypto.createHmac("sha384", "wp-sha384");
hmac.update(pass);
const passwordToVerify = hmac.digest("base64");

// Remove first 3 chars ($wp) from hash
const cleanHash = hash.substring(3);

console.log("password_to_verify:", passwordToVerify);
console.log("clean hash:", cleanHash);
console.log("Result:", bcrypt.compareSync(passwordToVerify, cleanHash));
