import './Categories.css';

const categories = [
  { icon: '🎮', name: 'Roblox Items', desc: 'ไอเท็มหายาก Limited อันเดอร์', color: '#00d4ff' },
  { icon: '👤', name: 'Roblox Accounts', desc: 'ไอดีแรร์ มีเรดไนน์ บลูไนน์', color: '#a855f7' },
  { icon: '💎', name: 'Robux Top-up', desc: 'เติม Robux ราคาถูก ปลอดภัย', color: '#ec4899' },
  { icon: '🏆', name: 'Game Accounts', desc: 'ไอดีเกมอื่นๆ ราคาดี', color: '#22c55e' },
  { icon: '🎨', name: 'Custom Avatar', desc: 'ออกแบบอวาตาร์สวยปัง', color: '#f97316' },
  { icon: '🔥', name: 'Hot Deals', desc: 'โปรโมชั่นจัดหนัก จัดเต็ม', color: '#ef4444' },
];

function Categories() {
  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Categories</span>
          <h2 className="section-title">เลือกหมวดหมู่ที่คุณสนใจ</h2>
          <p className="section-subtitle">มีสินค้าให้เลือกครบครัน ทั้งไอเท็ม ไอดี และบริการเติมเงิน</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <div className="category-card" key={i} style={{ '--accent': cat.color }}>
              <div className="category-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
              <div className="category-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
