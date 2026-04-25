import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
      </div>
      <div className="container">
        <div className="hero-badge">Premium Marketplace</div>
        <h1 className="hero-title">
          คลังเกม<br />
          <span className="gradient-text">Roblox & เกมออนไลน์</span>
        </h1>
        <p className="hero-subtitle">
          ซื้อขายไอเท็มลับ จับจองไอดีเกมหายาก พร้อมระบบชำระเงินที่ปลอดภัย สำหรับนักเล่นเกมตัวยง
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary">เลือกซื้อเลย</button>
          <button className="btn btn-outline">ดูไอเท็มแนะนำ</button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">10,000+</span>
            <span className="stat-label">ไอเท็มพร้อมขาย</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">5,000+</span>
            <span className="stat-label">ลูกค้าที่ไว้วางใจ</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">อัตราความสำเร็จ</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
