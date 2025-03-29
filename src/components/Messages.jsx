import React from 'react';
import './Messages.css';

const Messages = () => {
  // Mock messages data
  const messages = [
    { id: 1, sender: 'John Doe', subject: 'Booking Confirmation', content: 'Your booking is confirmed.' },
    { id: 2, sender: 'Jane Smith', subject: 'Question about room', content: 'Is breakfast included?' },
  ];

  return (
    <div className="messages">
      <h2>Messages</h2>
      {messages.map(message => (
        <div key={message.id} className="message">
          <h3>{message.subject}</h3>
          <p>From: {message.sender}</p>
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Messages;
