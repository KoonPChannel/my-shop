import express from 'express';
import multer from 'multer';
import path from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, '..', 'db.json');
const adapter = new JSONFile(file);
const defaultData = { users: [], products: [], topups: [], orders: [], admins: [] };
const db = new Low(adapter, defaultData);

await db.read();
if (!db.data) db.data = defaultData;
if (!db.data.products) db.data.products = [];
// No write on import to avoid ENOENT

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// GET all products (admin view)
router.get('/products', async (req, res) => {
  await db.read();
  res.json(db.data.products || []);
});

// POST create product
router.post('/products', upload.single('image'), async (req, res) => {
  await db.read();
  const { name, price, oldPrice, category, description, stock } = req.body;

  const product = {
    id: uuid() || Date.now().toString(),
    name,
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : null,
    category: category || 'general',
    description: description || '',
    stock: Number(stock) || 0,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.data.products) db.data.products = [];
  db.data.products.push(product);
  await db.write();
  res.json({ success: true, product });
});

// PUT update product
router.put('/products/:id', upload.single('image'), async (req, res) => {
  await db.read();
  const { id } = req.params;
  const { name, price, oldPrice, category, description, stock } = req.body;

  const product = db.data.products?.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  Object.assign(product, {
    name: name || product.name,
    price: price ? Number(price) : product.price,
    oldPrice: oldPrice ? Number(oldPrice) : product.oldPrice,
    category: category || product.category,
    description: description || product.description,
    stock: stock ? Number(stock) : product.stock,
    updatedAt: new Date().toISOString()
  });

  if (req.file) {
    product.image = `/uploads/${req.file.filename}`;
  }

  await db.write();
  res.json({ success: true, product });
});

// DELETE product
router.delete('/products/:id', async (req, res) => {
  await db.read();
  const { id } = req.params;

  db.data.products = db.data.products?.filter(p => p.id !== id) || [];
  await db.write();
  res.json({ success: true });
});

export default router;
