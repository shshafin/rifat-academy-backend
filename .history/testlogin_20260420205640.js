const { MongoClient } = require("mongodb");
const crypto = require("crypto");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

// WordPress phpass implementation
function wpCheckPassword(password, hash) {
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

  function md5(data) {
    return crypto.createHash("md5").update(data, "binary").digest();
  }

  // Remove $wp$ prefix
  const wpHash = hash.replace("$wp$", "$");

  if (wpHash.startsWith("$P$") || wpHash.startsWith("$H$")) {
    const countLog2 = itoa64.indexOf(wpHash[3]);
    let count = 1 << countLog2;
    const salt = wpHash.substring(4, 12);

    let hashBuf = md5(salt + password);
    do {
      hashBuf = md5(Buffer.concat([hashBuf, Buffer.from(password, "binary")]));
    } while (--count);

    const output = wpHash.substring(0, 12) + encode64(hashBuf, 16);
    return output === wpHash;
  }
  return false;
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  const user = await db
    .collection("users")
    .findOne({ email: "abirmaruf506612@gmail.com" });
  const pass = "ferdausmd@@225599.com@123d%com";

  console.log("Hash:", user.legacy_password_hash);
  console.log(
    "Hash starts with $wp$2y$ (bcrypt):",
    user.legacy_password_hash.startsWith("$wp$2y$"),
  );
  console.log(
    "phpass result:",
    wpCheckPassword(pass, user.legacy_password_hash),
  );

  await client.close();
}

main().catch(console.error);
