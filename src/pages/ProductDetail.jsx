import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`http://localhost:4000/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) navigate('/products');
        else setProduct(data);
        setLoading(false);
      })
      .catch(() => { navigate('/products'); setLoading(false); });
  }, [id]);

  if (loading) return <p className="loading">Loading...</p>;
  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    navigate('/products');
  };

  return (
    <section className="product-detail">
      <div className="container">
        <Link to="/products" className="back-link">← Back to Products</Link>

        <div className="detail-grid">
          {/* Image */}
          <div className="detail-image">
            {product.image ? (
              <img src={product.image} alt={product.name} className="main-img" />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <h2 className="detail-title">{product.name}</h2>

            <div className="detail-price">
              <span className="price-current">฿{product.price}</span>
              {product.oldPrice && (
                <span className="price-old">฿{product.oldPrice}</span>
              )}
            </div>

            {product.category && (
              <span className="detail-category">{product.category}</span>
            )}

            {product.description && (
              <p className="detail-desc">{product.description}</p>
            )}

            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock: {product.stock}</span>
              ) : (
                <span className="out-stock">Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <div className="add-to-cart-section">
                <label>
                  Quantity:
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={e => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                  />
                </label>
                <button className="btn-buy" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
