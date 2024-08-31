import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  }, [darkMode]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      setMessages([...messages, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      
      try {
        const response = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputMessage }),
        });
        
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { text: data.response, sender: 'bot' }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { text: "Sorry, I couldn't process your request.", sender: 'bot' }]);
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderMessage = (message) => {
    const paragraphs = message.text.split('\n');
    return (
      <div className={`message ${message.sender}`}>
        {paragraphs.map((paragraph, index) => {
          if (paragraph.includes(':')) {
            const [key, value] = paragraph.split(':');
            return (
              <p key={index}>
                <strong>{key.trim()}:</strong> {value.trim()}
              </p>
            );
          } else if (paragraph.startsWith('*')) {
            return (
              <p key={index} className="list-item">
                {paragraph}
              </p>
            );
          } else {
            return <p key={index}>{paragraph}</p>;
          }
        })}
      </div>
    );
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="chat-container">
        <div className="chat-header">
          <h1>ChatBot</h1>
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => renderMessage(message))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
