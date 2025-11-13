// src/components/dashboard/MyBlogsPanel.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import './MyBlogsPanel.css'; // Import the new styles

const MyBlogsPanel = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyBlogs = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/blog/my-blogs');
        setBlogs(response.data.blogPosts || []); // Safely default to an empty array
      } catch (err) {
        console.error("Failed to fetch artist's blogs", err);
        setError("Could not load your blog posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBlogs();
  }, []);

  if (loading) {
    return <p>Loading your blog posts...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="my-blogs-panel">
      <div className="panel-header">
        <h2>My Blog Posts</h2>
        <Link to="/blog/create" className="btn btn-primary">
          + Write New Post
        </Link>
      </div>

      {blogs.length > 0 ? (
        <div className="blog-list">
          {blogs.map((post) => (
            <Link to={`/blog/${post.post_id}`} key={post.post_id} className="blog-item-link">
              <div className="blog-item-row">
                <div className="blog-item-details">
                  <h3>{post.title}</h3>
                  <p>Published on: {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div className="blog-item-actions">
                  {/* You can add Edit/Delete buttons here in the future */}
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>You haven't written any blog posts yet. Click the button above to share your first story!</p>
      )}
    </div>
  );
};

export default MyBlogsPanel;