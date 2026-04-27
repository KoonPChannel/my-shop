import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export default function adminProducts(db) {
  const router = express.Router();

  // Configure multer for image uploads (memory storage for Vercel)
  const isVercel = process.env.VERCEL === '1';
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|gif|webp/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype);
      if (ext && mime) cb(null, true);
      else cb(new Error('Only image files are allowed'));
    }
  });

// GET all products (admin) - protected by requireAdmin in server.js
router.get('/products', async (req, res) => {
  try {
    // use shared db instance
    await db.read();
    res.json(db.data.products || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST create product - protected by requireAdmin in server.js
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, oldPrice, category, description, stock, game } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    // use shared db instance
    await db.read();

    const product = {
      id: uuidv4(),
      name,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      category: category || 'uncategorized',
      game: game || 'Roblox',
      description: description || '',
      stock: parseInt(stock) || 0,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    db.data.products.push(product);
    await db.write();

    res.status(201).json({ product, message: 'Product created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product - protected by requireAdmin in server.js
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, oldPrice, category, description, stock } = req.body;

    // use shared db instance
    await db.read();
    const idx = db.data.products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const product = db.data.products[idx];
    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (oldPrice !== undefined) product.oldPrice = oldPrice ? parseFloat(oldPrice) : null;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await db.write();
    res.json({ product, message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product - protected by requireAdmin in server.js
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // use shared db instance
    await db.read();
    const idx = db.data.products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    db.data.products.splice(idx, 1);
    await db.write();

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});
