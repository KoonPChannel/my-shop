import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default function adminAuth(db) {
  const router = express.Router();
  const JWT_SECRET = process.env.JWT_SECRET || 'superdevsecret123';

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    await db.read();
    if (!db.data.admins) db.data.admins = [];
    const admin = db.data.admins.find(a => a.username === username);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  });

  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    await db.read();
    if (!db.data.admins) db.data.admins = [];
    if (db.data.admins.find(a => a.username === username)) return res.status(409).json({ error: 'Admin exists' });
    const hash = await bcrypt.hash(password, 10);
    const admin = { id: uuidv4(), username, passwordHash: hash, role: 'admin' };
    db.data.admins.push(admin);
    await db.write();
    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ token, admin: { id: admin.id, username } });
  });

  return router;
}
