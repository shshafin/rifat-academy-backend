const PasswordHash = require("wordpress-hash-node"); // ✅ Fix: Correct Import
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log("--- Migration Test Start ---");
    await client.connect();
    const db = client.db("rifatacademy");

    const user = await db
      .collection("users")
      .findOne({ email: "test@gmail.com" });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log("✅ User Found:", user.display_name || user.email);

    const storedHash = user.legacy_password_hash;
    const inputPass = "test";

    // ✅ Fix: Use PasswordHash.CheckPassword (Case Sensitive)
    const isMatch = PasswordHash.CheckPassword(inputPass, storedHash);

    if (isMatch) {
      console.log("🎉 SUCCESS: Password matched!");
    } else {
      console.log("🚫 FAILED: Password did not match.");
    }
  } catch (error) {
    console.error("❗ Error occurred:", error);
  } finally {
    await client.close();
    console.log("--- Test Finished ---");
  }
}

main().catch(console.error);
