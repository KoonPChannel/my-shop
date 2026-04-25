import { useState } from 'react';
import './Products.css';

const products = [
  { id: 1, name: 'Dominus Empyreus',   game: 'Roblox',   price: '฿45,000', oldPrice: '฿52,000', icon: '🔮', tag: 'Limited', cat: 'item' },
  { id: 2, name: 'Roblox Account Lvl 100+', game: 'Roblox', price: '฿3,200',  oldPrice: '฿4,500',  icon: '👤', tag: 'Account', cat: 'account' },
  { id: 3, name: '10,000 Robux Pack',       game: 'Roblox', price: '฿800',    oldPrice: '฿1,200',  icon: '💎', tag: 'Top-up', cat: 'topup' },
  { id: 4, name: 'Sparkle Time Fedora',      game: 'Roblox', price: '฿12,000', oldPrice: '฿15,000', icon: '🎩', tag: 'Limited', cat: 'item' },
  { id: 5, name: 'Slender Avatar Set',       game: 'Roblox', price: '฿2,500',  oldPrice: '฿3,200',  icon: '✨', tag: 'Bundle',  cat: 'item' },
  { id: 6, name: 'Gaming Account Bundle',    game: 'Multi',   price: '฿8,900',  oldPrice: '฿11,000', icon: '🎮', tag: 'Bundle',  cat: 'account' },
  { id: 7, name: '5,000 Robux Pack',         game: 'Roblox', price: '฿450',    oldPrice: '฿600',    icon: '💎', tag: 'Top-up', cat: 'topup' },
  { id: 8, name: 'Classic Domino Crown',     game: 'Roblox', price: '฿28,000', oldPrice: '฿32,000', icon: '👑', tag: 'Limited', cat: 'item' },
];

const filters = [
  { key: 'all',      label: 'ทั้งหมด' },
  { key: 'item',     label: 'ไอเท็ม' },
  { key: 'account',  label: 'ไอดีเกม' },
  { key: 'topup',    label: 'เติมเงิน' },
];

function Products() {
  const [active, setActive] = useState('all');

  const filtered = active === 'all' ? products : products.filter(p => p.cat === active);

  return (
    <section className="products" id="products">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Products</span>
          <h2 className="section-title">สินค้าทั้งหมด</h2>
          <p className="section-subtitle">เลือกชมสินค้าที่คุณสนใจ ผ่านตัวกรองหมวดหมู่</p>
        </div>

        <div className="filter-bar">
          {filters.map(f => (
            <button
              key={f.key}
              className={`filter-btn ${active === f.key ? 'active' : ''}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="items-grid">
          {filtered.map(item => (
            <div className="item-card" key={item.id}>
              <div className="item-image">
                <span className="item-emoji">{item.icon}</span>
                <span className={`item-tag ${item.tag === 'Limited' ? 'hot' : ''}`}>{item.tag}</span>
              </div>
              <div className="item-info">
                <span className="item-game">{item.game}</span>
                <h3 className="item-name">{item.name}</h3>
                <div className="item-price">
                  <span className="price-current">{item.price}</span>
                  <span className="price-old">{item.oldPrice}</span>
                </div>
                <button className="btn-cart">เพิ่มลงตะกร้า</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;
