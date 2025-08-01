import React, { useEffect, useState, useCallback } from 'react';
import './ProductList.css';

const ITEMS_PER_PAGE = 10;

export default function ProductList({ newProduct, filter = 'all' }) {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', quantity: '', expiry_date: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('name'); // default sort by name
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const fetchProducts = useCallback(async () => {
    let url = 'http://localhost:5000/api/products';
    if (filter === 'expired') url += '/expired';
    else if (filter === 'near-expiry') url += '/near-expiry';

    try {
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
      setCurrentPage(1); // reset to first page when products update
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, newProduct]);

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'expiry_date') {
      valA = valA ? new Date(valA) : new Date(8640000000000000); // max date if null
      valB = valB ? new Date(valB) : new Date(8640000000000000);
    }

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter by search term
  const filteredProducts = sortedProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handlers: delete, edit start/cancel/change/submit (unchanged)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      name: product.name,
      quantity: product.quantity,
      expiry_date: product.expiry_date ? product.expiry_date.split('T')[0] : '',
    });
  };

  const cancelEdit = () => setEditingId(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (id) => {
    const { name, quantity, expiry_date } = editFormData;

    if (!name || quantity === '') {
      alert('Name and quantity are required.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity: parseInt(quantity, 10),
          expiry_date: expiry_date || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update');

      const updatedProduct = await res.json();
      setProducts(products.map(p => (p.id === id ? updatedProduct : p)));
      setEditingId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  // Expiry check helpers
  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr).setHours(0, 0, 0, 0);
    return expiry < today;
  };

  const isNearExpiry = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Inventory Products</h2>

      <input
        type="text"
        className="search-input"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table className="products-table">
        <thead>
          <tr>
            <th
              onClick={() => handleSortChange('name')}
              style={{ cursor: 'pointer' }}
              title="Sort by Name"
            >
              Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              onClick={() => handleSortChange('quantity')}
              style={{ cursor: 'pointer' }}
              title="Sort by Quantity"
            >
              Quantity {sortField === 'quantity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th
              onClick={() => handleSortChange('expiry_date')}
              style={{ cursor: 'pointer' }}
              title="Sort by Expiry Date"
            >
              Expiry Date {sortField === 'expiry_date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedProducts.map(prod => (
            <tr key={prod.id} className={isExpired(prod.expiry_date) ? 'expired-row' : ''}>
              {editingId === prod.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="expiry_date"
                      value={editFormData.expiry_date}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <button onClick={() => submitEdit(prod.id)}>Save</button>{' '}
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{prod.name}</td>
                  <td>
                    {prod.quantity}
                    {prod.quantity < 5 && <span className="badge low-stock">Low</span>}
                  </td>
                  <td>
                    {prod.expiry_date ? (
                      <>
                        {prod.expiry_date}
                        {isExpired(prod.expiry_date) && <span className="badge expired">Expired</span>}
                        {!isExpired(prod.expiry_date) && isNearExpiry(prod.expiry_date) && (
                          <span className="badge near-expiry">Near Expiry</span>
                        )}
                      </>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <button onClick={() => startEdit(prod)}>Edit</button>{' '}
                    <button onClick={() => handleDelete(prod.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
