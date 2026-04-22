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
  const pass = "ferdausmd@@225599.com@123d%com";

  console.log("Password length:", pass.length);
  console.log(
    "Password chars:",
    [...pass].map((c) => c.charCodeAt(0)),
  );

  const hash = user.legacy_password_hash.replace("$wp$2y$", "$2y$");
  console.log("bcrypt result:", bcrypt.compareSync(pass, hash));

  // Try trimmed
  console.log("Trimmed result:", bcrypt.compareSync(pass.trim(), hash));

  await client.close();
}

main().catch(console.error);
