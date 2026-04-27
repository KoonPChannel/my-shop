import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.resolve('db.json');

import session from 'express-session';

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'superdevsecret123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://my-shop-zeta-five.vercel.app',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((req, res, next) => {
  // File upload validation middleware
  if (req.method === 'POST' && req.path === '/uploads') {
    if (req.files && req.files.file) {
      const file = req.files.file;
      if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
        return res.status(400).send('Invalid file type');
      }
      if (file.size > process.env.MAX_FILE_SIZE * 1024) {
        return res.status(400).send('File too large');
      }
    }
  }
  next();
});
app.use(express.json());

// JWT secret (use env var in production)
const JWT_SECRET = process.env.JWT_SECRET || 'superdevsecret123';

// OAuth credentials (set in production)
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:4000/auth/discord/callback';

// Initialize lowdb
const adapter = new JSONFile(dbFile);
const defaultData = { users: [], products: [], topups: [], orders: [] };
const db = new Low(adapter, defaultData);

await db.read();
if (!db.data) db.data = defaultData;
// Ensure all required arrays exist
if (!db.data.users) db.data.users = [];
if (!db.data.products) db.data.products = [];
if (!db.data.topups) db.data.topups = [];
if (!db.data.orders) db.data.orders = [];
await db.write();

// Helper: generate next ID
const nextId = (arr) => (arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1);

// ---------- MIDDLEWARE: auth ----------
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ---------- AUTH ROUTES ----------
// Register
app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  await db.read();
  if (db.data.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: nextId(db.data.users),
    username,
    email,
    passwordHash: hash,
    credit: 0,
    createdAt: new Date().toISOString()
  };
  db.data.users.push(newUser);
  await db.write();

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, credit: 0 } });
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  await db.read();
  const user = db.data.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, credit: user.credit } });
});

// Get current user info + credit
app.get('/auth/me', authMiddleware, async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, username: user.username, email: user.email, credit: user.credit });
});


// ---------- DISCORD OAUTH ----------
import crypto from 'crypto';

app.get('/auth/discord', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email&state=${state}`;
  res.redirect(url);
});

app.get('/auth/discord/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).send('Invalid OAuth state');
  }
  if (!code) return res.status(400).send('No code');
  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        redirect_uri: DISCORD_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(400).send(tokenData.error);

    // Retrieve user profile from Discord
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const { email, username, id: discordId } = profile;

    // Upsert user in our DB
    await db.read();
    let user = db.data.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: nextId(db.data.users),
        username: username || email.split('@')[0],
        email,
        discordId,
        credit: 0,
        createdAt: new Date().toISOString(),
      };
      db.data.users.push(user);
      await db.write();
    }

    // Store user id in session
    req.session.user = { id: user.id, username: user.username, email: user.email };

    // Generate JWT for client side (optional, kept for compatibility)
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend (use env var for production URL)
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendBase}/login?token=${token}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Discord auth error');
  }
});

// ---------- USERS CREDIT ----------
app.get('/me/credit', authMiddleware, async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ credit: user.credit });
});


// ---------- TOPUPS ----------
// Protected: user must be logged in
app.post('/topups', authMiddleware, async (req, res) => {
  await db.read();
  const { amount, price, type = 'Robux' } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // Add credit to user (1 THB = 1 credit, or adjust conversion)
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // If paid via TrueMoney, we assume price is what they paid, amount is credits they get
  // For simplicity: credit added = amount (or you can do price * conversion)
  const creditAdded = Number(amount);
  user.credit = (user.credit || 0) + creditAdded;

  const newTopup = {
    id: nextId(db.data.topups),
    userId: req.user.id,
    type,
    amount: creditAdded,
    price: price || 0,
    status: 'completed',
    date: new Date().toISOString()
  };
  db.data.topups.push(newTopup);
  await db.write();

  res.status(201).json({ topup: newTopup, credit: user.credit });
});

app.get('/topups', async (req, res) => {
  await db.read();
  const userTopups = db.data.topups.filter(t => t.userId === req.user.id);
  res.json(userTopups);
});

// ---------- ORDERS ----------
app.get('/orders', authMiddleware, async (req, res) => {
  await db.read();
  const userOrders = db.data.orders.filter(o => o.userId === req.user.id);
  res.json(userOrders);
});

app.post('/orders', authMiddleware, async (req, res) => {
  await db.read();
  const { productId, quantity = 1 } = req.body;
  const product = db.data.products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const user = db.data.users.find(u => u.id === req.user.id);
  const total = product.price * quantity;
  if (user.credit < total) {
    return res.status(400).json({ error: 'Insufficient credit' });
  }

  // Deduct credit
  user.credit -= total;

  const newOrder = {
    id: nextId(db.data.orders),
    userId: req.user.id,
    productId,
    quantity,
    total,
    status: 'completed',
    date: new Date().toISOString()
  };
  db.data.orders.push(newOrder);
  await db.write();

  res.status(201).json({ order: newOrder, credit: user.credit });
});

app.patch('/orders/:id', authMiddleware, async (req, res) => {
  await db.read();
  const order = db.data.orders.find(o => o.id === Number(req.params.id) && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  Object.assign(order, req.body);
  await db.write();
  res.json(order);
});

app.delete('/orders/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.orders = db.data.orders.filter(o => !(o.id === Number(req.params.id) && o.userId === req.user.id));
  await db.write();
  res.status(204).end();
});

import adminAuth from './server/adminAuth.js';
import adminProducts from './server/adminProducts.js';
// requireAdmin removed - admin routes are now open
import fs from 'fs';

// ---------- Public Product API ----------
app.get('/products', async (req, res) => {
  await db.read();
  res.json(db.data.products || []);
});

app.get('/products/:id', async (req, res) => {
  await db.read();
  const product = (db.data.products || []).find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Admin routes – open (no auth middleware)
// NOTE: This is an insecure demo setup; anyone can manage products.
app.use('/admin/auth', adminAuth);
app.use('/admin', adminProducts);

// ---------- Start ----------
const PORT = process.env.PORT || 4000;
// Do not listen in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 BIT SHOP API running at http://localhost:${PORT}`);
  });
}
export default app;
