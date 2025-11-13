// src/components/CourseCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../pages/CourseListPage.css'; // Reusing the same CSS

const CourseCard = ({ product }) => {
  return (
    <Link to={`/products/${product.product_id}`} key={product.product_id} className="course-card">
      <div className="course-card-image">
        <img src={product.image_url} alt={product.title} />
        {/* You may need to add 'difficulty' to your Product model if you want this feature */}
        {/* <span className="course-card-difficulty">{product.difficulty}</span> */}
      </div>
      <div className="course-card-info">
        <h3>{product.title}</h3>
        {product.artist && <p className="course-artist">By {product.artist.username}</p>}
        <div className="course-card-footer">
          <span className="course-card-rating">
            ⭐ {product.average_rating ? Number(product.average_rating).toFixed(1) : '0.0'}
          </span>
          <span className="course-card-price">${product.price}</span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;