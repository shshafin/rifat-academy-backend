const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

const creds = [
  { login: "mdanamulhaque.ma@gmail.com", pass: "@n@m7)50h@que" },
  { login: "ridwanulislam972", pass: "maruf*&%#@@#%&*829" },
  { login: "videofun476@gmail.com", pass: "Dg827dp0)naov%5^XdDh6AN9" },
  {
    login: "abirmaruf506612@gmail.com",
    pass: "ferdausmd@@225599.com@123d%com",
  },
  { login: "maruf0178", pass: "ridwanul*&%#@#%&*0178" },
];

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("rifatacademy");

  for (const c of creds) {
    const user = await db.collection("users").findOne({
      $or: [
        { email: c.login.toLowerCase() },
        { username: c.login.toLowerCase() },
      ],
    });

    if (!user) {
      console.log("NOT FOUND:", c.login);
      continue;
    }

    const hash2y = user.legacy_password_hash.replace("$wp$2y$", "$2y$");
    const hash2a = user.legacy_password_hash.replace("$wp$2y$", "$2a$");
    const ok2y = bcrypt.compareSync(c.pass, hash2y);
    const ok2a = bcrypt.compareSync(c.pass, hash2a);

    console.log(ok2y || ok2a ? "✅ OK   :" : "❌ WRONG:", c.login);
    console.log("   hash prefix:", user.legacy_password_hash.substring(0, 15));
  }

  await client.close();
}

main().catch(console.error);
