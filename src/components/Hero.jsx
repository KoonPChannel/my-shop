import './Hero.css';
import { useEffect, useRef } from 'react';

function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / 50;
      const deltaY = (e.clientY - centerY) / 50;

      hero.style.setProperty('--mouse-x', `${deltaX}px`);
      hero.style.setProperty('--mouse-y', `${deltaY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero" ref={heroRef} style={{ '--mouse-x': '0px', '--mouse-y': '0px' }}>
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
