import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>
      <div className="blob blob3"></div>

      <nav className="nav">
        <div className="logo">🎬 CineHealth</div>
      </nav>

      <div className="hero">
        <h1 className="hero-title">
          How are you <span className="italic-pink">feeling</span> today?
        </h1>
        <p className="hero-subtitle">
          Tell us your mood and we'll find the perfect movie to support your emotional wellness.
        </p>
        <button className="cta-btn" onClick={() => navigate('/chat')}>
          Get Started →
        </button>
      </div>

      <div className="floating-cards">
        <div className="mini-card">🎭 Feeling anxious?</div>
        <div className="mini-card">😢 Need a good cry?</div>
        <div className="mini-card">😊 Want to laugh?</div>
      </div>
    </div>
  );
}

export default Landing;