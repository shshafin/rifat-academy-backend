const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  const hash =
    "$wp$2y$10$ZKcdGC9pKgRMhcXH/gJQ4uUQ5H1sBXnCNBh2q9MygRWmUNRSwb0Oe";
  const pass = "@n@m7)50h@que";

  const hash2y = hash.replace("$wp$2y$", "$2y$");
  const hash2a = hash.replace("$wp$2y$", "$2a$");

  console.log("Pass:", pass);
  console.log("Try $2y$:", bcrypt.compareSync(pass, hash2y));
  console.log("Try $2a$:", bcrypt.compareSync(pass, hash2a));

  const hashRaw = hash.replace("$wp$", "");
  console.log("Try raw:", bcrypt.compareSync(pass, hashRaw));

  await client.close();
}

main().catch(console.error);
