import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', price: '', oldPrice: '', category: 'general', description: '', stock: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  // Load existing product if editing
  useEffect(() => {
    if (!isEdit) return;
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    fetch(`http://localhost:4000/admin/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const product = data.find(p => p.id === id);
        if (product) {
          setForm({
            name: product.name || '',
            price: product.price?.toString() || '',
            oldPrice: product.oldPrice?.toString() || '',
            category: product.category || 'general',
            description: product.description || '',
            stock: product.stock?.toString() || ''
          });
        }
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    const url = isEdit
      ? `http://localhost:4000/admin/products/${id}`
      : 'http://localhost:4000/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    if (image) formData.append('image', image);

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) navigate('/admin/products');
    else {
      const data = await res.json();
      setError(data.error || 'Save failed');
    }
  };

  return (
    <div className="admin-page">
      <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
      {error && <p className="error-msg">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Price
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </label>
        <label>
          Old Price (optional)
          <input name="oldPrice" type="number" value={form.oldPrice} onChange={handleChange} />
        </label>
        <label>
          Category
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="general">General</option>
            <option value="weapon">Weapon</option>
            <option value="skin">Skin</option>
            <option value="pet">Pet</option>
            <option value="gamepass">GamePass</option>
          </select>
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>
        <label>
          Stock
          <input name="stock" type="number" value={form.stock} onChange={handleChange} />
        </label>
        <label>
          Image
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-primary">{isEdit ? 'Update' : 'Create'}</button>
          <Link to="/admin/products" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default AdminProductForm;
