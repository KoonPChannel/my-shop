import './FeaturedItems.css';

const items = [
  {
    name: 'Dominus Empyreus',
    game: 'Roblox',
    price: '฿45,000',
    oldPrice: '฿52,000',
    image: '🔮',
    tag: 'Limited',
    hot: true,
  },
  {
    name: 'Roblox Account Lvl 100+',
    game: 'Roblox',
    price: '฿3,200',
    oldPrice: '฿4,500',
    image: '👤',
    tag: 'Account',
    hot: false,
  },
  {
    name: '10,000 Robux Pack',
    game: 'Roblox',
    price: '฿800',
    oldPrice: '฿1,200',
    image: '💎',
    tag: 'Top-up',
    hot: true,
  },
  {
    name: 'Sparkle Time Fedora',
    game: 'Roblox',
    price: '฿12,000',
    oldPrice: '฿15,000',
    image: '🎩',
    tag: 'Limited',
    hot: false,
  },
  {
    name: 'Slender Avatar Set',
    game: 'Roblox',
    price: '฿2,500',
    oldPrice: '฿3,200',
    image: '✨',
    tag: 'Bundle',
    hot: false,
  },
  {
    name: 'Gaming Account Bundle',
    game: 'Multi-Game',
    price: '฿8,900',
    oldPrice: '฿11,000',
    image: '🎮',
    tag: 'Bundle',
    hot: true,
  },
];

function FeaturedItems() {
  return (
    <section className="featured" id="featured">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Featured</span>
          <h2 className="section-title">สินค้าแนะนำ</h2>
          <p className="section-subtitle">ไอเท็มและไอดีเกมยอดนิยม จัดโปรโมชั่นราคาพิเศษ</p>
        </div>
        <div className="items-grid">
          {items.map((item, i) => (
            <div className="item-card" key={i}>
              <div className="item-image">
                <span className="item-emoji">{item.image}</span>
                <span className={`item-tag ${item.hot ? 'hot' : ''}`}>{item.tag}</span>
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

export default FeaturedItems;
