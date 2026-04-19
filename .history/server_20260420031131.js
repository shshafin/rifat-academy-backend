const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://shafinsadnan08_db_user:GtertZG5SPLEeTx9@cluster0.kz9hwgz.mongodb.net/?appName=Cluster0';
const DB_NAME = 'rifatacademy';
const JWT_SECRET = 'rifat_demo_secret_2026';

let db;

// ── DB Connect ────────────────────────────────────────────────
async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('MongoDB connected');
}

// ── WP password verify ────────────────────────────────────────
// WordPress stores hash as $wp$2y$... but bcrypt needs $2y$...
function verifyWPPassword(plainPassword, wpHash) {
  try {
    // Remove $wp$ prefix
    const bcryptHash = wpHash.replace('$wp$', '$');
    return bcrypt.compareSync(plainPassword, bcryptHash);
  } catch {
    return false;
  }
}

// ── Auth middleware ───────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// ── POST /api/login ───────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isValid = verifyWPPassword(password, user.legacy_password_hash);
    if (!isValid)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        registered_at: user.registered_at,
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/student/enrollments ──────────────────────────────
app.get('/api/student/enrollments', auth, async (req, res) => {
  try {
    const enrollments = await db.collection('enrollments')
      .find({ user_id: req.user.id, is_active: true })
      .sort({ enrolled_at: -1 })
      .toArray();

    // Get course details for each enrollment
    const courseIds = enrollments.map(e => e.course_id).filter(Boolean);
    const courses = await db.collection('courses')
      .find({ _id: { $in: courseIds } })
      .toArray();

    const courseMap = {};
    courses.forEach(c => { courseMap[c._id] = c; });

    const result = enrollments.map(e => ({
      enrollment_id: e._id,
      enrolled_at: e.enrolled_at,
      status: e.status,
      progress: e.progress,
      course: courseMap[e.course_id] ? {
        id: courseMap[e.course_id]._id,
        title: courseMap[e.course_id].title,
        thumbnail: courseMap[e.course_id].thumbnail,
        price: courseMap[e.course_id].price,
        sale_price: courseMap[e.course_id].sale_price,
        level: courseMap[e.course_id].level,
        total_enrolled: courseMap[e.course_id].total_enrolled,
        status: courseMap[e.course_id].status,
      } : null,
    }));

    res.json({ success: true, data: result, total: result.length });
  } catch (e) {
    console.error('Enrollments error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/student/orders ───────────────────────────────────
app.get('/api/student/orders', auth, async (req, res) => {
  try {
    const orders = await db.collection('orders')
      .find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .toArray();

    // Normalize WooCommerce status
    function normalizeStatus(status) {
      const map = {
        'wc-completed': 'completed',
        'wc-on-hold': 'on-hold',
        'wc-pending': 'pending',
        'wc-processing': 'processing',
        'wc-cancelled': 'cancelled',
        'wc-refunded': 'refunded',
        'wc-failed': 'failed',
        'completed': 'completed',
        'processing': 'processing',
      };
      return map[status] || status;
    }

    const result = orders.map(o => ({
      id: o._id,
      legacy_id: o.legacy_id,
      status: normalizeStatus(o.status),
      currency: o.currency,
      total_amount: o.total_amount,
      payment_method: o.payment_method,
      payment_method_title: o.payment_method_title,
      items: o.items,
      created_at: o.created_at,
    }));

    res.json({ success: true, data: result, total: result.length });
  } catch (e) {
    console.error('Orders error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/student/profile ──────────────────────────────────
app.get('/api/student/profile', auth, async (req, res) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: req.user.id },
      { projection: { legacy_password_hash: 0 } }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/courses ──────────────────────────────────────────
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.collection('courses')
      .find({ status: 'published' })
      .sort({ total_enrolled: -1 })
      .limit(20)
      .toArray();
    res.json({ success: true, data: courses, total: courses.length });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── Start ─────────────────────────────────────────────────────
const PORT = 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API endpoints:');
    console.log('  POST http://localhost:5000/api/login');
    console.log('  GET  http://localhost:5000/api/student/enrollments');
    console.log('  GET  http://localhost:5000/api/student/orders');
    console.log('  GET  http://localhost:5000/api/student/profile');
    console.log('  GET  http://localhost:5000/api/courses');
  });
}).catch(e => {
  console.error('DB connection failed:', e.message);
  process.exit(1);
});