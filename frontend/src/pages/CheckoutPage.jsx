// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import './CheckoutPage.css';

const CheckoutPage = () => {
  // Uses the new generic :productId parameter from the URL
  const { productId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!productId) {
        setError('No item specified for checkout.');
        setLoading(false);
        return;
      }

      try {
        // Fetches from the unified /products endpoint
        const response = await apiClient.get(`/products/${productId}`);
        setItem(response.data.product);
      } catch (err) {
        setError('Could not load item details. It may be sold or no longer available.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [productId]);

  const handleConfirmPurchase = async () => {
    if (!item) return;

    setIsProcessing(true);
    try {
      // The frontend sends the simple cart structure the backend expects
      const cart = {
        items: [{
          productId: item.product_id, // Use the new primary key
          quantity: 1 // Assuming quantity is always 1 for single-item checkout
        }],
      };

      // Post to the unified /orders endpoint
      await apiClient.post('/orders', cart);
      
      alert('Purchase successful! Thank you.');
      navigate('/dashboard'); // Redirect to dashboard to see the order
    } catch (err) {
      alert(err.response?.data?.msg || 'An error occurred during purchase.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container container section">
        <div className="spinner"></div>
        <h2>Loading Checkout...</h2>
      </div>
    );
  }

  if (error) {
    return <div className="container section text-center"><p className="error-message">{error}</p></div>;
  }

  if (!item) {
    return <div className="container section text-center"><h2>Item not found.</h2></div>;
  }
  
  // The price is now the total since we removed shipping fees
  const total = item.price;

  return (
    <div className="checkout-page section">
      <div className="container">
        <h1>Order Summary</h1>
        <div className="checkout-layout">
          <div className="order-details">
            <div className="order-item">
              <img src={item.image_url} alt={item.title} className="item-thumbnail" />
              <div className="item-info">
                <h3>{item.title}</h3>
                {item.artist && <p>By {item.artist.username}</p>}
              </div>
              <p className="item-price">${item.price}</p>
            </div>
          </div>
          <div className="payment-summary">
            <h3>Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${item.price}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <span>${total}</span>
            </div>
            <button onClick={handleConfirmPurchase} className="btn btn-primary btn-block" disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;