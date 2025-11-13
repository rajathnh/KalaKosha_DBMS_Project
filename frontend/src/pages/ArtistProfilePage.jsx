// src/pages/ArtistProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import ArtworkCard from '../components/ArtworkCard'; // Reusable component
import CourseCard from '../components/CourseCard'; // Reusable component
import './ArtistProfilePage.css';
// Note: Badge component is removed as the badge logic was part of the old backend.
// You can add it back later if you rebuild that feature.

const ArtistProfilePage = () => {
  const { id: artistId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // --- NEW, SIMPLIFIED API CALL ---
        const response = await apiClient.get(`/users/${artistId}/profile`);
        setProfileData(response.data.profile);
      } catch (err) {
        setError('Could not find the requested artist.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistProfile();
  }, [artistId]);
  
  if (loading) {
    return (
      <div className="loading-container container section">
        <div className="spinner"></div>
        <h2>Loading Artist Profile...</h2>
      </div>
    );
  }

  if (error || !profileData || !profileData.artist) {
    return (
        <div className="container section text-center">
            <h2 className="error-message">{error || 'Artist data could not be loaded.'}</h2>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
        </div>
    );
  }

  // Destructure data from the single profile object
  const { artist, products, blogPosts, events } = profileData;

  // Filter products into artworks and courses
  const artworks = products.filter(p => p.product_type === 'artwork');
  const courses = products.filter(p => p.product_type === 'course');

  return (
    <div className="artist-profile-page container section">
      <div className="profile-layout">
        
        {/* --- LEFT "STICKY" SIDEBAR --- */}
        <aside className="profile-sidebar">
          <div className="sidebar-content">
            <img src={artist.profile_picture || '/default-profile.png'} alt={artist.username} className="artist-avatar" />
            <h1 className="artist-name">{artist.username}</h1>
            
            {/* Note: Specialization is not in the simplified User model, so it's removed */}
            
            <div className="artist-rating">
              <span>⭐ {artist.average_rating ? Number(artist.average_rating).toFixed(1) : 'N/A'}</span> 
              ({artist.num_of_reviews || 0} reviews)
            </div>
            <p className="artist-bio">{artist.bio}</p>
            {/* "Contact for Commission" button is removed as commissions are not in the scope */}
          </div>
        </aside>

        {/* --- RIGHT MAIN CONTENT AREA --- */}
        <main className="profile-main-content">
          {/* ARTWORKS FOR SALE */}
          <section id="for-sale" className="profile-section">
            <h2 className="section-title">Artworks ({artworks.length})</h2>
            {artworks.length > 0 ? (
              <div className="artwork-grid">
                {artworks.map(art => (
                  <ArtworkCard key={art.product_id} product={art} />
                ))}
              </div>
            ) : <p className="empty-state">This artist has no artworks for sale yet.</p>}
          </section>

          {/* COURSES */}
          <section id="courses" className="profile-section">
            <h2 className="section-title">Courses ({courses.length})</h2>
            {courses.length > 0 ? (
              <div className="artwork-grid"> {/* Reusing grid for consistency */}
                {courses.map(course => (
                  <CourseCard key={course.product_id} product={course} />
                ))}
              </div>
            ) : <p className="empty-state">This artist has no courses available yet.</p>}
          </section>

          {/* BLOG POSTS */}
          <section id="blog-posts" className="profile-section">
            <h2 className="section-title">Blog Posts ({blogPosts.length})</h2>
            {blogPosts.length > 0 ? (
                blogPosts.map(post => (
                    <div key={post.post_id} style={{ marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                        <Link to={`/blog/${post.post_id}`}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{post.title}</h4>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Published on {new Date(post.created_at).toLocaleDateString()}</p>
                        </Link>
                    </div>
                ))
            ) : <p className="empty-state">This artist has not written any blog posts yet.</p>}
          </section>

          {/* EVENTS */}
          <section id="events" className="profile-section">
            <h2 className="section-title">Hosted Events ({events.length})</h2>
            {events.length > 0 ? (
                 events.map(event => (
                    <div key={event.event_id} style={{ marginBottom: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                        <Link to={`/events/${event.event_id}`}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{event.title}</h4>
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>On {new Date(event.event_date).toLocaleDateString()}</p>
                        </Link>
                    </div>
                ))
            ) : <p className="empty-state">This artist has no upcoming events.</p>}
          </section>

        </main>
      </div>
    </div>
  );
};

export default ArtistProfilePage;