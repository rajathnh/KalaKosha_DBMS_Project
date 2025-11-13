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
        setEvents(response.data.events || []); // Default to empty array on unexpected response
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
              // Use the new primary key `event_id` for the key and link
              <Link to={`/events/${event.event_id}`} key={event.event_id} className="course-card">
                <div className="course-card-image">
                  {/* Use the new field `image_url` for the image source */}
                  <img src={event.image_url} alt={event.title} />
                  {/* The `eventType` field from the old file seems to be missing in the new model, we can omit it */}
                  {/* <span className="course-card-difficulty">{event.eventType}</span> */}
                </div>
                <div className="course-card-info">
                  <h3>{event.title}</h3>
                  <p className="course-artist">
                    {/* Use `host.username` and check if host exists */}
                    Hosted by {event.host ? event.host.username : 'Unknown Artist'} on {new Date(event.event_date).toLocaleDateString()}
                  </p>
                  <div className="course-card-footer">
                    {/* Use `event_date` for the time */}
                    <span>{new Date(event.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {/* The `price` field is not in the new Event model, we can omit it */}
                    {/* <span className="course-card-price">{event.price > 0 ? `$${event.price}` : 'Free'}</span> */}
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