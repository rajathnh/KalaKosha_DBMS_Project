// src/pages/SingleProductPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import './SingleArtworkPage.css'; // Reusing the styles is great

const SingleProductPage = () => {
    const { id: productId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for data
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    // State for UI and eligibility
    const [reviewStatus, setReviewStatus] = useState({ hasPurchased: false, hasReviewed: false });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        // Don't show full page loader on manual refetch (after submitting a review)
        if (!product) setLoading(true); 

        try {
            // Use Promise.all to fetch data in parallel for better performance
            const productPromise = apiClient.get(`/products/${productId}`);
            const reviewsPromise = apiClient.get(`/reviews/product/${productId}`);
            
            const promises = [productPromise, reviewsPromise];

            // If a user is logged in, also check their purchase/review status
            if (user) {
                // We need a dedicated backend endpoint for this. Let's assume it exists.
                // If this endpoint doesn't exist, the 'canLeaveReview' logic will fail.
                // Let's create a placeholder endpoint for now if needed.
                // For now, we will rely on the reviewController's purchase check.
            }
            
            const [productResponse, reviewsResponse] = await Promise.all(promises);
            
            setProduct(productResponse.data.product);
            setReviews(reviewsResponse.data.reviews);
            
        } catch (err) {
            setError('Failed to load product details. The item may no longer exist.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [productId, user, product]); // product is in dependency array for the loading logic

    useEffect(() => {
        fetchData();
    }, [productId]); // Only refetch when the ID in the URL changes

    const handleBuyNow = () => {
        const checkoutUrl = `/checkout/${productId}`;
        if (!user) {
            navigate('/login', { state: { from: { pathname: checkoutUrl } } });
        } else {
            navigate(checkoutUrl);
        }
    };

    const handleReviewSubmitted = () => {
        setShowReviewForm(false);
        fetchData(); // Refresh all data from the server
    };

    if (loading) return <div className="container section text-center"><h2>Loading Product...</h2></div>;
    if (error) return <div className="container section text-center"><p className="error-message">{error}</p></div>;
    if (!product) return <div className="container section text-center"><h2>Product not found.</h2></div>;

    // A more accurate check: has the user already left a review in the fetched reviews list?
    const hasUserReviewed = user && reviews.some(review => review.user_id === user.userId);
    // The button to leave a review should only show if the user is logged in AND hasn't reviewed yet.
    // The actual purchase check happens when they submit the form in the backend.
    const canLeaveReview = user && !hasUserReviewed;

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
                            {/* FIX: Displaying all relevant details */}
                            <span><strong>Type:</strong> {product.product_type}</span>
                            {product.artForm && <span><strong>Art Form:</strong> {product.artForm}</span>}
                            {product.difficulty && <span><strong>Difficulty:</strong> {product.difficulty}</span>}
                            <span><strong>Status:</strong> {product.status || 'Available'}</span>
                            <span><strong>Rating:</strong> ⭐ {Number(product.average_rating).toFixed(1)} ({reviews.length} reviews)</span>
                        </div>
                        
                        {/* FIX: Don't show Buy button if sold */}
                        {product.status !== 'sold' ? (
                            <button onClick={handleBuyNow} className="btn btn-primary buy-button">
                                {product.product_type === 'artwork' ? 'Buy Now' : 'Enroll Now'}
                            </button>
                        ) : (
                             <p className="sold-notice">This artwork has been sold.</p>
                        )}
                    </div>
                </div>

                <div className="artwork-reviews-section">
                    <h2>Reviews ({reviews.length})</h2>

                    {canLeaveReview && !showReviewForm && (
                        <div className="review-prompt">
                            <button onClick={() => setShowReviewForm(true)} className="btn btn-outline">
                                Purchased this item? Leave a Review
                            </button>
                        </div>
                    )}

                    {canLeaveReview && showReviewForm && (
                        <ReviewForm 
                          productId={productId} 
                          onReviewSubmit={handleReviewSubmitted}
                        />
                    )}
                    
                    {hasUserReviewed && (
                         <div className="review-prompt">
                            <p><strong>Thank you! You've already reviewed this item.</strong></p>
                        </div>
                    )}

                    {reviews.length > 0 ? (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review.review_id} className="review-card">
                                    {/* FIX: Added the title back */}
                                    
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