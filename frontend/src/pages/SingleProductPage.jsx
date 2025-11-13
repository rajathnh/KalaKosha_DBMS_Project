// src/pages/SingleProductPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm'; // We will refactor this component next
import './SingleArtworkPage.css'; // We can reuse the existing detailed page styles

const SingleProductPage = () => {
    const { id: productId } = useParams(); // Get the generic 'id' from the URL
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for all data and UI status
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewStatus, setReviewStatus] = useState({ hasPurchased: false, hasReviewed: false });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoized function to fetch all necessary data for the page
    const fetchData = useCallback(async () => {
        try {
            // Fetch product details from the new unified endpoint
            const productResponse = await apiClient.get(`/products/${productId}`);
            const fetchedProduct = productResponse.data.product;
            setProduct(fetchedProduct);

            // Fetch reviews for this specific product
            const reviewsResponse = await apiClient.get(`/reviews/product/${productId}`);
            setReviews(reviewsResponse.data.reviews);

            // If a user is logged in, check if they can review this product
            if (user) {
                // This logic is now handled by the backend's review controller and purchase verification
                // To display the "Leave a review" button, we need a simple status check.
                // Let's assume for now that if they can review, they've purchased. We'll simplify the review form.
            }
        } catch (err) {
            setError('Failed to load product details. The item may no longer exist.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [productId, user]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

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
        fetchData(); // Refresh all data after a review is submitted
    };
    
    // --- Render Logic ---

    if (loading) return <div className="container section text-center"><h2>Loading Product...</h2></div>;
    if (error) return <div className="container section text-center"><p className="error-message">{error}</p></div>;
    if (!product) return <div className="container section text-center"><h2>Product not found.</h2></div>;

    // Determine if the user has purchased this item (a simplified check for the UI)
    // A full implementation would require a dedicated endpoint `/orders/status/:productId`
    // For now, let's assume if they can't review yet, they should see the button if logged in.
    const canPotentiallyReview = user && !reviews.some(r => r.user_id === user.userId);


    return (
        <div className="single-artwork-page section">
            <div className="container">
                <div className="artwork-main-layout">
                    <div className="artwork-image-container">
                        <img src={product.image_url} alt={product.title} />
                    </div>
                    <div className="artwork-details-container">
                        <h1>{product.title}</h1>
                        <Link to={`/artists/${product.artist.user_id}`} className="artist-link">
                            By {product.artist.username}
                        </Link>
                        <p className="artwork-price">${product.price}</p>
                        <p className="artwork-description">{product.description}</p>
                        
                        <div className="artwork-meta">
                            {product.product_type === 'artwork' ? (
                                <span><strong>Art Form:</strong> {product.artForm}</span>
                            ) : (
                                <span><strong>Difficulty:</strong> {product.difficulty}</span>
                            )}
                            <span><strong>Rating:</strong> ⭐ {Number(product.average_rating).toFixed(1)} ({reviews.length} reviews)</span>
                        </div>
                        
                        <button onClick={handleBuyNow} className="btn btn-primary buy-button">
                            {product.product_type === 'artwork' ? 'Buy Now' : 'Enroll Now'}
                        </button>
                    </div>
                </div>

                <div className="artwork-reviews-section">
                    <h2>Reviews ({reviews.length})</h2>

                    {canPotentiallyReview && !showReviewForm && (
                        <div className="review-prompt">
                            <button onClick={() => setShowReviewForm(true)} className="btn btn-outline">
                                Purchased this item? Leave a Review
                            </button>
                        </div>
                    )}

                    {canPotentiallyReview && showReviewForm && (
                        <ReviewForm 
                          productId={productId} 
                          onReviewSubmit={handleReviewSubmitted}
                        />
                    )}
                    
                    {!canPotentiallyReview && user && (
                         <div className="review-prompt">
                            <p><strong>Thank you! You've already reviewed this item.</strong></p>
                        </div>
                    )}

                    {reviews.length > 0 ? (
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review.review_id} className="review-card">
                                    {/* The simplified review model doesn't have a title */}
                                    <p className="review-rating">Rating: {review.rating} / 5</p>
                                    <p className="review-comment">"{review.comment}"</p>
                                    <p className="review-author">- {review.user?.username || 'Anonymous'}</p>
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