import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { email, password } = e.target.elements;
    const res = await login({ email: email.value, password: password.value });
    if (res.token) navigate('/');
    else setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
  };

  return (
    <section className="auth-page">
      <div className="container">
        <h2 className="section-title">เข้าสู่ระบบ</h2>
        {error && <p className="error-msg">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            อีเมล
            <input name="email" type="email" required placeholder="email@domain.com" />
          </label>
          <label>
            รหัสผ่าน
            <input name="password" type="password" required placeholder="••••••" />
          </label>
          <button type="submit" className="btn-primary">เข้าสู่ระบบ</button>
        </form>

        {/* Social buttons */}
        <div className="social-section">
          <p className="social-text">หรือเข้าสู่ระบบด้วย</p>
          <button type="button" onClick={() => window.location.href='https://my-shop-zeta-five.vercel.app/auth/discord'} className="social-btn discord">
            <img src="/logo/discord-logo.png" alt="Discord" className="social-logo" />
            <span>Discord</span>
          </button>
        </div>

        <p className="switch-link">
          ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
