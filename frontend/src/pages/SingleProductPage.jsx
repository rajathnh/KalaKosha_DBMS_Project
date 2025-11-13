// src/pages/SingleProductPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import './SingleArtworkPage.css'; // Reusing the same detailed page layout

const SingleProductPage = () => {
  const { id: productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for data
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  
  // State for UI and interaction
  const [purchaseStatus, setPurchaseStatus] = useState({ hasPurchased: false, hasReviewed: false });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const productPromise = apiClient.get(`/products/${productId}`);
      const reviewsPromise = apiClient.get(`/reviews/product/${productId}`);
      
      const [productResponse, reviewsResponse] = await Promise.all([productPromise, reviewsResponse]);
      
      setProduct(productResponse.data.product);
      setReviews(reviewsResponse.data.reviews);
      
      // We no longer need a separate status check API call,
      // this logic will be moved to the review controller for verification.
      // For the frontend, we'll just check if they are logged in.
      
    } catch (err) {
      setError('Failed to load product details. The item may no longer exist.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleActionClick = () => {
    // Both "Buy Now" and "Enroll Now" lead to the same checkout page
    const checkoutUrl = `/checkout/${productId}`;
    if (!user) {
      navigate('/login', { state: { from: { pathname: checkoutUrl } } });
    } else {
      navigate(checkoutUrl);
    }
  };

  const handleReviewSubmitted = async () => {
    setShowReviewForm(false);
    await fetchData(); // Refresh reviews from server
  };

  if (loading) return <div className="container section"><h2>Loading Product...</h2></div>;
  if (error) return <div className="container section"><p className="error-message">{error}</p></div>;
  if (!product) return null;

  // Simplified check: Can the user *potentially* leave a review?
  // The backend will do the final verification of purchase.
  const canPotentiallyReview = user; 

  return (
    <div className="single-artwork-page section">
      <div className="container">
        <div className="artwork-main-layout">
          <div className="artwork-image-container">
            <img src={product.image_url} alt={product.title} />
          </div>
          <div className="artwork-details-container">
            <h1>{product.title}</h1>
            {product.artist && (
                <Link to={`/artists/${product.artist.user_id}`} className="artist-link">
                    By {product.artist.username}
                </Link>
            )}
            <p className="artwork-price">${product.price}</p>
            <p className="artwork-description">{product.description}</p>
            
            <div className="artwork-meta">
              {/* --- DYNAMIC DETAILS RENDER --- */}
              {product.product_type === 'artwork' ? (
                <>
                  <span><strong>Art Form:</strong> {product.artForm || 'N/A'}</span>
                  <span><strong>Status:</strong> {product.status === 'for_sale' ? 'For Sale' : 'Sold'}</span>
                </>
              ) : (
                <>
                  <span><strong>Art Form:</strong> {product.artForm || 'N/A'}</span>
                  {/* <span><strong>Difficulty:</strong> {product.difficulty || 'N/A'}</span> */}
                </>
              )}
            </div>

            {/* --- DYNAMIC ACTION BUTTON --- */}
            {product.status !== 'sold' && (
              <button onClick={handleActionClick} className="btn btn-primary buy-button">
                {product.product_type === 'artwork' ? 'Buy Now' : 'Enroll Now'}
              </button>
            )}
            {product.status === 'sold' && (
              <p className="sold-notice">This artwork has been sold.</p>
            )}
          </div>
        </div>

        <div className="artwork-reviews-section">
          <h2>Reviews ({reviews.length})</h2>

          {canPotentiallyReview && !showReviewForm && (
            <div className="review-prompt">
              <button onClick={() => setShowReviewForm(true)} className="btn btn-outline">
                Leave a Review
              </button>
            </div>
          )}

          {canPotentiallyReview && showReviewForm && (
            <ReviewForm 
              productId={productId} 
              onReviewSubmit={handleReviewSubmitted}
            />
          )}

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.review_id} className="review-card">
                  <p className="review-rating">Rating: {review.rating} / 5</p>
                  <p className="review-comment">"{review.comment}"</p>
                  {review.user && <p className="review-author">- {review.user.username}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No reviews yet for this product.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;