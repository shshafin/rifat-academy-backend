const bcrypt = require("bcryptjs");

const hash = "$wp$2y$10$v719Zyb/5DiglXjaGmtVoO.58ZfZLBkfIyjXnYyIbWYYFsofeucua";
const pass = "test123";

const converted = hash.replace("$wp$2y$", "$2b$");
console.log("Converted hash:", converted);
console.log("Result:", bcrypt.compareSync(pass, converted));
