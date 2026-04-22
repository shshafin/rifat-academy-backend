const bcrypt = require("bcryptjs"); // এখানে আবার bcryptjs লাগবে
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

    const storedHash = user.legacy_password_hash; // $wp$2y$10$LzW...
    const inputPass = "test";

    // ✅ ম্যাজিক ট্রিক: সামনের $wp$ টুকু ফেলে দাও
    // $wp$2y$ হয়ে যাবে $2y$ অথবা $2a$ (bcrypt standard)
    const cleanHash = storedHash.replace("$wp$2y$", "$2y$");

    console.log("🔍 Original Hash:", storedHash);
    console.log("🧼 Cleaned Hash:", cleanHash);

    // স্ট্যান্ডার্ড bcrypt দিয়ে চেক
    const isMatch = bcrypt.compareSync(inputPass, cleanHash);

    if (isMatch) {
      console.log("🎉 SUCCESS: Finally matched with Cleaned Bcrypt!");
    } else {
      // যদি $2y$ তে না মিলে, $2a$ দিয়েও একবার ট্রাই করি (সেফটি চেক)
      const cleanHashAlt = storedHash.replace("$wp$2y$", "$2a$");
      const isMatchAlt = bcrypt.compareSync(inputPass, cleanHashAlt);

      if (isMatchAlt) {
        console.log("🎉 SUCCESS: Matched with $2a$ version!");
      } else {
        console.log("🚫 STILL FAILED: Pass/Hash mismatch logic error.");
      }
    }
  } catch (error) {
    console.error("❗ Error:", error);
  } finally {
    await client.close();
    console.log("--- Test Finished ---");
  }
}

main().catch(console.error);
