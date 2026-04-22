const { checkPassword } = require("wordpress-hash-node");
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
      console.log("❌ User not found in MongoDB!");
      return;
    }

    console.log("✅ User Found:", user.display_name || user.email);

    // WordPress এর আসল হ্যাশটা এখানে ধরছি
    const storedHash = user.legacy_password_hash;
    console.log("🔑 Stored Hash:", storedHash);

    const inputPass = "test"; // তোর ক্লায়েন্টের দেওয়া টেস্ট পাসওয়ার্ড

    // WordPress logic দিয়ে চেক
    const isMatch = checkPassword(inputPass, storedHash);

    if (isMatch) {
      console.log("🎉 SUCCESS: Password matched! Login successful.");
    } else {
      console.log("🚫 FAILED: Password did not match.");
      console.log(
        "Tip: Check if the hash in DB starts with $P$ or $H$ or $wp$",
      );
    }
  } catch (error) {
    console.error("❗ Error occurred:", error);
  } finally {
    await client.close();
    console.log("--- Test Finished ---");
  }
}

main().catch(console.error);
