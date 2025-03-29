import React, { useState } from 'react';
import './EmailSetting.css';

const EmailSetting = () => {
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a server.
    // Here, we just log it to the console.
    console.log({ smtpHost, smtpPort, smtpUsername, smtpPassword });
  };

  return (
    <div className="email-setting">
      <h2>Email Setting (SMTP)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>SMTP Host:</label>
          <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
        </div>
        <div>
          <label>SMTP Port:</label>
          <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
        </div>
        <div>
          <label>SMTP Username:</label>
          <input type="text" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} />
        </div>
        <div>
          <label>SMTP Password:</label>
          <input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} />
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default EmailSetting;
