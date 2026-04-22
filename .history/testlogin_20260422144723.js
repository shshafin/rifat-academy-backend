const bcrypt = require("bcryptjs");

const hash = "$wp$2y$10$8GSWDotRoWMT9Wgjvc2B7eOgAeQYi1Rznv68HoC3k48DbcOo4GAW6";
const pass = "ferdausmd@@225599.com@123d%com";

console.log("Pass length:", pass.length);
console.log("Hash:", hash);

const h1 = hash.replace("$wp$2y$", "$2y$");
const h2 = hash.replace("$wp$2y$", "$2a$");
const h3 = hash.replace("$wp$", "$");

console.log("$2y$:", bcrypt.compareSync(pass, h1));
console.log("$2a$:", bcrypt.compareSync(pass, h2));
console.log("raw :", bcrypt.compareSync(pass, h3));
