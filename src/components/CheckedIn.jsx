import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import './CheckedIn.css';

const CheckedIn = () => {
  const [checkedInBookings, setCheckedInBookings] = useState([]);
  const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [minibarItems, setMinibarItems] = useState([]);
  const [selectedMinibarItems, setSelectedMinibarItems] = useState({}); // { [itemId]: quantity }
  const navigate = useNavigate();

  useEffect(() => {
    fetchCheckedInBookings();
    fetchMinibarItems();

    const bookingsSubscription = supabase.channel('public:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          fetchCheckedInBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSubscription);
    };
  }, []);

  const fetchCheckedInBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('check_in_status', true)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching checked-in bookings:', error);
      } else {
        setCheckedInBookings(data);
      }
    } catch (error) {
      console.error('Error fetching checked-in bookings:', error.message);
    }
  };

  const fetchMinibarItems = async () => {
    try {
      const { data, error } = await supabase
        .from('minibar_items')
        .select('*');

      if (error) {
        console.error('Error fetching minibar items:', error);
      } else {
        setMinibarItems(data);
      }
    } catch (error) {
      console.error('Error fetching minibar items:', error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = String(date.getFullYear()).slice(-2); // Use 2-digit year
    return `${day}-${month}-${year}`;
  };

  const handleCheckoutClick = (reservationId) => {
    setCurrentBookingId(reservationId);
    setShowCheckoutPopup(true);
    setSelectedMinibarItems({}); // Reset selected items
  };

  const handleCheckoutConfirm = async () => {
    // 1. Calculate total minibar cost
    let minibarTotal = 0;
    for (const itemId in selectedMinibarItems) {
      const item = minibarItems.find(item => item.id === itemId);
      if (item) {
        minibarTotal += item.price * selectedMinibarItems[itemId];
      }
    }

    try {
      // 2. Update booking in Supabase: checked_in_status = false, status = 'checked_out', add minibar items and total
      const { error } = await supabase
        .from('bookings')
        .update({
          check_in_status: false,
          status: 'checked_out',
          minibar_items: selectedMinibarItems,
          minibar_total: minibarTotal,
        })
        .eq('reservation_id', currentBookingId);

      if (error) {
        console.error('Error updating booking:', error);
      } else {
        // 3. Update minibar item stock in Supabase
        for (const itemId in selectedMinibarItems) {
          const consumedQuantity = selectedMinibarItems[itemId];
          await supabase
            .from('minibar_items')
            .update({ stock: item => item.stock - consumedQuantity })
            .eq('id', itemId);
        }

        // 4. Update state to remove from CheckedIn list
        setCheckedInBookings(checkedInBookings.filter(b => b.reservation_id !== currentBookingId));
        setShowCheckoutPopup(false);
        setCurrentBookingId(null);
        setSelectedMinibarItems({});

        // 5. Navigate to Summary page
        navigate(`/booking-summary/${currentBookingId}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error.message);
    }
  };

  const handleCheckoutCancel = () => {
    setShowCheckoutPopup(false);
    setCurrentBookingId(null);
    setSelectedMinibarItems({}); // Clear selections
  };

  const handleMinibarSelect = (itemId, quantity) => {
    setSelectedMinibarItems(prevSelected => {
      const newSelected = { ...prevSelected };
      if (quantity > 0) {
        newSelected[itemId] = parseInt(quantity, 10); // Ensure it's a number
      } else {
        delete newSelected[itemId]; // Remove if quantity is 0 or less
      }
      return newSelected;
    });
  };

  // Calculate total due for a specific booking
  const calculateTotalDue = (booking) => {
    const totalPaid = (parseFloat(booking.advance_payment?.amount) || 0) + (parseFloat(booking.total_received?.amount) || 0);
    return Math.max(0, booking.total_amount - totalPaid); // Ensure it's not negative
  };

  const calculateMinibarItemTotal = () => {
    let total = 0;
    for (const itemId in selectedMinibarItems) {
      const item = minibarItems.find(item => item.id === itemId);
      if (item) {
        total += item.price * selectedMinibarItems[itemId];
      }
    }
    return total;
  };

  const editBooking = (reservationId) => {
    navigate(`/create-booking?edit=${reservationId}`);
  };

  return (
    <div className="checked-in">
      <h2>Checked-In Guests</h2>
      {checkedInBookings.length === 0 ? (
        <p>No bookings have been checked in yet.</p>
      ) : (
        <table className="checked-in-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Rooms</th>
              <th>Adults/Children</th>
              <th>Extras</th>
              <th>Total Amount (BDT)</th>
              <th>Advance (BDT)</th>
              <th>Received (BDT)</th>
              <th>Due (BDT)</th>
              <th>Checkout</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {checkedInBookings.map((booking) => (
              <tr key={booking.reservation_id}>
                <td>{booking.reservation_id}</td>
                <td>{booking.guest_info?.name}</td>
                <td>{booking.guest_info?.email}</td>
                <td>{booking.guest_info?.phone}</td>
                <td>{`${booking.guest_info?.address}, ${booking.guest_info?.city}, ${booking.guest_info?.country}`}</td>
                <td>
                  {booking.booking_details?.map((roomDetail, index) => (
                    <div key={index}>{formatDate(roomDetail.checkInDate)}</div>
                  ))}
                </td>
                <td>
                  {booking.booking_details?.map((roomDetail, index) => (
                    <div key={index}>{formatDate(roomDetail.checkOutDate)}</div>
                  ))}
                </td>
                <td>
                  {booking.booking_details?.map((roomDetail, index) => (
                    <div key={index}>{roomDetail.room_id}</div>
                  ))}
                </td>
                <td>
                  {booking.booking_details?.map((roomDetail, index) => (
                    <div key={index}>{roomDetail.adults} / {roomDetail.children}</div>
                  ))}
                </td>
                <td>
                  {booking.booking_details?.map((roomDetail, index) => (
                    <div key={index}>
                      {roomDetail.extras?.map((extra, extraIndex) => (
                        <div key={`extra-${index}-${extraIndex}`}>{extra.name} (Qty: {extra.quantity}, Price: {extra.price}{extra.nights && extra.nights > 1 ? `, Nights: ${extra.nights}` : ''})</div>
                      ))}
                    </div>
                  ))}
                </td>
                <td>{booking.total_amount}</td>
                <td>{booking.advance_payment?.amount}</td>
                <td>{booking.total_received?.amount}</td>
                <td style={{ color: booking.total_due > 0 ? '#ff6a6a' : 'inherit' }}>
                  {calculateTotalDue(booking)} {/* Use the function here */}
                </td>
                <td>
                  <span className="icon checkout-icon" onClick={() => handleCheckoutClick(booking.reservation_id)}>
                    ❌
                  </span>
                </td>
                <td>
                  <button onClick={() => editBooking(booking.reservation_id)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Checkout Popup */}
      {showCheckoutPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Select Minibar Items</h3>
            <button className="close-button" onClick={handleCheckoutCancel}>X</button>
            <div className="minibar-selection">
              <div className='minibar-column'>
                <h4>Amenities</h4>
                {minibarItems.filter(item => item.category === 'Amenities').map(item => (
                  <div key={item.id} className="minibar-item">
                    <label>
                      {item.name} (BDT {item.price}):
                      <input
                        type="number"
                        min="0"
                        value={selectedMinibarItems[item.id] || 0}
                        onChange={(e) => handleMinibarSelect(item.id, e.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className='minibar-column'>
                <h4>Minibar</h4>
                {minibarItems.filter(item => item.category === 'Minibar').map(item => (
                  <div key={item.id} className="minibar-item">
                    <label>
                      {item.name} (BDT {item.price}):
                      <input
                        type="number"
                        min="0"
                        value={selectedMinibarItems[item.id] || 0}
                        onChange={(e) => handleMinibarSelect(item.id, e.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <p><strong>Total Minibar Cost: BDT {calculateMinibarItemTotal()}</strong></p>
            <div className='popup-buttons'>
              <button onClick={handleCheckoutConfirm}>Confirm Checkout</button>
              <button onClick={handleCheckoutCancel}>Cancel</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CheckedIn;
