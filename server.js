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
const dbFile = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT secret (use env var in production)
const JWT_SECRET = process.env.JWT_SECRET || 'superdevsecret123';

// OAuth credentials (set in production)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/auth/google/callback';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'your-discord-client-id';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'your-discord-client-secret';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:4000/auth/discord/callback';

// Initialize lowdb
const adapter = new JSONFile(dbFile);
const defaultData = { users: [], products: [], topups: [], orders: [] };
const db = new Low(adapter, defaultData);

await db.read();
if (!db.data) db.data = defaultData;
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

// ---------- GOOGLE OAUTH ----------
app.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=profile%20email`;
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code');
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(400).send(tokenData.error);
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const { email, name, id: googleId } = profile;
    await db.read();
    let user = db.data.users.find(u => u.email === email);
    if (!user) {
      user = {
        id: nextId(db.data.users),
        username: name || email.split('@')[0],
        email,
        googleId,
        credit: 0,
        createdAt: new Date().toISOString(),
      };
      db.data.users.push(user);
      await db.write();
    }
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:5173/login?token=${token}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Google auth error');
  }
});

// ---------- DISCORD OAUTH ----------
app.get('/auth/discord', (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(url);
});

app.get('/auth/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code');
  try {
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
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const { email, username, id: discordId } = profile;
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
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:5173/login?token=${token}`);
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

// ---------- PRODUCTS ----------
app.get('/products', async (req, res) => {
  await db.read();
  res.json(db.data.products);
});

app.get('/products/:id', async (req, res) => {
  await db.read();
  const item = db.data.products.find(p => p.id === Number(req.params.id));
  item ? res.json(item) : res.status(404).json({ error: 'Not found' });
});

app.post('/products', authMiddleware, async (req, res) => {
  await db.read();
  const newItem = { id: nextId(db.data.products), ...req.body };
  db.data.products.push(newItem);
  await db.write();
  res.status(201).json(newItem);
});

app.delete('/products/:id', authMiddleware, async (req, res) => {
  await db.read();
  db.data.products = db.data.products.filter(p => p.id !== Number(req.params.id));
  await db.write();
  res.status(204).end();
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

app.get('/topups', authMiddleware, async (req, res) => {
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

// ---------- Start ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 BIT SHOP API running at http://localhost:${PORT}`);
});
