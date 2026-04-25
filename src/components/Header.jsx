import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">BIT SHOP</h1>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'active' : '')}>สินค้า</NavLink>
          <NavLink to="/topup" className={({ isActive }) => (isActive ? 'active' : '')}>เติมเงิน</NavLink>
          <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>ประวัติ</NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>ติดต่อ</NavLink>

          {user ? (
            <>
              <span className="user-info">
                {user.username} | เครดิต: {user.credit}
              </span>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <div className="auth-dropdown">
              <button className="auth-btn">Register / Login ▾</button>
              <div className="dropdown-content">
                <NavLink to="/register" className="dropdown-item">Register</NavLink>
                <NavLink to="/login" className="dropdown-item">Login</NavLink>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
