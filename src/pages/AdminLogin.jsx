import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/products');
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <section className="auth-page admin-login">
      <div className="container">
        <h2 className="section-title">Admin Login</h2>
        {error && <p className="error-msg">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    </section>
  );
}

export default AdminLogin;
