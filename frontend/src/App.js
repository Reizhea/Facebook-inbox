import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { useCallback } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', !prev);
      return !prev;
    });
  };
  
  const fetchMessages = useCallback(async (limitValue = limit) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/messages?limit=${limitValue}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);
  
  useEffect(() => {
    fetchMessages(limit);
  }, [limit, fetchMessages]);

  const groupedByUser = [...messages]
    .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
    .reduce((acc, msg) => {
      if (!acc[msg.from]) acc[msg.from] = [];
      acc[msg.from].push(msg);
      return acc;
    }, {});

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="dark-toggle-wrapper">
        <input
          type="checkbox"
          id="dark-mode-switch"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        <label htmlFor="dark-mode-switch" className="custom-switch">
          <span className={`emoji moon ${darkMode ? 'hide' : ''}`}>🌙</span>
          <span className={`emoji sun ${darkMode ? '' : 'hide'}`}>☀️</span>
          <span className="slider-ball"></span>
        </label>
      </div>
      
      <h1>Facebook Page Inbox</h1>

      <div className="controls">
        <label htmlFor="limit">Show </label>
        <select
          id="limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <label> messages</label>
        <button className="refresh" title="Refresh messages" onClick={() => fetchMessages(limit)}>
          <img src="https://cdn-icons-png.flaticon.com/512/61/61444.png" alt="Refresh" className="refresh-icon" />
        </button>
      </div>

      <div className={`user-columns ${Object.keys(groupedByUser).length === 1 ? 'single-user' : ''}`}>
        {loading ? (
          <div className="loading">
          <div>Loading messages...</div>
          <div className="subtext">This might take a few seconds — backend server's waking up </div>
        </div>
        ) : Object.keys(groupedByUser).length === 0 ? (
          <div className="empty">No messages available.</div>
        ) : (
          Object.entries(groupedByUser).map(([user, msgs]) => (
            <div className="user-column" key={user}>
              <div className="user-header">
                <div className="username">{user}</div>
              </div>
              <div className="message-scroll">
                {msgs.map((msg) => (
                  <div key={msg.id} className="message-bubble">
                    <div className="text" title={msg.message}>
                      {msg.message.length > 250 ? msg.message.slice(0, 250) + '...' : msg.message}
                    </div>
                    <div className="timestamp">{new Date(msg.created_time).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
