// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // Reusing styles for a consistent look and feel

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer', // Default role is 'customer'
    bio: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth(); // Using the new single 'register' function from AuthContext
  const navigate = useNavigate();

  // A single handler for all form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare the data to be sent to the backend
    const submissionData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    
    // Only include the 'bio' if the role is 'artist'
    if (formData.role === 'artist') {
      submissionData.bio = formData.bio;
    }

    try {
      await register(submissionData); // Call the single register function
      navigate('/dashboard'); // Redirect to dashboard on successful registration
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: '550px' }}>
        <h2>Join KalaKosha</h2>
        <form onSubmit={handleSubmit} className="login-form">
          
          <div className="form-group">
            <label htmlFor="role">I am registering as an...</label>
            <select 
              id="role" 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              style={{ padding: '0.75rem', fontSize: '1rem' }}
            >
              <option value="customer">Art Lover (Customer)</option>
              <option value="artist">Artist</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name / Artist Name</label>
            <input type="text" id="name" name="name" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 6 characters)</label>
            <input type="password" id="password" name="password" minLength="6" onChange={handleChange} required />
          </div>
          
          {/* --- CONDITIONAL BIO FIELD --- */}
          {/* This block only appears if the user selects the 'artist' role */}
          {formData.role === 'artist' && (
            <div className="form-group">
              <label htmlFor="bio">Your Bio</label>
              <textarea 
                id="bio"
                name="bio" 
                rows="4" 
                onChange={handleChange} 
                placeholder="Tell us about your art, your inspiration, and your journey..." 
                required 
              />
            </div>
          )}

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'underline' }}>
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;