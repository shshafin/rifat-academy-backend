const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const AUTH_KEY =
  "gydf7g7ftlebi0a1j82k2qxluuxs8wtdtofewrinrzcb2b5xojmzbrhlwqfdgf0t";
const SECURE_AUTH_KEY =
  "49rrozk4umlgfvatd9xpjqjbgjxn5437ehpkrwr6hdgakemlb6bgywherocqlhkz";

const hash = "$wp$2y$10$v719Zyb/5DiglXjaGmtVoO.58ZfZLBkfIyjXnYyIbWYYFsofeucua";
const pass = "test123";

// WordPress peppers password with AUTH_KEY before hashing
const variants = [
  pass,
  pass + AUTH_KEY,
  AUTH_KEY + pass,
  crypto.createHmac("sha256", AUTH_KEY).update(pass).digest("hex"),
  crypto.createHmac("md5", AUTH_KEY).update(pass).digest("hex"),
];

const cleanHash = hash.replace("$wp$2y$", "$2b$");

variants.forEach((v, i) => {
  console.log(`Variant ${i}: ${bcrypt.compareSync(v, cleanHash)}`);
});
