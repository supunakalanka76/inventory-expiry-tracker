// src/components/ProductForm.js
import React, { useState } from 'react';

export default function ProductForm({ onAdd }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !quantity) {
      alert('Please provide product name and quantity.');
      return;
    }

    const productData = {
      name,
      quantity: parseInt(quantity, 10),
      expiry_date: expiryDate || null,
    };

    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error('Failed to add product');

      const newProduct = await res.json();
      onAdd(newProduct);

      // Reset form
      setName('');
      setQuantity('');
      setExpiryDate('');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Product Name:<br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
            placeholder="e.g. Milk Powder"
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Quantity:<br />
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
            placeholder="e.g. 20"
          />
        </label>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Expiry Date:<br />
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </label>
      </div>
      <button type="submit" style={{ padding: '10px 20px' }}>Add Product</button>
    </form>
  );
}
