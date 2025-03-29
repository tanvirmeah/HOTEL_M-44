import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './AllBookings.css';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [checkInDetails, setCheckInDetails] = useState({
    totalReceived: 0,
    managerAcknowledgement: false,
  });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    fetchBookings();

    const bookingsSubscription = supabase.channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
    }
  };

  const cancelBooking = async (reservationId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('reservation_id', reservationId);

      if (error) {
        console.error('Error cancelling booking:', error);
      } else {
        // Optimistically update the UI
        setBookings(bookings.filter(booking => booking.reservation_id !== reservationId));
      }
    } catch (error) {
      console.error('Error cancelling booking:', error.message);
    }
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
        setBookings(bookings.filter(booking => booking.reservation_id !== reservationId));
      }
    } catch (error) {
      console.error('Error restoring booking:', error.message);
    }
  };

  const editBooking = (reservationId) => {
    navigate(`/create-booking?edit=${reservationId}`);
  };

  const viewBooking = (reservationId) => {
    navigate(`/booking-summary/${reservationId}`);
  };

  const handleCheckInClick = (reservationId) => {
    const booking = bookings.find(b => b.reservation_id === reservationId);
    if (booking) {
      setCurrentBookingId(reservationId);
      setCheckInDetails({
        totalReceived: booking.total_received?.amount || 0,
        managerAcknowledgement: false,
      });
      setShowCheckInPopup(true);
    }
  };

  const handleCheckInConfirm = async () => {
    if (!checkInDetails.managerAcknowledgement) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          check_in_status: true,
          status: 'active',
          total_received: { ...checkInDetails, amount: parseFloat(checkInDetails.totalReceived) || 0 },
        })
        .eq('reservation_id', currentBookingId);

      if (error) {
        console.error('Error updating booking:', error);
      } else {
        // Optimistically update the UI
        setBookings(bookings.map(booking =>
          booking.reservation_id === currentBookingId
            ? { ...booking, check_in_status: true, total_received: { ...checkInDetails, amount: parseFloat(checkInDetails.totalReceived) || 0 } }
            : booking
        ));
      }
    } catch (error) {
      console.error('Error updating booking:', error.message);
    }

    setShowCheckInPopup(false);
    setCurrentBookingId(null);
    setCheckInDetails({ totalReceived: 0, managerAcknowledgement: false });
  };

  const handleCheckInCancel = () => {
    setShowCheckInPopup(false);
    setCurrentBookingId(null);
    setCheckInDetails({ totalReceived: 0, managerAcknowledgement: false });
  };

  const handleTotalReceivedChange = (e) => {
    setCheckInDetails({ ...checkInDetails, totalReceived: e.target.value });
  };

  const handleRestoreClick = async (reservationId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ check_in_status: false })
        .eq('reservation_id', reservationId);

      if (error) {
        console.error('Error restoring booking:', error);
      } else {
        // Optimistically update the UI
        setBookings(bookings.map(booking =>
          booking.reservation_id === reservationId
            ? { ...booking, check_in_status: false }
            : booking
        ));
      }
    } catch (error) {
      console.error('Error restoring booking:', error.message);
    }
  };

  const filteredBookings = bookings.slice().reverse().filter(booking => {
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
  }).filter(booking => booking.status !== 'cancelled' && !booking.check_in_status);

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
    <div className="all-bookings">
      <h2>All Bookings</h2>
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
            <th></th>
            <th></th>
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
              <td style={{ color: booking.total_due > 0 ? '#ff6a6a' : 'inherit' }}>{booking.total_due}</td>
              <td>
                <button onClick={() => editBooking(booking.reservation_id)}>Edit</button>
                <button onClick={() => cancelBooking(booking.reservation_id)}>Cancel</button>
              </td>
              <td>
                <span className="icon view-icon" onClick={() => viewBooking(booking.reservation_id)}>👁️</span>
              </td>
              <td>
                {!booking.check_in_status && booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
                  <span className="icon checkout-icon" onClick={() => handleCheckInClick(booking.reservation_id)}>✔️</span>
                )}
                {booking.check_in_status && (
                  <span className="icon restore-icon" onClick={() => handleRestoreClick(booking.reservation_id)}>↩️</span>
                )}
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
      {showCheckInPopup && currentBookingId && (
        <div className="popup">
          <div className="popup-content">
            <h3>Check-In Confirmation</h3>
            {bookings.find(b => b.reservation_id === currentBookingId) && (
              <>
                <p><strong>Reservation ID:</strong> {currentBookingId}</p>
                <p><strong>Advance Payment:</strong> BDT {bookings.find(b => b.reservation_id === currentBookingId).advance_payment?.amount}</p>
                <label>
                  Total Received:
                  <input
                    type="number"
                    value={checkInDetails.totalReceived}
                    onChange={handleTotalReceivedChange}
                  />
                </label>
                <p>
                  <strong>Total Due: </strong>
                  BDT {bookings.find(b => b.reservation_id === currentBookingId).total_due}
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={checkInDetails.managerAcknowledgement}
                    onChange={(e) => setCheckInDetails({ ...checkInDetails, managerAcknowledgement: e.target.checked })}
                  />
                  As a manager, I acknowledge receiving the full payment and take full responsibility for it.
                </label>
              </>
            )}

            <div className='popup-buttons'>
              <button onClick={handleCheckInConfirm} disabled={!checkInDetails.managerAcknowledgement}>Confirm</button>
              <button onClick={handleCheckInCancel}>Cancel</button>
            </div>
            <button className="close-button" onClick={handleCheckInCancel}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
