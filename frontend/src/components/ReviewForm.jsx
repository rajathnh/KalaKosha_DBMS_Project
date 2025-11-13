// src/components/ReviewForm.jsx

import React, { useState } from 'react';
import apiClient from '../api/axios';
import './ReviewForm.css';

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState(''); // <-- THE MISSING PIECE
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Also check for title
    if (!title || !comment) {
      setError('Please provide a title and a comment.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      // The complete and correct payload
      await apiClient.post('/reviews', {
        productId: productId,
        rating: Number(rating),
        title, // <-- ADDED BACK
        comment,
      });

      // Clear all form fields and notify the parent component
      setTitle('');
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
        
        {/* --- THE MISSING INPUT FIELD --- */}
        <div className="form-group">
          <label htmlFor="title">Review Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., A masterpiece!"
            required
          />
        </div>
        {/* --- END OF FIX --- */}

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