const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";

const creds = [
  { login: "mdanamulhaque.ma@gmail.com", pass: "@n@m7)50h@que" },
  { login: "ridwanulislam972", pass: "maruf*&%#@@#%&*829" },
  { login: "videofun476@gmail.com", pass: "Dg827dp0)naov%5^XdDh6AN9" },
  { login: "academymaruf@12704", pass: "ferdausmd@@225599.com@123d%com" },
  { login: "Rifathossen678907654", pass: "pjisAe4aX1$4)PbT2hvykbw7" },
  { login: "khanShobur123", pass: "khan#%@&017208" },
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
      console.log("NOT FOUND :", c.login);
      continue;
    }

    const hash = user.legacy_password_hash.replace("$wp$", "$");
    const ok = bcrypt.compareSync(c.pass, hash);
    console.log(ok ? "✅ OK    :" : "❌ WRONG :", c.login, "->", user.email);
  }

  await client.close();
}

main().catch(console.error);
