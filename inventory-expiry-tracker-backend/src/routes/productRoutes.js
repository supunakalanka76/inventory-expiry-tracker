// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/products - fetch all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// POST /api/products - add a new product
router.post('/', async (req, res) => {
  try {
    const { name, quantity, expiry_date } = req.body;

    // Basic validation
    if (!name || quantity == null) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, quantity, expiry_date) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, quantity, expiry_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting product:', err);
    res.status(500).json({ error: 'Server error while inserting product' });
  }
});

// PUT /api/products/:id - update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, expiry_date } = req.body;

    if (!name || quantity == null) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }

    const result = await pool.query(
      `UPDATE products SET name=$1, quantity=$2, expiry_date=$3 WHERE id=$4 RETURNING *`,
      [name, quantity, expiry_date || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Server error while updating product' });
  }
});

// DELETE /api/products/:id - delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id=$1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product: result.rows[0] });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Server error while deleting product' });
  }
});

// GET expired products (expiry_date before today)
router.get('/expired', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE ORDER BY expiry_date ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching expired products:', err);
    res.status(500).json({ error: 'Server error fetching expired products' });
  }
});

// GET near-expiry products (expiry_date within next 7 days)
router.get('/near-expiry', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products 
       WHERE expiry_date IS NOT NULL 
       AND expiry_date >= CURRENT_DATE 
       AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
       ORDER BY expiry_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching near-expiry products:', err);
    res.status(500).json({ error: 'Server error fetching near-expiry products' });
  }
});


module.exports = router;
