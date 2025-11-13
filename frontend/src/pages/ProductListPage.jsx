// src/pages/ProductListPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/axios';
import ArtworkCard from '../components/ArtworkCard';
import CourseCard from '../components/CourseCard';
import './ArtworkListPage.css'; // Reusing styles

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  // Get the 'type' from the URL query string (e.g., /products?type=artwork)
  const productType = searchParams.get('type');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/products?sort=latest&limit=12';
        // If a type is specified in the URL, add it as a query parameter
        if (productType) {
          url += `&product_type=${productType}`;
        }

        const response = await apiClient.get(url);
        setProducts(response.data.products);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError("Could not load products at this time. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [productType]); // Re-run the effect if the productType in the URL changes

  // Dynamic content based on the product type
  const pageDetails = {
    artwork: {
      title: 'Explore The Gallery',
      subtitle: 'A curated collection of authentic works from talented traditional artists.',
    },
    course: {
      title: 'Explore Our Courses',
      subtitle: 'Learn traditional art forms directly from master artists.',
    },
    default: {
      title: 'All Products',
      subtitle: 'Discover unique artworks and inspiring courses.',
    },
  };
  
  const details = pageDetails[productType] || pageDetails.default;

  if (loading) {
    return (
      <div className="loading-container container section">
        <div className="spinner"></div>
        <h2>Loading Products...</h2>
      </div>
    );
  }

  if (error) {
    return <div className="container section text-center"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="artwork-list-page section">
      <div className="container">
        <div className="page-header text-center">
          <h1 className="page-title">{details.title}</h1>
          <p className="page-subtitle">{details.subtitle}</p>
        </div>
        
        {products.length > 0 ? (
          <div className="artwork-grid">
            {products.map(product => {
              // Conditionally render the correct card based on the product_type
              if (product.product_type === 'artwork') {
                return <ArtworkCard key={product.product_id} product={product} />;
              }
              if (product.product_type === 'course') {
                return <CourseCard key={product.product_id} product={product} />;
              }
              return null;
            })}
          </div>
        ) : (
          <p className="text-center">No products found matching your criteria.</p>
        )}
        
      </div>
    </div>
  );
};

export default ProductListPage;