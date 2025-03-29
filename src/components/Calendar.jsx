import React from 'react';
import './Calendar.css';

const Calendar = () => {
  // Mock booking data
  const bookings = [
    { date: '2024-07-15', room: 'Super Deluxe - 201' },
    { date: '2024-07-18', room: 'Deluxe - 203' },
    { date: '2024-07-22', room: 'Standard - 102' },
  ];

    const rooms = [
        "Super Deluxe - 201",
        "Super Deluxe - 202",
        "Deluxe - 203",
        "Deluxe - 204",
        "Standard - 101",
        "Standard - 102",
        "Standard - 103",
        "Premium - 104"
    ];

  const currentMonth = "July 2024";
  const daysInMonth = 31;

    const getBookingsForDate = (day) => {
        const dateStr = `2024-07-${String(day).padStart(2, '0')}`;
        return bookings.filter(booking => booking.date === dateStr);
    };


  return (
    <div className="calendar">
      <h2>{currentMonth}</h2>
      <div className="calendar-grid">
        <div className="day-header">Sun</div>
        <div className="day-header">Mon</div>
        <div className="day-header">Tue</div>
        <div className="day-header">Wed</div>
        <div className="day-header">Thu</div>
        <div className="day-header">Fri</div>
        <div className="day-header">Sat</div>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <div key={day} className="day">
            {day}
            {getBookingsForDate(day).map((booking, index) => (
                <div key={index} className="booking">{booking.room}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
