// src/pages/SingleEventPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './SingleArtworkPage.css'; // Reusing the detailed page layout and styles

const SingleEventPage = () => {
  const { id: eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchEvent = useCallback(async () => {
    // Only show full page loader on initial load
    if (!event) setLoading(true); 
    
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      setEvent(response.data.event);
    } catch (err) {
      setError('Failed to load event details. It may have been cancelled or removed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId, event]);

  useEffect(() => {
    fetchEvent();
  }, [eventId]); // Fetch data only when eventId changes

  // --- NEW REGISTRATION CHECK ---
  // Check if the current user's ID is in the event's 'attendees' array
  const isAlreadyRegistered = user && event?.attendees?.some(attendee => attendee.user_id === user.userId);

  const handleRegister = async () => {
    if (!user) {
      // Redirect to login, passing the current page as the location to return to
      navigate('/login', { state: { from: { pathname: `/events/${eventId}` } } });
      return;
    }
    
    setIsRegistering(true);
    try {
      // Call the backend endpoint to register the user for this event
      await apiClient.post(`/events/${eventId}/register`);
      
      // On success, refetch the event data to update the UI
      await fetchEvent(); 
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to register for the event.');
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return <div className="container section text-center"><h2>Loading Event...</h2></div>;
  }

  if (error) {
    return <div className="container section text-center"><p className="error-message">{error}</p></div>;
  }

  if (!event) {
    return <div className="container section text-center"><h2>Event not found.</h2></div>;
  }

  return (
    <div className="single-artwork-page section">
      <div className="container">
        <div className="artwork-main-layout">
          <div className="artwork-image-container">
            {/* The image field name might be different, adjust if needed */}
            <img src={event.image_url || '/placeholder-image.png'} alt={event.title} />
          </div>
          <div className="artwork-details-container">
            <h1>{event.title}</h1>
            <Link to={`/artists/${event.host.user_id}`} className="artist-link">
              Hosted by {event.host.username}
            </Link>
            
            {/* Price field might not exist in simplified schema, handle gracefully */}
            <p className="artwork-price">{event.price > 0 ? `$${event.price}` : 'Free Event'}</p>
            
            <p className="artwork-description">{event.description}</p>
            
            <div className="artwork-meta">
              <span><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span><strong>Time:</strong> {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            {/* Show meeting link only if user is registered */}
            {event.meetingLink && isAlreadyRegistered && (
               <div className="artwork-meta" style={{marginTop: '1rem', backgroundColor: '#e8f5e9'}}>
                 <span><strong>Meeting Link:</strong> <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>{event.meetingLink}</a></span>
               </div>
            )}

            {/* --- DYNAMIC BUTTON LOGIC --- */}
            <div style={{marginTop: '2rem'}}>
              {isAlreadyRegistered ? (
                <button className="btn btn-primary buy-button" disabled style={{backgroundColor: '#4CAF50', cursor: 'default'}}>
                  ✔️ Registered
                </button>
              ) : (
                <button onClick={handleRegister} className="btn btn-primary buy-button" disabled={isRegistering}>
                  {isRegistering ? 'Registering...' : 'Register Now'}
                </button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleEventPage;