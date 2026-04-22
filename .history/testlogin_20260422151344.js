const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db("rifatacademy");
    const user = await db
      .collection("users")
      .findOne({ email: "test@gmail.com" });

    // ১. হ্যাশটা ক্লিন করে ট্রিম করে নেব
    const rawHash = user.legacy_password_hash.trim();
    const cleanHash = rawHash.replace("$wp$2y$", "$2a$"); // $2y$ এর বদলে $2a$ দিয়ে ট্রাই কর

    console.log("Original Hash Length:", rawHash.length);
    console.log("Cleaned Hash:", cleanHash);

    const inputPass = "test";

    // ২. ডিবাগিং এর জন্য একটা নতুন হ্যাশ জেনারেট করে দেখবো স্ট্রাকচার ঠিক আছে কি না
    const debugHash = bcrypt.hashSync(inputPass, 10);
    console.log("New Hash of 'test':", debugHash);

    // ৩. ফাইনাল চেক
    const isMatch = bcrypt.compareSync(inputPass, cleanHash);

    if (isMatch) {
      console.log("🎉 SUCCESS: Matched with $2a$ and trim!");
    } else {
      console.log("🚫 FAILED AGAIN.");
      // ৪. এটা একটা জোড়াতালি চেক (যদি ক্লায়েন্ট ভুল পাসওয়ার্ড দিয়ে থাকে)
      console.log(
        "Checking if hash is valid bcrypt:",
        /^\$2[ayb]\$.{56}$/.test(cleanHash),
      );
    }
  } finally {
    await client.close();
  }
}
main();
