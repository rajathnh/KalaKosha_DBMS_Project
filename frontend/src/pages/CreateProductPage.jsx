// src/pages/CreateProductPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import './FormPage.css'; // Reusing our standard form styles

const CreateProductPage = () => {
  // State for all common fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    product_type: 'artwork', // Default to 'artwork'
  });

  // State for type-specific fields
  const [artworkFields, setArtworkFields] = useState({ artForm: '' });
  const [courseFields, setCourseFields] = useState({ difficulty: 'Beginner', artForm: '' });

  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // A single handler for all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update the correct state object based on the input name
    if (name in artworkFields) {
      setArtworkFields({ ...artworkFields, [name]: value });
    } else if (name in courseFields) {
      setCourseFields({ ...courseFields, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please upload an image for the product.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    // Combine common data with type-specific data
    let specificFields = {};
    if (formData.product_type === 'artwork') {
      specificFields = artworkFields;
    } else {
      specificFields = courseFields;
    }
    
    const finalData = {
      ...formData,
      ...specificFields,
    };
    
    const submissionData = new FormData();
    for (const key in finalData) {
      submissionData.append(key, finalData[key]);
    }
    // The backend expects 'image_url' but we send a file. 
    // We'll call the field 'image' to be handled by the backend uploader.
    submissionData.append('image', imageFile);

    try {
      // The backend will set image_url after uploading to Cloudinary
      // The `productController` will handle this logic
      await apiClient.post('/products', submissionData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard'); // Redirect to dashboard on success
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create product.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page section">
      <div className="form-container">
        <h2>Add a New Product</h2>
        <p>Showcase your work or share your knowledge with the community.</p>
        <form onSubmit={handleSubmit} className="form">

          <div className="form-group">
            <label htmlFor="product_type">What are you creating?</label>
            <select name="product_type" value={formData.product_type} onChange={handleChange} style={{ padding: '0.75rem' }}>
              <option value="artwork">An Artwork</option>
              <option value="course">A Course</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea name="description" value={formData.description} rows="5" onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
          </div>

          {/* --- DYNAMIC FIELDS RENDERED CONDITIONALLY --- */}
          {formData.product_type === 'artwork' ? (
            // Fields for Artwork
            <div className="form-group">
              <label htmlFor="artForm">Art Form (e.g., Warli, Madhubani)</label>
              <input type="text" name="artForm" value={artworkFields.artForm} onChange={handleChange} required />
            </div>
          ) : (
            // Fields for Course
            <>
              <div className="form-group">
                <label htmlFor="artForm">Art Form Taught</label>
                <input type="text" name="artForm" value={courseFields.artForm} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level</label>
                <select name="difficulty" value={courseFields.difficulty} onChange={handleChange}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="image">Product Image / Course Cover</label>
            <input type="file" name="image" onChange={handleFileChange} required accept="image/*" />
          </div>
          
          {error && <p className="form-error">{error}</p>}
          
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductPage;