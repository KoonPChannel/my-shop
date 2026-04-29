/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') throw new Error();
      setAdmin(payload);
    } catch {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (!admin) return <p>Loading...</p>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-logo">BIT SHOP Admin</h2>
        <nav className="admin-nav">
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/products/new">Add Product</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/topups">TopUps</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
