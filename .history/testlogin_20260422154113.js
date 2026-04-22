const crypto = require("crypto");

function wpCheckPassword(password, hash) {
  // Remove $wp$ prefix first
  hash = hash.replace("$wp$", "$");

  const itoa64 =
    "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  function encode64(input, count) {
    let output = "";
    let i = 0;
    do {
      let value = input[i++];
      output += itoa64[value & 0x3f];
      if (i < count) value |= input[i] << 8;
      output += itoa64[(value >> 6) & 0x3f];
      if (i++ >= count) break;
      if (i < count) value |= input[i] << 8;
      output += itoa64[(value >> 12) & 0x3f];
      if (i++ >= count) break;
      output += itoa64[(value >> 18) & 0x3f];
    } while (i < count);
    return output;
  }

  function md5(str) {
    return Buffer.from(
      crypto.createHash("md5").update(str, "binary").digest("hex"),
      "hex",
    );
  }

  // If hash starts with $2y$ or $2a$ or $2b$ — it's bcrypt
  if (
    hash.startsWith("$2y$") ||
    hash.startsWith("$2a$") ||
    hash.startsWith("$2b$")
  ) {
    const bcrypt = require("bcryptjs");
    const normalized = hash.replace("$2y$", "$2b$").replace("$2a$", "$2b$");
    return bcrypt.compareSync(password, normalized);
  }

  // Otherwise PHPass
  if (!hash.startsWith("$P$") && !hash.startsWith("$H$")) {
    return hash === md5(password).toString("hex");
  }

  const countLog2 = itoa64.indexOf(hash[3]);
  let count = 1 << countLog2;
  const salt = hash.substring(4, 12);

  let hashBuf = md5(salt + password);
  do {
    hashBuf = md5(Buffer.concat([hashBuf, Buffer.from(password, "binary")]));
  } while (--count);

  return hash.substring(0, 12) + encode64(hashBuf, 16) === hash;
}

// Test
const hash = "$wp$2y$10$ZKcdGC9pKgRMhcXH/gJQ4uUQ5H1sBXnCNBh2q9MygRWmUNRSwb0Oe";
const pass = "@n@m7)50h@que";
console.log("Result:", wpCheckPassword(pass, hash));
