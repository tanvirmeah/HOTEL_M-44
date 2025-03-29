import React, { useState } from 'react';
import './AISetting.css'

const AISetting = () => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a server.
    console.log({ apiKey, model });
  };

  return (
    <div className="ai-setting">
      <h2>AI Setting</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>API Key:</label>
          <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>
        <div>
          <label>Model:</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="gpt-4">gpt-4</option>
          </select>
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default AISetting;
