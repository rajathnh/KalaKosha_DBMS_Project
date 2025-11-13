// src/pages/DashboardPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

// Import the NEW consolidated and existing panels
import MyProductsPanel from '../components/dashboard/MyProductsPanel';
import MyCollectionPanel from '../components/dashboard/MyCollectionPanel';
import MyBlogsPanel from '../components/dashboard/MyBlogsPanel';
import MyHostedEventsPanel from '../components/dashboard/MyHostedEventsPanel';
import MyRegisteredEventsPanel from '../components/dashboard/MyRegisteredEventsPanel';
import AccountSettingsPanel from '../components/dashboard/AccountSettingsPanel';

const DashboardPage = () => {
  const { user } = useAuth();

  // Set the default active panel based on the user's role
  const defaultPanel = user?.role === 'artist' ? 'products' : 'collection';
  const [activePanel, setActivePanel] = useState(defaultPanel);

  // A helper function to render the correct panel based on the state
  const renderPanel = () => {
    switch (activePanel) {
      // --- Customer Panels ---
      case 'collection':
        return <MyCollectionPanel />;
      case 'registered-events': 
        return <MyRegisteredEventsPanel />;

      // --- Artist Panels ---
      case 'products':
        return <MyProductsPanel />;
      case 'blogs':
        return <MyBlogsPanel />;
      case 'hosted-events': 
        return <MyHostedEventsPanel />;

      // --- Shared Panel ---
      case 'settings':
        return <AccountSettingsPanel />;
        
      default:
        // Fallback to the default panel for their role
        return user?.role === 'artist' ? <MyProductsPanel /> : <MyCollectionPanel />;
    }
  };
  
  return (
    <div className="dashboard-page section">
      <div className="container">
        <header className="dashboard-header">
          {/* Use user.username which comes from the new API */}
          <h1>Welcome, {user?.name}</h1> 
          <p>Manage your KalaKosha journey here.</p>
        </header>
        <div className="dashboard-layout">
          <aside className="dashboard-sidebar">
            <nav>
              {user?.role === 'artist' ? (
                // --- Artist-Specific Menu ---
                <>
                  <button onClick={() => setActivePanel('products')} className={activePanel === 'products' ? 'active' : ''}>My Products</button>
                  <button onClick={() => setActivePanel('blogs')} className={activePanel === 'blogs' ? 'active' : ''}>My Blogs</button>
                  <button onClick={() => setActivePanel('hosted-events')} className={activePanel === 'hosted-events' ? 'active' : ''}>My Events</button>
                </>
              ) : (
                // --- Customer-Specific Menu ---
                <>
                  <button onClick={() => setActivePanel('collection')} className={activePanel === 'collection' ? 'active' : ''}>My Collection</button>
                  <button onClick={() => setActivePanel('registered-events')} className={activePanel === 'registered-events' ? 'active' : ''}>My Events</button>
                </>
              )}

              {/* --- Shared Menu Item --- */}
              <button onClick={() => setActivePanel('settings')} className={activePanel === 'settings' ? 'active' : ''}>Account Settings</button>
            </nav>
          </aside>
          <main className="dashboard-content">
            {renderPanel()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;