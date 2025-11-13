// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import apiClient from '../api/axios';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      setError('Please provide a comment.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // Simplified payload for the new backend
      await apiClient.post('/reviews', {
        productId,
        rating: Number(rating),
        comment,
      });
      onReviewSubmit(); // Tell the parent to refresh
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
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
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