const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  const user = await db
    .collection("users")
    .findOne({ email: "abirmaruf506612@gmail.com" });
  console.log("User found:", user.display_name);
  console.log("Hash:", user.legacy_password_hash);

  const pass = "ferdausmd@@225599.com@123d%com";
  const hash2y = user.legacy_password_hash.replace("$wp$2y$", "$2y$");
  const hash2a = user.legacy_password_hash.replace("$wp$2y$", "$2a$");

  console.log("Try $2y$:", bcrypt.compareSync(pass, hash2y));
  console.log("Try $2a$:", bcrypt.compareSync(pass, hash2a));

  await client.close();
}

main().catch(console.error);
