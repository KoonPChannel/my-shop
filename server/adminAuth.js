import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(file);
const defaultData = { users: [], products: [], topups: [], orders: [], admins: [] };
const db = new Low(adapter, defaultData);

await db.read();
if (!db.data) db.data = defaultData;
if (!db.data.admins) db.data.admins = [];
if (!db.data.products) db.data.products = [];
await db.write();

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = db.data.admins.find(a => a.username === username);
  if (!admin) return res.json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    'superdevsecret123',
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// Create first admin (one-time setup)
router.post('/setup', async (req, res) => {
  if (db.data.admins.length > 0) return res.json({ error: 'Admin already exists' });

  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = {
    id: Date.now().toString(),
    username,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  db.data.admins.push(admin);
  await db.write();
  res.json({ success: true });
});

export default router;
