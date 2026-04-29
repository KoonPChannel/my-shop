/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setProducts(data);
    else setError(data.error || 'Failed to load');
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    const token = localStorage.getItem('adminToken');
    const base = import.meta.env.VITE_API_URL || '';
    await fetch(`${base}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProducts();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Products</h2>
        <Link to="/admin/products/new" className="btn-primary">+ Add Product</Link>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="thumb" />
                ) : (
                  <span className="no-img">No image</span>
                )}
              </td>
              <td>{p.name}</td>
              <td>฿{p.price}</td>
              <td>{p.stock ?? 0}</td>
              <td>{p.category}</td>
              <td>
                <Link to={`/admin/products/edit/${p.id}`} className="btn-sm">Edit</Link>
                <button onClick={() => handleDelete(p.id)} className="btn-sm danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;
