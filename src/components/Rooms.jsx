import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import './Rooms.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: '', type: '' });
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editedRoom, setEditedRoom] = useState({ name: '', type: '' });
  const [showAddRoomPopup, setShowAddRoomPopup] = useState(false);

  useEffect(() => {
    fetchRooms();

    const subscription = supabase
      .channel('any')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        (payload) => {
          console.log('Change received!', payload);
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');
      if (error) throw error;
      if (data) {
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert(error.message);
    }
  };

  const handleInputChange = (e) => {
    setNewRoom({ ...newRoom, [e.target.name]: e.target.value });
  };

  const generateAlphanumericRoomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomId = '';
    for (let i = 0; i < 4; i++) {
      roomId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomId;
  };

  const handleAddRoom = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to add a room.');
      return;
    }

    try {
      const nextRoomId = generateAlphanumericRoomId();
      const roomToAdd = { ...newRoom, id: nextRoomId };

      const { data, error } = await supabase
        .from('rooms')
        .insert([roomToAdd]);

      if (error) throw error;

      setNewRoom({ name: '', type: '' });
      fetchRooms();
      setShowAddRoomPopup(false);
    } catch (error) {
      console.error('Error adding room:', error);
      alert(error.message);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoomId(room.id);
    setEditedRoom({ name: room.name, type: room.type });
  };

  const handleEditedInputChange = (e) => {
    setEditedRoom({ ...editedRoom, [e.target.name]: e.target.value });
  };

  const handleUpdateRoom = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(editedRoom)
        .eq('id', editingRoomId);
      if (error) throw error;
      setEditingRoomId(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      alert(error.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error.message);
    }
  };

  const handleOpenAddRoomPopup = () => {
    setShowAddRoomPopup(true);
  };

  const handleCloseAddRoomPopup = () => {
    setShowAddRoomPopup(false);
  };

  return (
    <div className="rooms">
      <h2>Rooms</h2>

      {/* Add Room Button */}
      <button onClick={handleOpenAddRoomPopup}>Add Room</button>

      {/* Add Room Popup */}
      {showAddRoomPopup && (
        <div className="add-room-popup">
          <div className="popup-content">
            <span className="close" onClick={handleCloseAddRoomPopup}>&times;</span>
            <h3>Add New Room</h3>
            <div className="form-group">
              <label htmlFor="name">Room Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Room Name"
                value={newRoom.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="type">Room Type:</label>
              <input
                type="text"
                id="type"
                name="type"
                placeholder="Room Type"
                value={newRoom.type}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={handleAddRoom}>Add Room</button>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id}>
              <td>
                {editingRoomId === room.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editedRoom.name}
                    onChange={handleEditedInputChange}
                  />
                ) : (
                  room.name
                )}
              </td>
              <td>
                {editingRoomId === room.id ? (
                  <input
                    type="text"
                    name="type"
                    value={editedRoom.type}
                    onChange={handleEditedInputChange}
                  />
                ) : (
                  room.type
                )}
              </td>
              <td>
                {editingRoomId === room.id ? (
                  <>
                    <button onClick={handleUpdateRoom}>Update</button>
                    <button onClick={() => setEditingRoomId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditRoom(room)}>Edit</button>
                    <button onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rooms;
