// src/pages/EventListPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import './CourseListPage.css'; // Reusing course list styles for visual consistency

const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
        setError("Could not load events at this time. Please check back later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="container section text-center">
        <h2>Loading Events...</h2>
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
    <div className="course-list-page section">
      <div className="container">
        <div className="page-header text-center">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="page-subtitle">Join live workshops, talks, and exhibitions hosted by our artists.</p>
        </div>
        
        {events.length > 0 ? (
          <div className="course-grid">
            {events.map(event => (
              <Link to={`/events/${event.event_id}`} key={event.event_id} className="course-card">
                <div className="course-card-image">
                  {/* Safely access the image_url */}
                  <img src={event.image_url} alt={event.title} />
                  {/* Check if eventType exists before rendering */}
                  {event.eventType && <span className="course-card-difficulty">{event.eventType}</span>}
                </div>
                <div className="course-card-info">
                  <h3>{event.title}</h3>
                  <p className="course-artist">
                    {/* Safely access host username and format date */}
                    Hosted by {event.host?.username || '...'} on {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  <div className="course-card-footer">
                    <span>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {/* Check if price exists and format it */}
                    {event.price !== undefined && (
                        <span className="course-card-price">{Number(event.price) > 0 ? `$${Number(event.price).toFixed(2)}` : 'Free'}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center">No upcoming events are scheduled at the moment. Please check back soon!</p>
        )}
      </div>
    </div>
  );
};

export default EventListPage;