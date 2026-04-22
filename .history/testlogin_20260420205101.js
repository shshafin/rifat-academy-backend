const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  // Just check one user's hash format
  const user = await db
    .collection("users")
    .findOne({ email: "mdanamulhaque.ma@gmail.com" });
  console.log("Hash:", user.legacy_password_hash);
  console.log("Hash length:", user.legacy_password_hash.length);

  // Try different prefix removals
  const hash1 = user.legacy_password_hash.replace("$wp$", "$");
  const hash2 = user.legacy_password_hash.replace("$wp$2y$", "$2y$");
  const hash3 = user.legacy_password_hash.replace("$wp$2y$", "$2a$");

  const pass = "@n@m7)50h@que";
  console.log("Try 1 ($wp$ -> $):", bcrypt.compareSync(pass, hash1));
  console.log("Try 2 ($wp$2y$ -> $2y$):", bcrypt.compareSync(pass, hash2));
  console.log("Try 3 ($wp$2y$ -> $2a$):", bcrypt.compareSync(pass, hash3));

  await client.close();
}

main().catch(console.error);
