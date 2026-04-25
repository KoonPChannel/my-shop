import './Footer.css';

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h2 className="logo">BIT SHOP</h2>
            <p>ตลาดซื้อขายไอเท็มและไอดีเกมที่ใหญ่ที่สุดในไทย เชื่อถือได้ ปลอดภัย ราคาดี</p>
          </div>
          <div className="footer-links">
            <h4>หมวดหมู่</h4>
            <a href="#">Roblox Items</a>
            <a href="#">Roblox Accounts</a>
            <a href="#">Robux Top-up</a>
            <a href="#">Game Accounts</a>
          </div>
          <div className="footer-links">
            <h4>สนับสนุน</h4>
            <a href="#">วิธีสั่งซื้อ</a>
            <a href="#">เงื่อนไขการใช้</a>
            <a href="#">นโยบายความปลอดภัย</a>
            <a href="#">ติดต่อเรา</a>
          </div>
          <div className="footer-links">
            <h4>ช่องทางติดต่อ</h4>
            <a href="#">Line: @gamevault</a>
            <a href="#">Discord: BIT SHOP</a>
            <a href="#">Email: support@gamevault.th</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 GameVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
