// src/components/ReviewForm.jsx

import React, { useState } from 'react';
import apiClient from '../api/axios';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(5);
  // --- REMOVED --- title state is no longer needed
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // --- UPDATED --- Simplified validation
    if (!comment) {
      setError('Please provide a comment.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // --- UPDATED --- Payload no longer includes title
      await apiClient.post('/reviews', {
        productId: productId,
        rating: Number(rating),
        comment,
      });

      // --- UPDATED --- Clear only the fields that exist
      setComment('');
      setRating(5);
      onReviewSubmit();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Write Your Review</h3>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label htmlFor="rating">Rating</label>
          <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 Stars - Excellent</option>
            <option value="4">4 Stars - Good</option>
            <option value="3">3 Stars - Average</option>
            <option value="2">2 Stars - Fair</option>
            <option value="1">1 Star - Poor</option>
          </select>
        </div>
        
        {/* --- REMOVED --- The entire title input field div is gone */}

        <div className="form-group">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on the product..."
            rows="4"
            required
          />
        </div>
        
        {error && <p className="review-error">{error}</p>}
        
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;