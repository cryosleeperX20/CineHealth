import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chat.css';

function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I'm CineHealth. Tell me how you're feeling today!" }
  ]);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const moodColors = {
    happy: '#f9c74f',
    sad: '#4cc9f0',
    anxious: '#f8961e',
    angry: '#f94144',
    neutral: '#90be6d',
    depressed: '#9b72cf',
    lonely: '#43aa8b',
    stressed: '#f3722c'
  };

  const moodEmojis = {
    happy: '😊', sad: '😢', anxious: '😰',
    angry: '😠', neutral: '😐', depressed: '😔',
    lonely: '🥺', stressed: '😓'
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const moodRes = await axios.post('http://localhost:8000/analyze-mood', { text: input });
      const detectedMood = moodRes.data.mood;
      const intensity = moodRes.data.intensity;
      setMood({ label: detectedMood, intensity });
      const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
history.push({ mood: detectedMood, intensity, text: input, time: new Date().toLocaleTimeString() });
localStorage.setItem('moodHistory', JSON.stringify(history));

      const recRes = await axios.post('http://localhost:8000/recommend', {
        user_id: 1,
        mood: detectedMood,
        n: 6
      });
      setMovies(recRes.data.recommendations);

      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'I sense you are feeling ' + detectedMood + ' (intensity: ' + intensity + '/10). Here are some movies that might help!'
      }]);

    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Oops! Make sure the backend is running.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-page">
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <div className="chat-panel">
        <div className="chat-header">
          <span className="logo">CineHealth</span>
          <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={"message " + msg.from}>
              {msg.from === 'bot' && <span className="avatar">🎬</span>}
              <div className="bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <span className="avatar">🎬</span>
              <div className="bubble typing">Analyzing your mood...</div>
            </div>
          )}
        </div>

        <div className="input-area">
          <input
            type="text"
            placeholder="Tell me how you are feeling..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      <div className="right-panel">
        <div className="mood-meter">
          <h3>Your Mood</h3>
          {mood ? (
            <div className="mood-display">
              <div className="mood-emoji" style={{ color: moodColors[mood.label] }}>
                {moodEmojis[mood.label] || '🎭'}
              </div>
              <div className="mood-label" style={{ color: moodColors[mood.label] }}>
                {mood.label.charAt(0).toUpperCase() + mood.label.slice(1)}
              </div>
              <div className="intensity-bar">
                <div className="intensity-fill" style={{ width: (mood.intensity * 10) + '%', background: moodColors[mood.label] }}></div>
              </div>
              <div className="intensity-text">Intensity: {mood.intensity}/10</div>
            </div>
          ) : (
            <div className="mood-placeholder">Share how you feel to see your mood</div>
          )}
        </div>

        {movies.length > 0 && (
          <div className="movies-section">
            <h3>Recommended for You</h3>
            <div className="movie-cards">
              {movies.map((movie, i) => (
                <div key={i} className="movie-card">
                  <div className="movie-poster">🎬</div>
                  <div className="movie-title">{movie.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;