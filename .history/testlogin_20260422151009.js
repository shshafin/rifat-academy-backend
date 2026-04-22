const { checkPassword } = require("wordpress-hash-node");
const { MongoClient } = require("mongodb");

// ... (tora connection logic thakuk)

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  const user = await db
    .collection("users")
    .findOne({ email: "test@gmail.com" });

  if (!user) {
    console.log("User not found");
    return;
  }

  const plainPassword = "test"; // input password
  const hashedPassword = user.legacy_password_hash; // database e thaka hash

  // WordPress hash check korar direct way
  const isMatch = checkPassword(plainPassword, hashedPassword);

  if (isMatch) {
    console.log("Login Successful!");
  } else {
    console.log("Invalid Password");
  }

  await client.close();
}
