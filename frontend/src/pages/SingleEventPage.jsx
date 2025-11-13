// src/pages/SingleEventPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './SingleArtworkPage.css'; // Reusing the detailed page layout styles

const SingleEventPage = () => {
  const { id: eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for the component
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Memoized function to fetch event data.
  // It only depends on eventId, ensuring it's stable between renders.
  const fetchEvent = useCallback(async () => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      setEvent(response.data.event);
    } catch (err) {
      setError('Failed to load event details. It may have been cancelled or removed.');
      console.error(err);
    } finally {
      // Always set loading to false after the first fetch attempt
      setLoading(false);
    }
  }, [eventId]);

  // Effect to fetch data on initial component load or when eventId changes.
  useEffect(() => {
    setLoading(true); // Set loading true on initial mount or ID change
    fetchEvent();
  }, [fetchEvent]);

  // Derived state: check if the current user's ID is in the event's attendees list.
  const isAlreadyRegistered = user && event?.attendees?.some(attendee => attendee.user_id === user.userId);

  // Handler for the registration button click
  const handleRegister = async () => {
    // If user is not logged in, redirect them to the login page
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${eventId}` } } });
      return;
    }
    
    setIsRegistering(true); // Show loading state on the button
    try {
      // Call the backend endpoint to register for the event
      await apiClient.post(`/events/${eventId}/register`);
      
      // On success, refetch the event data to update the UI to show "Registered"
      await fetchEvent();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to register for the event.');
      console.error(err);
    } finally {
      setIsRegistering(false); // Hide loading state on the button
    }
  };

  // --- Render Logic ---

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
            <img src={event.image_url} alt={event.title} />
          </div>
          <div className="artwork-details-container">
            <h1>{event.title}</h1>
            <Link to={`/artists/${event.host.user_id}`} className="artist-link">
              Hosted by {event.host.username}
            </Link>
            
            <p className="artwork-price">{Number(event.price) > 0 ? `$${Number(event.price).toFixed(2)}` : 'Free Event'}</p>
            <p className="artwork-description">{event.description}</p>
            
            <div className="artwork-meta">
              {event.eventType && <span><strong>Event Type:</strong> {event.eventType}</span>}
              <span><strong>Date:</strong> {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span><strong>Time:</strong> {new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            {event.meetingLink && isAlreadyRegistered && (
               <div className="artwork-meta" style={{marginTop: '1rem', backgroundColor: '#e8f5e9'}}>
                 <span><strong>Meeting Link:</strong> <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" style={{color: 'var(--primary-color)', textDecoration: 'underline'}}>{event.meetingLink}</a></span>
               </div>
            )}

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