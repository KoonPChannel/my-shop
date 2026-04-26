import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { username, email, password } = e.target.elements;
    const res = await register({
      username: username.value,
      email: email.value,
      password: password.value
    });
    if (res.token) {
      navigate('/');
    } else {
      setError(res.error || 'สมัครไม่สำเร็จ');
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <h2 className="section-title">สมัครสมาชิก</h2>
        <p className="section-subtitle">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
        {error && <p className="error-msg">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            ชื่อผู้ใช้
            <input name="username" required placeholder="username" />
          </label>
          <label>
            อีเมล
            <input name="email" type="email" required placeholder="email@domain.com" />
          </label>
          <label>
            รหัสผ่าน
            <input name="password" type="password" required placeholder="••••••" minLength="6" />
          </label>
          <button type="submit" className="btn-primary">สมัครสมาชิก</button>
        </form>
        {/* Social buttons */}
        <div className="social-section">
          <p className="social-text">หรือสมัครด้วย</p>
          <button type="button" onClick={() => window.location.href='http://localhost:4000/auth/discord'} className="social-btn discord">
            <img src="/logo/discord-logo.png" alt="Discord" className="social-logo" />
            <span>Discord</span>
          </button>
        </div>

        <p className="switch-link">
          มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;
