// src/components/dashboard/MyCollectionPanel.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import '../../pages/ArtworkListPage.css'; // Reusing styles

const MyCollectionPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyCollection = async () => {
      try {
        // This endpoint doesn't exist yet, let's assume '/orders/my-collection'
        const response = await apiClient.get('/orders/my-collection');
        setItems(response.data.items || []);
      } catch (err) {
        setError("Could not load your collection.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyCollection();
  }, []);

  if (loading) return <p>Loading your collection...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="my-collection-panel">
      <h2>My Collection</h2>
      <p>All the artworks and courses you've purchased.</p>
      <hr style={{ margin: '1.5rem 0' }}/>
      {items.length > 0 ? (
  <div className="artwork-grid">
    {/* THE FIX IS HERE: We destructure the 'product' object from each 'item' */}
    {items.map(({ product }) => (
      <Link to={`/products/${product.product_id}`} key={product.product_id} className="artwork-card">
        <div className="artwork-card-image-wrapper">
          {/* Access properties through the nested 'product' object */}
          <img src={product.image_url} alt={product.title} />
        </div>
        <div className="artwork-card-content">
          <h3 className="artwork-title">{product.title}</h3>
          {/* The artist is even deeper: product.artist.username */}
          {product.artist && <p className="artwork-artist">By: {product.artist.username}</p>}
          <p className="artwork-artist">Type: {product.product_type}</p>
        </div>
      </Link>
    ))}
  </div>
) : (
  <p>You haven't purchased any items yet. <Link to="/products">Explore the gallery!</Link></p>
)}
    </div>
  );
};

export default MyCollectionPanel;