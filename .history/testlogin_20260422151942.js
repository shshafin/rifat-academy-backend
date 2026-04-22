const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  // MongoDB update
  await db.collection("users").updateOne(
    { email: "test@gmail.com" },
    {
      $set: {
        legacy_password_hash:
          "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      },
    },
  );
  console.log("MongoDB updated");

  // Now test
  const user = await db
    .collection("users")
    .findOne({ email: "test@gmail.com" });
  const hash = user.legacy_password_hash.replace("$2y$", "$2b$");
  const result = bcrypt.compareSync("password", hash);
  console.log("Login test result:", result);

  await client.close();
}

main().catch(console.error);
