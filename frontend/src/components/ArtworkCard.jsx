// src/components/ArtworkCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/ArtworkListPage.css'; // We can reuse the same CSS

const ArtworkCard = ({ product }) => {
  return (
    <Link to={`/products/${product.product_id}`} key={product.product_id} className="artwork-card">
      <div className="artwork-card-image-wrapper">
        <img src={product.image_url} alt={product.title} />
      </div>
      <div className="artwork-card-content">
        <h3 className="artwork-title">{product.title}</h3>
        {product.artist && <p className="artwork-artist">By {product.artist.username}</p>}
      </div>
      <div className="artwork-card-overlay">
        <span className="artwork-price">${product.price}</span>
        <div className="artwork-cta">View Details</div>
      </div>
    </Link>
  );
};

export default ArtworkCard;