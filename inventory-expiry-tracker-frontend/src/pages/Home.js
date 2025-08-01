import React, { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

export default function Home() {
  const [filter, setFilter] = useState('all'); // 'all', 'expired', 'near-expiry'
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState(null);

  const fetchProducts = async (filterType) => {
    let url = 'http://localhost:5000/api/products';
    if (filterType === 'expired') url += '/expired';
    else if (filterType === 'near-expiry') url += '/near-expiry';

    try {
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchProducts(filter);
  }, [filter]);

  useEffect(() => {
    if (newProduct) {
      // Refetch products after adding new one
      fetchProducts(filter);
    }
  }, [newProduct, filter]);

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 16px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Inventory Dashboard</h1>
      <ProductForm onAdd={setNewProduct} />

      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>
          All Products
        </button>{' '}
        <button onClick={() => setFilter('expired')} disabled={filter === 'expired'}>
          Expired Products
        </button>{' '}
        <button onClick={() => setFilter('near-expiry')} disabled={filter === 'near-expiry'}>
          Near Expiry (7 days)
        </button>
      </div>

      <ProductList products={products} />
    </div>
  );
}
