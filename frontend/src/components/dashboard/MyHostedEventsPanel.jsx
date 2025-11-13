// src/components/dashboard/MyHostedEventsPanel.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axios';
import '../../pages/ArtworkListPage.css'; // Reusing the gallery card styles

const MyHostedEventsPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHostedEvents = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/events/my-hosted');
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Failed to fetch hosted events", err);
        setError("Could not load your events.");
      } finally {
        setLoading(false);
      }
    };
    fetchHostedEvents();
  }, []);

  if (loading) {
    return <p>Loading your hosted events...</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="my-hosted-events-panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>My Hosted Events</h2>
        <Link to="/events/create" className="btn btn-primary">
          + Create New Event
        </Link>
      </div>
      {events.length > 0 ? (
        <div className="artwork-grid"> {/* Reusing the same grid style */}
          {events.map((event) => (
            // --- FIX #1: Use the new primary key 'event_id' ---
            <Link to={`/events/${event.event_id}`} key={event.event_id} className="artwork-card">
              <div className="artwork-card-image">
                {/* --- FIX #2: Use 'image_url' --- */}
                <img src={event.image_url} alt={event.title} />
              </div>
              <div className="artwork-card-info">
                <h3>{event.title}</h3>
                {/* --- FIX #3: Use 'event_date' --- */}
                <p>Date: <strong>{new Date(event.event_date).toLocaleDateString()}</strong></p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>You haven't created any events yet. Click the button above to create your first one!</p>
      )}
    </div>
  );
};

export default MyHostedEventsPanel;