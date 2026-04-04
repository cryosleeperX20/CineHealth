import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, PointElement, LineElement
} from 'chart.js';
import '../styles/Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    setHistory(saved);
  }, []);

  const moodColors = {
    happy: '#f9c74f', sad: '#4cc9f0', anxious: '#f8961e',
    angry: '#f94144', neutral: '#90be6d', depressed: '#9b72cf',
    lonely: '#43aa8b', stressed: '#f3722c'
  };

  const moodEmojis = {
    happy: '😊', sad: '😢', anxious: '😰',
    angry: '😠', neutral: '😐', depressed: '😔',
    lonely: '🥺', stressed: '😓'
  };

  // Mood trend line chart
  const trendData = {
    labels: history.map((h, i) => h.time),
    datasets: [{
      label: 'Intensity',
      data: history.map(h => h.intensity),
      borderColor: '#c45c8a',
      backgroundColor: 'rgba(196, 92, 138, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: history.map(h => moodColors[h.mood] || '#c45c8a'),
      pointRadius: 6
    }]
  };

  // Mood count donut
  const moodCounts = {};
  history.forEach(h => {
    moodCounts[h.mood] = (moodCounts[h.mood] || 0) + 1;
  });

  const donutData = {
    labels: Object.keys(moodCounts),
    datasets: [{
      data: Object.values(moodCounts),
      backgroundColor: Object.keys(moodCounts).map(m => moodColors[m] || '#ccc'),
      borderWidth: 0
    }]
  };

  return (
    <div className="dashboard">
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <div className="dash-header">
        <span className="logo">CineHealth</span>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="back-btn" onClick={() => {
            localStorage.removeItem('moodHistory');
            setHistory([]);
          }}>Clear History</button>
          <button className="back-btn" onClick={() => navigate('/chat')}>Back to Chat</button>
        </div>
      </div>

      <div className="dash-content">
        <h1 className="dash-title">Your Wellness <span className="italic-pink">Dashboard</span></h1>

        {history.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '4rem' }}>💭</div>
            <p>No mood history yet. Go chat and share how you feel!</p>
            <button className="back-btn" onClick={() => navigate('/chat')}>Start Chatting</button>
          </div>
        ) : (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-number">{history.length}</div>
                <div className="stat-label">Moods Detected</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: moodColors[history[history.length-1]?.mood] }}>
                  {moodEmojis[history[history.length-1]?.mood]}
                </div>
                <div className="stat-label">Current Mood</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{history[history.length-1]?.intensity}/10</div>
                <div className="stat-label">Last Intensity</div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <h3>Mood Intensity Over Time</h3>
                {history.length > 0 && <Line data={trendData} options={{ plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10 } } }} />}
              </div>
              <div className="chart-card">
                <h3>Emotion Breakdown</h3>
                {Object.keys(moodCounts).length > 0 && <Doughnut data={donutData} options={{ plugins: { legend: { position: 'bottom' } } }} />}
              </div>
            </div>

            <div className="top-movies">
              <h3>Your Mood History</h3>
              <div className="history-list">
                {history.slice().reverse().map((h, i) => (
                  <div key={i} className="history-item">
                    <div className="history-emoji" style={{ color: moodColors[h.mood] }}>{moodEmojis[h.mood]}</div>
                    <div className="history-info">
                      <div className="history-text">"{h.text}"</div>
                      <div className="history-meta">{h.mood} — intensity {h.intensity}/10 — {h.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;