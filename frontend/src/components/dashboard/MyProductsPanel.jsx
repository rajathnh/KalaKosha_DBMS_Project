// src/components/dashboard/MyProductsPanel.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import '../../pages/ArtworkListPage.css'; // Reusing styles

const MyProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        // This endpoint doesn't exist yet, we need to create it.
        // Let's assume it will be '/products/my-products'
        const response = await apiClient.get('/products/my-products');
        setProducts(response.data.products || []);
      } catch (err) {
        setError("Could not load your products.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  if (loading) return <p>Loading your products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="my-products-panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>My Products</h2>
        <Link to="/products/create" className="btn btn-primary">
          + Add New Product
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="artwork-grid">
          {products.map((product) => (
            <Link to={`/products/${product.product_id}`} key={product.product_id} className="artwork-card">
              <div className="artwork-card-image-wrapper">
                <img src={product.image_url} alt={product.title} />
              </div>
              <div className="artwork-card-content">
                <h3 className="artwork-title">{product.title}</h3>
                <p className="artwork-artist">Type: {product.product_type}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>You haven't created any products yet. Click the button above to add your first one!</p>
      )}
    </div>
  );
};

export default MyProductsPanel;