// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';

// --- CORE LAYOUT COMPONENTS ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// --- CORE PAGE COMPONENTS (CLEANED UP & CONSOLIDATED) ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // <-- NEW: Replaces 3 old register pages
import ProductListPage from './pages/ProductListPage'; // <-- NEW: Replaces ArtworkListPage and CourseListPage
import SingleProductPage from './pages/SingleProductPage'; // <-- NEW: Replaces SingleArtworkPage and SingleCoursePage
import ArtistProfilePage from './pages/ArtistProfilePage';
import BlogListPage from './pages/BlogListPage';
import SingleBlogPostPage from './pages/SingleBlogPostPage';
import EventListPage from './pages/EventListPage';
import SingleEventPage from './pages/SingleEventPage';
import CheckoutPage from './pages/CheckoutPage'; 
import DashboardPage from './pages/DashboardPage';

// --- CREATION PAGES (ARTIST ONLY) ---
import CreateProductPage from './pages/CreateProductPage'; // <-- NEW: Replaces CreateArtworkPage and CreateCoursePage
import CreateBlogPage from './pages/CreateBlogPage'; 
import CreateEventPage from './pages/CreateEventPage'; 

// --- PROTECTED ROUTE UTILITY ---
import ProtectedRoute from './components/ProtectedRoute';

// --- STYLING ---
import './App.css';

function App() {
  return (
    <div className="App app-container">
      <ScrollToTop />
      <Navbar />
      <main className="main-content" style={{ paddingTop: '80px' }}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<SingleProductPage />} />
          
          <Route path="/artists/:id" element={<ArtistProfilePage />} />
          
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:id" element={<SingleBlogPostPage />} />
          
          <Route path="/events" element={<EventListPage />} />  
          <Route path="/events/:id" element={<SingleEventPage />} />

          {/* --- PROTECTED ROUTES (Require Login) --- */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
          />
          <Route 
            path="/checkout/:productId" // Simplified checkout route
            element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} 
          />

          {/* --- ARTIST-ONLY PROTECTED ROUTES --- */}
          <Route 
            path="/products/create" 
            element={<ProtectedRoute roles={['artist']}><CreateProductPage /></ProtectedRoute>} 
          />
          <Route 
            path="/blog/create" 
            element={<ProtectedRoute roles={['artist']}><CreateBlogPage /></ProtectedRoute>} 
          />
          <Route 
            path="/events/create" 
            element={<ProtectedRoute roles={['artist']}><CreateEventPage /></ProtectedRoute>} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;