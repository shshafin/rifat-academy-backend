const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  const sqlHash =
    "$wp$2y$10$v719Zyb/5DiglXjaGmtVoO.58ZfZLBkfIyjXnYyIbWYYFsofeucua";

  // Update MongoDB with SQL hash
  await db
    .collection("users")
    .updateOne(
      { email: "test@gmail.com" },
      { $set: { legacy_password_hash: sqlHash } },
    );
  console.log("MongoDB updated");

  // Now test
  const pass = "test123";
  const converted = sqlHash.replace("$wp$2y$", "$2b$");
  console.log("bcrypt result:", bcrypt.compareSync(pass, converted));

  await client.close();
}

main().catch(console.error);
