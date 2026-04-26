import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src="/logo/Gemini_Generated_Image_4qreqy4qreqy4qre.png" alt="BIT SHOP" className="logo-img" />
            <span className="logo-text">BIT SHOP</span>
          </Link>
        </div>

        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">สินค้า</NavLink>
          <NavLink to="/topup">เติมเงิน</NavLink>
          <NavLink to="/history">ประวัติ</NavLink>
          <NavLink to="/contact">ติดต่อ</NavLink>

          {user ? (
            <div className="user-section">
              <span className="user-info">
                {user.username} ({user.credit} เครดิต)
              </span>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="dropdown-wrapper">
              <button className="dropdown-trigger">
                Register / Login ▾
              </button>
              <div className="dropdown-menu">
                <Link to="/register" className="dropdown-link">Register</Link>
                <Link to="/login" className="dropdown-link">Login</Link>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
