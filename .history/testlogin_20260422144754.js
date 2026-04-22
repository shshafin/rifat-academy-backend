const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const hash = "$wp$2y$10$8GSWDotRoWMT9Wgjvc2B7eOgAeQYi1Rznv68HoC3k48DbcOo4GAW6";
const pass = "ferdausmd@@225599.com@123d%com";

// WordPress hashes password as md5 first, then bcrypt
const md5pass = crypto.createHash("md5").update(pass).digest("hex");
console.log("MD5 of pass:", md5pass);

const h1 = hash.replace("$wp$2y$", "$2y$");
const h2 = hash.replace("$wp$2y$", "$2a$");

console.log("bcrypt(md5, $2y$):", bcrypt.compareSync(md5pass, h1));
console.log("bcrypt(md5, $2a$):", bcrypt.compareSync(md5pass, h2));

// Also try raw password with $2b$
const h3 = hash.replace("$wp$2y$", "$2b$");
console.log("bcrypt(raw, $2b$):", bcrypt.compareSync(pass, h3));
console.log("bcrypt(md5, $2b$):", bcrypt.compareSync(md5pass, h3));
