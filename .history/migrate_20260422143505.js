const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGO_URI =
  "mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0";
const DB_NAME = "rifatacademy";
const JSON_PATH =
  "C:/Users/Shafin 07/Downloads/wp-nodejs-relational-export-2026-04-22-081241.json";
const BATCH_SIZE = 1000;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function decodeSlug(slug) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function toDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function mapRole(roles) {
  if (roles.includes("administrator")) return "super_admin";
  if (roles.includes("tutor_instructor")) return "admin";
  return "student";
}

async function insertBatch(collection, docs) {
  if (docs.length === 0) return 0;
  try {
    const res = await collection.insertMany(docs, { ordered: false });
    return res.insertedCount;
  } catch (e) {
    // ordered:false te duplicate skip kore baki insert hoy
    return e.result?.insertedCount || 0;
  }
}

async function main() {
  log("JSON file loading...");
  const raw = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  log(
    `Loaded — users: ${raw.users.length}, courses: ${raw.courses.length}, enrollments: ${raw.enrollments.length}, orders: ${raw.orders.length}`,
  );

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  log("MongoDB connected");

  const db = client.db(DB_NAME);

  // ── 1. COURSES ────────────────────────────────────────────
  log("Migrating courses...");
  const courseMap = {}; // legacy_id → _id (UUID)
  const courseSlugMap = {}; // encoded slug → _id

  const courseDocs = raw.courses.map((c) => {
    const durationMin =
      parseInt(c.settings?.duration?.hours || 0) * 60 +
      parseInt(c.settings?.duration?.minutes || 0);
    courseMap[c.legacy_wp_course_id] = c.id;
    courseSlugMap[c.slug] = c.id;
    courseSlugMap[decodeSlug(c.slug)] = c.id;
    return {
      _id: c.id,
      legacy_id: c.legacy_wp_course_id,
      title: c.title,
      slug: decodeSlug(c.slug),
      slug_raw: c.slug,
      status: c.status === "publish" ? "published" : c.status,
      price_type: c.price_type,
      price: parseFloat(c.price) || 0,
      sale_price: c.sale_price ? parseFloat(c.sale_price) : null,
      excerpt: c.excerpt || "",
      thumbnail: c.settings?.featured_image || null,
      level: c.settings?.course_level || null,
      duration_min: durationMin,
      is_free: c.price_type === "free",
      drm_enabled: false,
      total_enrolled: 0,
      average_rating: 0,
      total_reviews: 0,
      facebook_group_url: null,
      meta_title: c.title,
      meta_description: c.excerpt || "",
      created_at: toDate(c.created_at),
      updated_at: toDate(c.updated_at),
    };
  });

  await db
    .collection("courses")
    .drop()
    .catch(() => {});
  await db.collection("courses").insertMany(courseDocs);
  await db.collection("courses").createIndex({ slug: 1 }, { unique: true });
  await db.collection("courses").createIndex({ legacy_id: 1 });
  await db.collection("courses").createIndex({ status: 1 });
  log(`Courses done: ${courseDocs.length}`);

  // ── 2. USERS ──────────────────────────────────────────────
  log("Migrating users... (this will take a while)");
  const userEmailMap = {}; // email → _id

  await db
    .collection("users")
    .drop()
    .catch(() => {});
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ legacy_id: 1 });

  let userInserted = 0;
  for (let i = 0; i < raw.users.length; i += BATCH_SIZE) {
    const batch = raw.users.slice(i, i + BATCH_SIZE).map((u) => {
      userEmailMap[u.email] = u.id;
      return {
        _id: u.id,
        legacy_id: u.legacy_wp_user_id,
        email: u.email,
        username: u.username,
        display_name: u.display_name,
        first_name: u.profile?.first_name || "",
        last_name: u.profile?.last_name || "",
        phone: u.profile?.billing?.phone || "",
        role: mapRole(u.roles || []),
        legacy_password_hash: u.legacy_password_hash,
        avatar: u.profile?.media?.profile_photo_url || null,
        billing: u.profile?.billing || {},
        social: u.profile?.social || {},
        is_active: true,
        registered_at: toDate(u.registered_at),
        created_at: toDate(u.registered_at),
      };
    });
    userInserted += await insertBatch(db.collection("users"), batch);
    if ((i / BATCH_SIZE) % 10 === 0)
      log(
        `  Users progress: ${Math.min(i + BATCH_SIZE, raw.users.length)}/${raw.users.length}`,
      );
  }
  log(`Users done: ${userInserted}`);

  // ── 3. ORDERS ─────────────────────────────────────────────
  log("Migrating orders...");
  const orderMap = {}; // legacy_wc_order_id → _id

  await db
    .collection("orders")
    .drop()
    .catch(() => {});
  await db.collection("orders").createIndex({ legacy_id: 1 });
  await db.collection("orders").createIndex({ user_id: 1 });

  let orderInserted = 0;
  for (let i = 0; i < raw.orders.length; i += BATCH_SIZE) {
    const batch = raw.orders.slice(i, i + BATCH_SIZE).map((o) => {
      orderMap[o.legacy_wc_order_id] = o.id;
      const userId = userEmailMap[o.user_ref?.email] || null;
      return {
        _id: o.id,
        legacy_id: o.legacy_wc_order_id,
        user_id: userId,
        user_email: o.user_ref?.email || o.billing_email || "",
        status: o.status,
        currency: o.currency || "BDT",
        total_amount: parseFloat(o.total_amount) || 0,
        payment_method: o.payment_method || "",
        payment_method_title: o.payment_method_title || "",
        items: (o.items || []).map((item) => ({
          order_item_id: item.order_item_id,
          legacy_product_id: item.legacy_wc_product_id,
          name: item.name,
          qty: item.qty || 1,
          line_subtotal: parseFloat(item.line_subtotal) || 0,
          line_total: parseFloat(item.line_total) || 0,
        })),
        created_at: toDate(o.created_at),
      };
    });
    orderInserted += await insertBatch(db.collection("orders"), batch);
    if ((i / BATCH_SIZE) % 10 === 0)
      log(
        `  Orders progress: ${Math.min(i + BATCH_SIZE, raw.orders.length)}/${raw.orders.length}`,
      );
  }
  log(`Orders done: ${orderInserted}`);

  // ── 4. ENROLLMENTS ────────────────────────────────────────
  log("Migrating enrollments...");
  await db
    .collection("enrollments")
    .drop()
    .catch(() => {});
  await db.collection("enrollments").createIndex({ user_id: 1 });
  await db.collection("enrollments").createIndex({ course_id: 1 });
  await db
    .collection("enrollments")
    .createIndex({ user_email: 1, course_id: 1 });

  let enrollInserted = 0;
  for (let i = 0; i < raw.enrollments.length; i += BATCH_SIZE) {
    const batch = raw.enrollments.slice(i, i + BATCH_SIZE).map((e) => {
      const userId = userEmailMap[e.user_ref?.email] || null;
      const courseId =
        courseMap[e.course_ref?.legacy_wp_course_id] ||
        courseSlugMap[e.course_ref?.slug] ||
        null;
      const orderId = orderMap[e.order_ref?.legacy_wc_order_id] || null;
      return {
        _id: e.id,
        legacy_id: e.legacy_wp_enrollment_id,
        user_id: userId,
        user_email: e.user_ref?.email || "",
        course_id: courseId,
        order_id: orderId,
        legacy_order_id: e.order_ref?.legacy_wc_order_id || null,
        status: e.status,
        is_active: e.status === "completed",
        enrolled_at: toDate(e.enrolled_at),
        expires_at: null,
        progress: {
          completed_modules: [],
          last_accessed_module: null,
          percent: 0,
        },
      };
    });
    enrollInserted += await insertBatch(db.collection("enrollments"), batch);
    if ((i / BATCH_SIZE) % 10 === 0)
      log(
        `  Enrollments progress: ${Math.min(i + BATCH_SIZE, raw.enrollments.length)}/${raw.enrollments.length}`,
      );
  }
  log(`Enrollments done: ${enrollInserted}`);

  // ── 5. Update course total_enrolled ──────────────────────
  log("Updating course enrollment counts...");
  const pipeline = [
    { $match: { status: "completed" } },
    { $group: { _id: "$course_id", count: { $sum: 1 } } },
  ];
  const counts = await db
    .collection("enrollments")
    .aggregate(pipeline)
    .toArray();
  for (const c of counts) {
    if (c._id)
      await db
        .collection("courses")
        .updateOne({ _id: c._id }, { $set: { total_enrolled: c.count } });
  }
  log("Course counts updated");

  // ── FINAL REPORT ──────────────────────────────────────────
  const uCount = await db.collection("users").countDocuments();
  const cCount = await db.collection("courses").countDocuments();
  const eCount = await db.collection("enrollments").countDocuments();
  const oCount = await db.collection("orders").countDocuments();

  log("");
  log("══════════════════════════════════════");
  log("  MIGRATION COMPLETE");
  log("══════════════════════════════════════");
  log(`  users       : ${uCount}`);
  log(`  courses     : ${cCount}`);
  log(`  enrollments : ${eCount}`);
  log(`  orders      : ${oCount}`);
  log("══════════════════════════════════════");

  await client.close();
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
