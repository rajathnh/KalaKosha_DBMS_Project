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
          {items.map((item) => (
            <Link to={`/products/${item.product_id}`} key={item.product_id} className="artwork-card">
              <div className="artwork-card-image-wrapper">
                <img src={item.image_url} alt={item.title} />
              </div>
              <div className="artwork-card-content">
                <h3 className="artwork-title">{item.title}</h3>
                 <p className="artwork-artist">Type: {item.product_type}</p>
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