import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analytics = () => {
    const [bookings, setBookings] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    useEffect(() => {
        const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        setBookings(storedBookings);

        // Set the current month and year as default
        const today = new Date();
        setSelectedYear(String(today.getFullYear()));
        setSelectedMonth(String(today.getMonth() + 1).padStart(2, '0')); // Month is 0-indexed
    }, []);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    // Filter bookings based on selected month/year
    const filteredBookings = bookings.filter(booking => {
        if (!selectedMonth || !selectedYear) {
            return true; // Show all if no month/year selected
        }
        return booking.bookingDetails?.some(detail => {
            const checkInYear = detail.checkInDate.substring(0, 4);
            const checkInMonth = detail.checkInDate.substring(5, 7);
            return checkInYear === selectedYear && checkInMonth === selectedMonth;
        }) ?? false;
    });

    // Calculate revenue based on filtered bookings
    const calculateRevenue = (bookingsToCalculate) => {
        return bookingsToCalculate.reduce((total, booking) => {
            return total + booking.totalAmount; // Use the pre-calculated totalAmount
        }, 0);
    };

    const dailyRevenue = calculateRevenue(filteredBookings.filter(booking => {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return booking.bookingDetails?.some(detail => detail.checkInDate === todayStr) ?? false; // Simple daily check
    }));

    const monthlyRevenue = calculateRevenue(filteredBookings); // Revenue for selected month
    const totalRevenue = calculateRevenue(bookings); // All-time revenue


    return (
        <div className="analytics">
            <h2>Analytics</h2>
            <div className="month-selector">
                <label>Select Month: </label>
                <select value={selectedMonth} onChange={handleMonthChange}>
                    {/* Options for months (January to December) */}
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
                <label>Select Year: </label>
                <select value={selectedYear} onChange={handleYearChange}>
                    {/* Options for years (e.g., last 5 years) */}
                    <option value="">Select Year</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>

                </select>
            </div>
            <div className="revenue-cards">
                <div className="revenue-card">
                    <h3>Daily Revenue</h3>
                    <p>BDT {dailyRevenue}</p>
                </div>
                <div className="revenue-card">
                    <h3>Monthly Revenue</h3>
                    <p>BDT {monthlyRevenue}</p>
                </div>
                <div className="revenue-card">
                    <h3>Total Revenue</h3>
                    <p>BDT {totalRevenue}</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
