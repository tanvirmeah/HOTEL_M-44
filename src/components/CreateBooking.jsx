import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CreateBooking.css';
import './BookingSummary.css';
import supabase from '../supabaseClient';

const CreateBooking = () => {
  const [step, setStep] = useState(1);
  const [reservationId, setReservationId] = useState(null);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });
  const [bookingDetails, setBookingDetails] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [advancePayment, setAdvancePayment] = useState({
    method: 'CASH',
    amount: 0,
  });
  const [totalReceived, setTotalReceived] = useState({
    method: 'CASH',
    amount: 0,
  });
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [managerAcknowledgement, setManagerAcknowledgement] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editReservationId = searchParams.get('edit');
  const [bookingCheckedOut, setBookingCheckedOut] = useState(false);
  const [extras, setExtras] = useState([]);
  const [addons, setAddons] = useState([]);
  const [hotelSettings, setHotelSettings] = useState(null);

  useEffect(() => {
    fetchAllRooms();
    fetchExtras();
    fetchAddons();
    fetchHotelSettings();
  }, []);

  const fetchAllRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        setAllRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchExtras = async () => {
    try {
      const { data, error } = await supabase
        .from('extras')
        .select('*');
      if (error) {
        console.error('Error fetching extras:', error);
      } else {
        setExtras(data);
      }
    } catch (error) {
      console.error('Error fetching extras:', error);
    }
  };

  const fetchAddons = async () => {
    try {
      const { data, error } = await supabase
        .from('addons')
        .select('*');
      if (error) {
        console.error('Error fetching addons:', error);
      } else {
        setAddons(data);
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
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

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };
  const prevStep = () => setStep(step - 1);

  const handleGuestInfoChange = (e) => {
    setGuestInfo({ ...guestInfo, [e.target.name]: e.target.value });
  };

  const handleAddRoom = () => {
    setBookingDetails([...bookingDetails, { checkInDate: '', checkOutDate: '', room_id: '', price: 0, adults: 1, children: 0, extras: [] }]);
  };

  const handleRoomChange = (index, field, value) => {
    const updatedDetails = [...bookingDetails];
    if (field.startsWith('extras')) {
      const extraName = field.split('-')[1];
      const existingExtraIndex = updatedDetails[index].extras.findIndex(e => e.name === extraName);

      if (existingExtraIndex > -1) {
        updatedDetails[index].extras[existingExtraIndex] = {
          ...updatedDetails[index].extras[existingExtraIndex],
          quantity: parseInt(value) || 0
        };
      } else {
        updatedDetails[index].extras.push({ name: extraName, quantity: parseInt(value) || 0, price: 0, nights: 1 });
      }
    } else if (field.startsWith('extraPrice')) {
      const extraName = field.split('-')[1];
      const existingExtraIndex = updatedDetails[index].extras.findIndex(e => e.name === extraName);
      if (existingExtraIndex > -1) {
        updatedDetails[index].extras[existingExtraIndex] = {
          ...updatedDetails[index].extras[existingExtraIndex],
          price: parseFloat(value) || 0
        };
      }
    } else if (field.startsWith('nights')) {
      const extraName = field.split('-')[1];
      const existingExtraIndex = updatedDetails[index].extras.findIndex(e => e.name === extraName);
      if (existingExtraIndex > -1) {
        updatedDetails[index].extras[existingExtraIndex] = {
          ...updatedDetails[index].extras[existingExtraIndex],
          nights: parseInt(value) || 1
        };
      }
    }
    else {
      updatedDetails[index][field] = value;
    }
    setBookingDetails(updatedDetails);
  };

  const handleRemoveRoom = (index) => {
    const updatedDetails = [...bookingDetails];
    updatedDetails.splice(index, 1);
    setBookingDetails(updatedDetails);
  };

  const handleAdvancePaymentChange = (e) => {
    setAdvancePayment({ ...advancePayment, [e.target.name]: e.target.value });
  };

  const handleTotalReceivedChange = (e) => {
    setTotalReceived({ ...totalReceived, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    let total = 0;
    for (const detail of bookingDetails) {
      const checkIn = new Date(detail.checkInDate);
      const checkOut = new Date(detail.checkOutDate);
      const diffInDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
      const numNights = isNaN(diffInDays) || diffInDays < 0 ? 0 : diffInDays;

      total += (parseFloat(detail.price) || 0) * numNights;
      for (const extra of detail.extras) {
        const nights = extra.nights || 1;
        total += (parseFloat(extra.price) || 0) * (parseInt(extra.quantity) || 0) * nights;
      }
    }
    return total;
  };

  const calculateTotalDue = () => {
    const totalAmount = calculateTotal();
    const totalPaid = (parseFloat(advancePayment.amount) || 0) + (parseFloat(totalReceived.amount) || 0);
    return totalAmount - totalPaid;
  };

  const calculateRoomTotal = (detail) => {
    const checkIn = new Date(detail.checkInDate);
    const checkOut = new Date(detail.checkOutDate);
    const diffInDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    const numNights = isNaN(diffInDays) || diffInDays < 0 ? 0 : diffInDays;
    let roomTotal = (parseFloat(detail.price) || 0) * numNights;

    return roomTotal;
  };

  const calculateExtraTotal = (extra) => {
    const nights = extra.nights || 1;
    return (parseFloat(extra.price) || 0) * (parseInt(extra.quantity) || 0) * nights;
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return (
          guestInfo.name.trim() !== '' &&
          guestInfo.email.trim() !== '' &&
          guestInfo.phone.trim() !== '' &&
          guestInfo.address.trim() !== '' &&
          guestInfo.city.trim() !== '' &&
          guestInfo.country.trim() !== ''
        );
      case 2:
        if (bookingDetails.length === 0) {
          return false;
        }
        return bookingDetails.every(detail =>
          detail.checkInDate.trim() !== '' &&
          detail.checkOutDate.trim() !== '' &&
          detail.room_id.trim() !== '' &&
          parseFloat(detail.price) > 0
        );
      case 3:
        return !checkInStatus || (checkInStatus && managerAcknowledgement);
      case 4:
        return true;
      default:
        return true;
    }
  };

  const toggleCheckIn = () => setCheckInStatus(!checkInStatus);

  const generateReservationId = () => {
    let id = 'T-';
    for (let i = 0; i < 8; i++) {
      id += Math.floor(Math.random() * 10);
    }
    return id;
  };

  const saveBookingToSupabase = async (bookingData) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();

      if (error) {
        console.error('Error saving booking to Supabase:', error);
      } else {
        console.log('Booking saved to Supabase:', data);
      }
    } catch (error) {
      console.error('Error saving booking to Supabase:', error);
    }
  };

  const updateBookingInSupabase = async (reservationId, bookingData) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('reservation_id', reservationId)
        .select();

      if (error) {
        console.error('Error updating booking in Supabase:', error);
      } else {
        console.log('Booking updated in Supabase:', data);
      }
    } catch (error) {
      console.error('Error updating booking in Supabase:', error);
    }
  };

  const saveBooking = async () => {
    const id = reservationId || generateReservationId();
    const bookingData = {
      reservation_id: id,
      guest_info: guestInfo,
      booking_details: bookingDetails,
      advance_payment: advancePayment,
      total_received: totalReceived,
      total_amount: calculateTotal(),
      total_due: calculateTotalDue(),
      check_in_status: checkInStatus
    };

    if (editReservationId) {
      await updateBookingInSupabase(editReservationId, bookingData);
    } else {
      await saveBookingToSupabase(bookingData);
    }

    let existingBookings = JSON.parse(localStorage.getItem('bookings')) || [];

    if (editReservationId) {
      const indexToUpdate = existingBookings.findIndex(booking => booking.reservationId === editReservationId);
      if (indexToUpdate !== -1) {
        existingBookings[indexToUpdate] = bookingData;
      } else {
        console.warn(`Booking with reservationId ${editReservationId} not found for update.`);
        existingBookings.push(bookingData);
      }
    } else {
      existingBookings.push(bookingData);
    }

    localStorage.setItem('bookings', JSON.stringify(existingBookings));
  };

  const clearForm = () => {
    setGuestInfo({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
    });

    setBookingDetails([]);

    setAdvancePayment({
      method: 'CASH',
      amount: 0
    });

    setTotalReceived({
      method: 'CASH',
      amount: 0
    });

    setCheckInStatus(false);
    setManagerAcknowledgement(false);
    setReservationId(null);
  }

  useEffect(() => {
    if (editReservationId) {
      const fetchBookingData = async () => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('reservation_id', editReservationId)
            .single();

          if (error) {
            console.error('Error fetching booking:', error);
          } else if (data) {
            setGuestInfo(data.guest_info);
            setBookingDetails(data.booking_details);
            setAdvancePayment(data.advance_payment);
            setTotalReceived(data.total_received);
            setCheckInStatus(data.check_in_status);
            setReservationId(data.reservation_id);
            setStep(1);
          } else {
            console.warn(`Booking with reservationId ${editReservationId} not found in Supabase.`);
          }
        } catch (error) {
          console.error('Error fetching booking:', error);
        }
      };

      fetchBookingData();
    } else {
      setReservationId(generateReservationId());
    }
  }, [editReservationId, navigate]);

  useEffect(() => {
    if (step === 5) {
      saveBooking();
      clearForm();
      const timer = setTimeout(() => {
        navigate('/all-bookings');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const fetchAvailableRooms = async (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) {
      setAvailableRooms(allRooms);
      return;
    }

    try {
      const { data: bookedRooms, error } = await supabase
        .from('bookings')
        .select('room_id')
        .gte('check_out_date', checkInDate)
        .lte('check_in_date', checkOutDate);

      if (error) {
        console.error('Error fetching booked rooms:', error);
        return;
      }

      const bookedRoomIds = bookedRooms.map(booking => booking.room_id);
      const available = allRooms.filter(room => !bookedRoomIds.includes(room.id));
      setAvailableRooms(available);
    } catch (error) {
      console.error('Error fetching booked rooms:', error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step1">
            <h3>Guest Information</h3>
            <div className="input-group">
              <div>
                <label>Name:</label>
                <input type="text" name="name" value={guestInfo.name} onChange={handleGuestInfoChange} />
              </div>
              <div>
                <label>Email:</label>
                <input type="email" name="email" value={guestInfo.email} onChange={handleGuestInfoChange} />
              </div>
            </div>
            <div className="input-group">
              <div>
                <label>Phone:</label>
                <input type="tel" name="phone" value={guestInfo.phone} onChange={handleGuestInfoChange} />
              </div>
              <div>
                <label>Address:</label>
                <input type="text" name="address" value={guestInfo.address} onChange={handleGuestInfoChange} />
              </div>
            </div>

            <div className="input-group">
              <div>
                <label>City:</label>
                <input type="text" name="city" value={guestInfo.city} onChange={handleGuestInfoChange} />
              </div>
              <div>
                <label>Country:</label>
                <input type="text" name="country" value={guestInfo.country} onChange={handleGuestInfoChange} />
              </div>
            </div>
            <button onClick={nextStep} disabled={!validateStep()}>Next</button>
          </div>
        );
      case 2:
        return (
          <div className="step2">
            <h3>Booking Details</h3>
            <p className="info-text">
              Standard Check-in Time: 12:00 PM <br />
              Standard Check-out Time: 11:00 AM
            </p>
            {bookingDetails.map((detail, index) => (
              <div key={index} className="room-booking" style={{ backgroundColor: softColors[index % softColors.length] }}>
                <h4>Room {index + 1}</h4>
                <div className="input-group">
                  <div>
                    <label>Check-in Date:</label>
                    <input
                      type="date"
                      value={detail.checkInDate}
                      onChange={(e) => {
                        handleRoomChange(index, 'checkInDate', e.target.value);
                        fetchAvailableRooms(e.target.value, detail.checkOutDate);
                      }}
                    />
                  </div>
                  <div>
                    <label>Check-out Date:</label>
                    <input
                      type="date"
                      value={detail.checkOutDate}
                      onChange={(e) => {
                        handleRoomChange(index, 'checkOutDate', e.target.value);
                        fetchAvailableRooms(detail.checkInDate, e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div>
                    <label>Room:</label>
                    <select value={detail.room_id} onChange={(e) => handleRoomChange(index, 'room_id', e.target.value)}>
                      <option value="">Select Room</option>
                      {availableRooms.map((room) => (
                        <option key={room.id} value={room.id}>{room.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Price per Night (BDT):</label>
                    <input type="number" value={detail.price} onChange={(e) => handleRoomChange(index, 'price', e.target.value)} />
                  </div>
                </div>

                <div className="input-group">
                  <div>
                    <label>Adults:</label>
                    <input type="number" min="1" value={detail.adults} onChange={(e) => handleRoomChange(index, 'adults', parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <label>Children:</label>
                    <input type="number" min="0" value={detail.children} onChange={(e) => handleRoomChange(index, 'children', parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className='extras-section'>
                  <h4>Extras</h4>
                  {extras.map((extra, extraIndex) => (
                    <div key={extra.id} className="input-group">
                      <div>
                        <label>{extra.name}:</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Quantity"
                          value={detail.extras.find((e) => e.name === extra.name)?.quantity || ''}
                          onChange={(e) => handleRoomChange(index, `extras-${extra.name}`, e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Price (BDT):</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Price (BDT)"
                          value={detail.extras.find((e) => e.name === extra.name)?.price || ''}
                          onChange={(e) => handleRoomChange(index, `extraPrice-${extra.name}`, e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Nights:</label>
                        <input
                          type="number"
                          min="1"
                          value={detail.extras.find((e) => e.name === extra.name)?.nights || 1}
                          onChange={(e) => handleRoomChange(index, `nights-${extra.name}`, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <h4>Add-ons</h4>
                  {addons.map((addon, addonIndex) => (
                    <div key={addon.id} className="input-group">
                      <div>
                        <label>{addon.name}:</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Quantity"
                          value={detail.extras.find((e) => e.name === addon.name)?.quantity || ''}
                          onChange={(e) => handleRoomChange(index, `extras-${addon.name}`, e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Price (BDT):</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="Price (BDT)"
                          value={detail.extras.find((e) => e.name === addon.name)?.price || ''}
                          onChange={(e) => handleRoomChange(index, `extraPrice-${addon.name}`, e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'none' }}>
                        <label>Nights:</label>
                        <input
                          type="number"
                          min="1"
                          value={detail.extras.find((e) => e.name === addon.name)?.nights || 1}
                          onChange={(e) => handleRoomChange(index, `nights-${addon.name}`, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => handleRemoveRoom(index)}>Remove Room</button>
              </div>
            ))}
            <button type="button" onClick={handleAddRoom}>Add Room</button>
            <div className="step-buttons">
              <button onClick={prevStep}>Previous</button>
              <button onClick={nextStep} disabled={!validateStep()}>Next</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step3">
            <h3>Payment Details</h3>
            <div className="payment-section advance-payment">
              <h4>Advance Payment</h4>
              <label>Payment Method:</label>
              <select name="method" value={advancePayment.method} onChange={handleAdvancePaymentChange} disabled={checkInStatus}>
                <option value="CASH">CASH</option>
                <option value="bKash">bKash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
              <label>Amount (BDT):</label>
              <input type="number" name="amount" value={advancePayment.amount} onChange={handleAdvancePaymentChange} disabled={checkInStatus} />
            </div>
            <div className="status-indicators">
              <button type="button" onClick={toggleCheckIn}>
                Check-in {checkInStatus ? '✅' : '☐'}
              </button>
            </div>

            {checkInStatus && (
              <div className="payment-section total-received">
                <h4>Total Received</h4>
                <label>Payment Method:</label>
                <select name="method" value={totalReceived.method} onChange={handleTotalReceivedChange}>
                  <option value="CASH">CASH</option>
                  <option value="bKash">bKash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
                <label>Amount (BDT):</label>
                <input type="number" name="amount" value={totalReceived.amount} onChange={handleTotalReceivedChange} />
              </div>
            )}

            <div className="total-amount">Total Amount: BDT {calculateTotal()}</div>
            <div className="total-due">Total Due: BDT {calculateTotalDue()}</div>

            {checkInStatus && (
              <div className='manager-acknowledgement'>
                <label>
                  <input
                    type="checkbox"
                    checked={managerAcknowledgement}
                    onChange={(e) => setManagerAcknowledgement(e.target.checked)}
                  />
                  As a manager, I acknowledge receiving the full payment and take full responsibility for it.
                </label>
              </div>
            )}

            <div className="step-buttons">
              <button onClick={prevStep}>Previous</button>
              <button onClick={nextStep} disabled={!validateStep()}>Next</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="booking-summary">
            <header>
              <div className="hotel-info">
                {hotelSettings ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <h1>Your Hotel Name</h1>
                    <p>Address Line 1</p>
                    <p>Address Line 2</p>
                    <p>Phone: +123 456 7890</p>
                  </>
                )}
              </div>
              <div className="reservation-id">
                Reservation ID: {reservationId}
              </div>
            </header>

            <section className="summary-section">
              <h3>Billed To:</h3>
              <p><strong>Guest Name:</strong> {guestInfo.name}</p>
              <p><strong>Email:</strong> {guestInfo.email}</p>
              <p><strong>Phone:</strong> {guestInfo.phone}</p>
              <p><strong>Address:</strong> {guestInfo.address}, {guestInfo.city}, {guestInfo.country}</p>
            </section>

            <section className="summary-section">
              <h3>Issued on:</h3>
              <p>{new Date().toLocaleDateString()}</p>
            </section>

            <section className="summary-section">
              <h3>Services</h3>
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
                  {bookingDetails.map((bookingDetail, index) => {
                    const checkIn = new Date(bookingDetail.checkInDate);
                    const checkOut = new Date(bookingDetail.checkOutDate);
                    const diffInDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
                    const numNights = isNaN(diffInDays) || diffInDays < 0 ? 0 : diffInDays;
                    const roomTotal = calculateRoomTotal(bookingDetail);

                    // Find the room name based on room_id
                    const room = allRooms.find(room => room.id === bookingDetail.room_id);
                    const roomName = room ? room.name : 'N/A';

                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td colSpan="5"><strong>Room {index + 1}: {roomName}</strong> - {formatDate(bookingDetail.checkInDate)} to {formatDate(bookingDetail.checkOutDate)} ({bookingDetail.adults} Adults, {bookingDetail.children} Children)</td>
                        </tr>
                        <tr>
                          <td>Room Charge</td>
                          <td></td>
                          <td>{bookingDetail.price}</td>
                          <td>{numNights}</td>
                          <td>{roomTotal}</td>
                        </tr>
                        {bookingDetail.extras.map((extra, extraIndex) => {
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

            {bookingDetails.minibarItems && Object.keys(bookingDetails.minibarItems).length > 0 && (
              <section className="summary-section">
                <h3>Minibar Items</h3>
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
                    {Object.entries(booking.minibarItems).map(([itemId, quantity]) => {
                      const item = items.find(i => i.id === itemId);
                      if (!item) return null;
                      const total = item.price * quantity;
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
                      <td><strong>BDT {minibarTotal}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            <section className="total-section">
              <p>Advance Payment: BDT {advancePayment.amount} ({advancePayment.method})</p>
              <p>Total Received: BDT {totalReceived.amount} ({totalReceived.method})</p>
              <p className='total-amount'>Total Amount: BDT {calculateTotal()}</p>
              <p className='total-due'>Total Due: BDT {calculateTotalDue()}</p>
            </section>
            <div className="step-buttons">
              <button onClick={prevStep}>Previous</button>
              <button onClick={nextStep} disabled={!validateStep()}>Next</button>
            </div>
          </div>

        );
      case 5:
        return (
          <div className="step5">
            <h3>Booking Confirmation</h3>
            <p>Thank you! Your booking has been confirmed.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const softColors = [
    '#f0f8ff',
    '#faebd7',
    '#f5fffa',
    '#f0fff0',
    '#e6e6fa',
    '#fff0f5',
    '#f8f8ff',
  ];

  return (
    <div className="create-booking">
      <h2>Create Booking</h2>
      {renderStep()}
    </div>
  );
};

export default CreateBooking;
