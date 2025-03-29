import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../supabaseClient';
import './BookingSummary.css';

const BookingSummary = () => {
  const { reservationId } = useParams();
  const [booking, setBooking] = useState(null);
  const [minibarItems, setMinibarItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hotelSettings, setHotelSettings] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('reservation_id', reservationId)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
        } else {
          setBooking(data);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      }
    };

    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*');

        if (error) {
          console.error('Error fetching rooms:', error);
        } else {
          setRooms(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    const fetchHotelSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching hotel settings:', error);
        } else {
          setHotelSettings(data);
        }
      } catch (error) {
        console.error('Error fetching hotel settings:', error);
      }
    };

    fetchBooking();
    fetchRooms();
    fetchHotelSettings();
  }, [reservationId]);

  useEffect(() => {
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
        console.error('Error fetching minibar items:', error);
      }
    };

    fetchMinibarItems();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  if (!booking || !hotelSettings) {
    return <div>Loading booking details...</div>;
  }

  const calculateRoomTotal = (detail) => {
    const checkIn = new Date(detail.checkInDate);
    const checkOut = new Date(detail.checkOutDate);
    const diffInDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    const numNights = isNaN(diffInDays) || diffInDays < 0 ? 0 : diffInDays;
    return (parseFloat(detail.price) || 0) * numNights;
  };

  const calculateExtraTotal = (extra) => {
    const nights = extra.nights || 1;
    return (parseFloat(extra.price) || 0) * (parseInt(extra.quantity) || 0) * nights;
  };

  const calculateMinibarTotal = () => {
    let total = 0;
    if (booking.minibar_items) {
      Object.entries(booking.minibar_items).forEach(([itemId, quantity]) => {
        const item = minibarItems.find(i => i.id === itemId);
        if (item) {
          total += parseFloat(item.price || 0) * parseInt(quantity || 0);
        }
      });
    }
    return total;
  };

  const calculateTotalDue = () => {
    const totalPaid = (parseFloat(booking.advance_payment?.amount) || 0) + (parseFloat(booking.total_received?.amount) || 0);
    return Math.max(0, booking.total_amount - totalPaid);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="booking-summary">
      <header>
        <div className="hotel-info">
          {hotelSettings.logoUrl && (
            <img
              src={hotelSettings.logoUrl}
              alt="Hotel Logo"
              style={{ maxWidth: '170px', maxHeight: '90px' }}
            />
          )}
          <h1 style={{ fontSize: '1.3em' }}>{hotelSettings.hotelName || 'Your Hotel Name'}</h1>
          <p>{hotelSettings.addressLine1 || 'Address Line 1'}</p>
          <p>{hotelSettings.addressLine2 || 'Address Line 2'}</p>
          <p>Phone: {hotelSettings.phone || '+123 456 7890'}</p>
        </div>
        <div className="reservation-id">
          Reservation ID: {booking.reservation_id}
        </div>
      </header>

      <section className="summary-section">
        <h3>Billed To:</h3>
        <p><strong>Guest Name:</strong> {booking.guest_info?.name}</p>
        <p><strong>Email:</strong> {booking.guest_info?.email}</p>
        <p><strong>Phone:</strong> {booking.guest_info?.phone}</p>
        <p><strong>Address:</strong> {booking.guest_info?.address}, {booking.guest_info?.city}, {booking.guest_info?.country}</p>
      </section>

      <section className="summary-section">
        <h3>Issued on:</h3>
        <p>{new Date().toLocaleDateString()}</p>
      </section>

      <section className="summary-section">
        <h3>Room Reservation Details</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty.</th>
              <th>Price</th>
              <th>Night</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {booking.booking_details?.map((bookingDetail, index) => {
              const room = rooms.find(room => room.id === bookingDetail.room_id);
              const roomName = room ? room.name : 'N/A';

              const checkIn = new Date(bookingDetail.checkInDate);
              const checkOut = new Date(bookingDetail.checkOutDate);
              const diffInDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
              const numNights = isNaN(diffInDays) || diffInDays < 0 ? 0 : diffInDays;
              const roomTotal = calculateRoomTotal(bookingDetail);

              return (
                <React.Fragment key={index}>
                  <tr>
                    <td colSpan="5"><strong>Room {index + 1}: {roomName}</strong> - {formatDate(bookingDetail.checkInDate)} to {formatDate(bookingDetail.checkOutDate)}  ({bookingDetail.adults} Adults, {bookingDetail.children} Children)</td>
                  </tr>
                  <tr>
                    <td>Room Charge</td>
                    <td></td>
                    <td>{bookingDetail.price}</td>
                    <td>{numNights}</td>
                    <td>{roomTotal}</td>
                  </tr>
                  {bookingDetail.extras?.map((extra, extraIndex) => {
                    const extraTotal = calculateExtraTotal(extra);
                    return (
                      <tr key={`extra-${index}-${extraIndex}`}>
                        <td>- {extra.name}</td>
                        <td>{extra.quantity}</td>
                        <td>{extra.price}</td>
                        <td>{extra.nights || ''}</td>
                        <td>{extraTotal}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="summary-section">
        <h3>Minibar Summary</h3>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price (BDT)</th>
              <th>Total (BDT)</th>
            </tr>
          </thead>
          <tbody>
            {booking.minibar_items && Object.entries(booking.minibar_items).map(([itemId, quantity]) => {
              const item = minibarItems.find(i => i.id === itemId);
              if (!item) return null;
              const total = item?.price * quantity;
              return (
                <tr key={itemId}>
                  <td>{item.name}</td>
                  <td>{quantity}</td>
                  <td>{item.price}</td>
                  <td>{total}</td>
                </tr>
              )
            })}
            <tr>
              <td colSpan="3"><strong>Minibar Total:</strong></td>
              <td><strong>BDT {calculateMinibarTotal()}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="total-section">
        <p>Advance Payment: BDT {booking.advance_payment?.amount} ({booking.advance_payment?.method})</p>
        <p>Total Received: BDT {booking.total_received?.amount} ({booking.total_received?.method})</p>
        <p className='total-amount'>Total Amount: BDT {booking.total_amount}</p>
        <p className='total-due'>Total Due: BDT {calculateTotalDue()}</p>
      </section>
      <button onClick={handlePrint} className="print-button">Print</button>
    </div>
  );
};

export default BookingSummary;
