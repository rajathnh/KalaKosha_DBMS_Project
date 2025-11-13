// src/pages/BlogListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import './BlogListPage.css'; // Your existing CSS will work perfectly

const BlogListPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetching from the correct, simplified endpoint
        const response = await apiClient.get('/blog');
        setBlogPosts(response.data.blogPosts); // Accessing the correct property from the response
      } catch (err) {
        console.error("Failed to fetch blog posts", err);
        setError("Could not load blog posts at this time.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="container section text-center">
        <h2>Loading Blog...</h2>
      </div>
    );
  }

  if (error) {
      return (
          <div className="container section text-center">
              <p className="error-message">{error}</p>
          </div>
      );
  }

  return (
    <div className="blog-list-page section">
      <div className="container">
        <header className="blog-header">
          <h1>From the Artists' Desk</h1>
          <p>Stories, techniques, and inspiration from our community of artists.</p>
        </header>
        
        {blogPosts.length > 0 ? (
          <div className="blog-grid">
            {blogPosts.map(post => (
              <Link to={`/blog/${post.post_id}`} key={post.post_id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.featured_image_url} alt={post.title} />
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    {/* Use post.artist.username for the author's name */}
                    <span className="author">By {post.artist?.username || 'Unknown Artist'}</span>
                    {/* Use post.created_at for the date */}
                    <span className="date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center">No blog posts have been published yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;