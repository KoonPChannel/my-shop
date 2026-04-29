import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export default function adminProducts(db) {
  const router = express.Router();

  const isVercel = process.env.VERCEL === '1';
  const uploadsDir = path.resolve('public/uploads');

  // Configure multer for image uploads:
  // - Local: diskStorage so we can serve via `server.mjs` static middleware
  // - Vercel: memoryStorage (we currently don't persist files, so we avoid `/uploads/undefined`)
  const storage = isVercel
    ? multer.memoryStorage()
    : multer.diskStorage({
      destination: (req, file, cb) => {
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '';
        const base = path
          .basename(file.originalname, ext)
          .replace(/[^a-z0-9_-]/gi, '')
          .slice(0, 50);
        cb(null, `${Date.now()}-${base}${ext}`);
      },
    });

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

  const getImagePath = (file) => {
    if (!file) return null;
    // diskStorage sets `filename`, memoryStorage doesn't.
    if (!file.filename) return null;
    return `/uploads/${file.filename}`;
  };

// GET all products (admin) - protected by requireAdmin in server.js
router.get('/products', async (req, res) => {
  try {
    // use shared db instance
    await db.read();
    const products = (db.data.products || []).map((p) => ({
      ...p,
      // Guard against historical bad values from memoryStorage (`/uploads/undefined`)
      image: p.image === '/uploads/undefined' ? null : p.image,
    }));
    res.json(products);
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
      image: getImagePath(req.file),
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
    if (req.file) product.image = getImagePath(req.file);

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

  return router;
}
