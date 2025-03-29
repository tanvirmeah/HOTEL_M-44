import React, { useState, useEffect } from 'react';
import './Setting.css';
import supabase from '../supabaseClient';

const Setting = () => {
  const [hotelName, setHotelName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [settingsId, setSettingsId] = useState('1');

  useEffect(() => {
    fetchSettings();

    const settingsSubscription = supabase.channel('settings-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          if (payload.new.id === settingsId) {
            setHotelName(payload.new.hotelName || '');
            setAddressLine1(payload.new.addressLine1 || '');
            setAddressLine2(payload.new.addressLine2 || '');
            setPhone(payload.new.phone || '');
            setLogoUrl(payload.new.logoUrl || '');
            setLanguage(payload.new.language || 'en');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsSubscription);
    };
  }, [settingsId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setSettingsId(data.id);
        setHotelName(data.hotelName || '');
        setAddressLine1(data.addressLine1 || '');
        setAddressLine2(data.addressLine2 || '');
        setPhone(data.phone || '');
        setLogoUrl(data.logoUrl || '');
        setLanguage(data.language || 'en');
      } else {
        await createInitialSettings();
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const createInitialSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .insert([{ id: settingsId }])
        .select();

      if (error) {
        console.error('Error creating initial settings:', error);
      } else {
        console.log('Initial settings created:', data);
        fetchSettings();
      }
    } catch (error) {
      console.error('Error creating initial settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert([
          {
            id: settingsId,
            hotelName,
            addressLine1,
            addressLine2,
            phone,
            logoUrl,
            language,
          },
        ], { onConflict: 'id' })
        .select();

      if (error) {
        console.error('Error saving settings:', error);
        alert(`Error saving settings: ${error.message}`);
      } else {
        console.log('Settings saved successfully:', data);
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An unexpected error occurred while saving settings.');
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you ABSOLUTELY SURE you want to reset ALL data? This will clear ALL data? This action CANNOT be undone.")) {
      localStorage.removeItem('bookings');
      localStorage.removeItem('minibarItems');
      window.location.reload();
      alert("All data has been reset.");
    }
  };

  return (
    <div className="setting">
      <h2>Setting</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Hotel Name:</label>
          <input type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} />
        </div>
        <div>
          <label>Address Line 1:</label>
          <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
        </div>
        <div>
          <label>Address Line 2:</label>
          <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
        </div>
        <div>
          <label>Phone:</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label>Logo URL:</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Hotel Logo"
              style={{ maxWidth: '170px', maxHeight: '90px', marginTop: '10px' }}
            />
          )}
        </div>
        <div>
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <button type="submit">Save Settings</button>
      </form>
      <button className="reset-button" onClick={handleReset}>Reset All Data</button>
    </div>
  );
};

export default Setting;
