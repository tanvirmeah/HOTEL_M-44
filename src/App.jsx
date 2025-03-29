import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import './App.css';
import Calendar from './components/Calendar';
import AllBookings from './components/AllBookings';
import Rooms from './components/Rooms';
import Extras from './components/Extras';
import Messages from './components/Messages';
import EmailSetting from './components/EmailSetting';
import AISetting from './components/AISetting';
import Setting from './components/Setting';
import Analytics from './components/Analytics';
import CreateBooking from './components/CreateBooking';
import Minibar from './components/Minibar';
import CheckedIn from './components/CheckedIn';
import CheckedOut from './components/CheckedOut';
import Cancelled from './components/Cancelled';
import BookingSummary from './components/BookingSummary';
import MinibarSales from './components/MinibarSales';
import supabase from './supabaseClient';

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Router>
      {session ? (
        <Dashboard />
      ) : (
        <LandingPage />
      )}
    </Router>
  );
};

const LandingPage = () => {
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        alert(error.message);
      } else {
        navigate('/calendar');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      if (error) {
        alert(error.message);
      } else {
        alert('Sign-up successful! Check your email to verify your account.');
        setSignUp(false);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="landing-page">
      <h1>Welcome to Hotel Dashboard</h1>
      <div className="auth-container">
        {signUp ? (
          <form onSubmit={handleSignUp}>
            <h2>Sign Up</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Sign Up</button>
            <button type="button" onClick={() => setSignUp(false)}>
              Already have an account? Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn}>
            <h2>Sign In</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Sign In</button>
            <button type="button" onClick={() => setSignUp(true)}>
              Don't have an account? Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Hotel Dashboard</h2>
        <ul>
          <li><NavLink to="/analytics">📊 Analytics</NavLink></li>
          <li><NavLink to="/calendar">📅 Calendar</NavLink></li>
          <li><NavLink to="/all-bookings">📋 All Bookings</NavLink></li>
          <li><NavLink to="/checked-in">✔️ Checked-in</NavLink></li>
          <li><NavLink to="/checked-out">✅ Checked-out</NavLink></li>
          <li><NavLink to="/cancelled">❌ Cancelled</NavLink></li>
          <li><NavLink to="/rooms">🛏️ Rooms</NavLink></li>
          <li><NavLink to="/extras">➕ Extras</NavLink></li>
          <li><NavLink to="/minibar">🍾 Minibar</NavLink></li>
          <li><NavLink to="/minibar-sales">💰 Minibar Sales</NavLink></li>
          <li><NavLink to="/messages">✉️ Messages</NavLink></li>
          <li><NavLink to="/email-setting">📧 Email Setting</NavLink></li>
          <li><NavLink to="/ai-setting">🤖 AI Setting</NavLink></li>
          <li><NavLink to="/setting">⚙️ Setting</NavLink></li>
        </ul>
        <NavLink to="/create-booking" className="create-booking-button">➕ Create Booking</NavLink>
        <button onClick={handleSignOut} className="logout-button">Logout</button>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/all-bookings" element={<AllBookings />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/extras" element={<Extras />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/email-setting" element={<EmailSetting />} />
          <Route path="/ai-setting" element={<AISetting />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/create-booking" element={<CreateBooking />} />
          <Route path="/minibar" element={<Minibar />} />
          <Route path="/checked-in" element={<CheckedIn />} />
          <Route path="/checked-out" element={<CheckedOut />} />
          <Route path="/cancelled" element={<Cancelled />} />
          <Route path="/booking-summary/:reservationId" element={<BookingSummary />} />
          <Route path="/minibar-sales" element={<MinibarSales />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
