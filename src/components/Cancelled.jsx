import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import './Cancelled.css';

const Cancelled = () => {
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchCancelledBookings();
  }, []);

  const fetchCancelledBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'cancelled');

      if (error) {
        console.error('Error fetching cancelled bookings:', error);
      } else {
        setCancelledBookings(data);
      }
    } catch (error) {
      console.error('Error fetching cancelled bookings:', error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const restoreBooking = async (reservationId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'active' })
        .eq('reservation_id', reservationId);

      if (error) {
        console.error('Error restoring booking:', error);
      } else {
        // Optimistically update the UI
        setCancelledBookings(cancelledBookings.filter(booking => booking.reservation_id !== reservationId));
      }
    } catch (error) {
      console.error('Error restoring booking:', error.message);
    }
  };

  const filteredBookings = cancelledBookings.slice().reverse().filter(booking => {
    const searchLower = searchText.toLowerCase();
    const checkInDates = booking.booking_details?.map(detail => detail.checkInDate).join(' ') || '';
    const checkOutDates = booking.booking_details?.map(detail => detail.checkOutDate).join(' ') || '';

    return (
      booking.reservation_id?.toLowerCase().includes(searchLower) ||
      booking.guest_info?.name?.toLowerCase().includes(searchLower) ||
      booking.guest_info?.phone?.toLowerCase().includes(searchLower) ||
      checkInDates.toLowerCase().includes(searchLower) ||
      checkOutDates.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="cancelled-bookings">
      <h2>Cancelled Bookings</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Reservation ID</th>
            <th>Guest Name</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Room</th>
            <th>Total Amount (BDT)</th>
            <th>Advance (BDT)</th>
            <th>Received (BDT)</th>
            <th>Due (BDT)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.map((booking, index) => (
            <tr key={booking.reservation_id} className="booking-row">
              <td>{booking.reservation_id}</td>
              <td>{booking.guest_info?.name}</td>
              <td>
                {booking.booking_details?.map((roomDetail, roomIndex) => (
                  <div key={roomIndex}>{formatDate(roomDetail.checkInDate)}</div>
                ))}
              </td>
              <td>
                {booking.booking_details?.map((roomDetail, roomIndex) => (
                  <div key={roomIndex}>{formatDate(roomDetail.checkOutDate)}</div>
                ))}
              </td>
              <td>
                {booking.booking_details?.map((roomDetail, roomIndex) => (
                  <div key={roomIndex}>{roomDetail.room_id}</div>
                ))}
              </td>
              <td>{booking.total_amount}</td>
              <td>{booking.advance_payment?.amount}</td>
              <td>{booking.total_received?.amount}</td>
              <td>{booking.total_due}</td>
              <td>
                <span className="icon restore-icon" onClick={() => restoreBooking(booking.reservation_id)}>⬆️</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Cancelled;
