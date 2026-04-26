import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';

const filters = [
  { key: 'all',      label: 'ทั้งหมด' },
  { key: 'item',     label: 'ไอเท็ม' },
  { key: 'account',  label: 'ไอดีเกม' },
  { key: 'topup',    label: 'เติมเงิน' },
];

function Products() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded products:', data);
        setProducts(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  const filtered = active === 'all' ? products : products.filter(p => p.category === active);

  if (loading) return <p className="loading">Loading products...</p>;

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

        {filtered.length === 0 ? (
          <p className="no-products">No products found. Please add some from admin panel.</p>
        ) : (
          <div className="items-grid">
            {filtered.map(item => (
              <Link to={`/products/${item.id}`} className="item-card" key={item.id}>
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="item-img" />
                  ) : (
                    <span className="item-emoji">🎮</span>
                  )}
                  {item.tag && <span className={`item-tag ${item.tag === 'Limited' ? 'hot' : ''}`}>{item.tag}</span>}
                </div>
                <div className="item-info">
                  <span className="item-game">{item.category || 'Item'}</span>
                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price">
                    <span className="price-current">฿{Number(item.price).toLocaleString()}</span>
                    {item.oldPrice && <span className="price-old">฿{Number(item.oldPrice).toLocaleString()}</span>}
                  </div>
                  <button className="btn-cart">เพิ่มลงตะกร้า</button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;
