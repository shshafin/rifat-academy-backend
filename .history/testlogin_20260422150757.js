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
    .findOne({ email: "test@gmail.com" });
  if (!user) {
    console.log("User not found");
    await client.close();
    return;
  }

  console.log("User:", user.display_name);
  console.log("Hash:", user.legacy_password_hash);

  const pass = "test";
  const h1 = user.legacy_password_hash.replace("$wp$2y$", "$2y$");
  const h2 = user.legacy_password_hash.replace("$wp$2y$", "$2a$");
  const h3 = user.legacy_password_hash.replace("$wp$2y$", "$2b$");

  console.log("$2y$:", bcrypt.compareSync(pass, h1));
  console.log("$2a$:", bcrypt.compareSync(pass, h2));
  console.log("$2b$:", bcrypt.compareSync(pass, h3));

  await client.close();
}

main().catch(console.error);
