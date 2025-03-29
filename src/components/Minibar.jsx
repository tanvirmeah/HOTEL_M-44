import React, { useState, useEffect } from 'react';
import './Minibar.css';
import supabase from '../supabaseClient';

const Minibar = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', category: 'Amenities', stock: 0, price: 0 });
  const [editItem, setEditItem] = useState(null);
  const [showAddItemPopup, setShowAddItemPopup] = useState(false);

  useEffect(() => {
    fetchItems();

    const itemsSubscription = supabase.channel('public:minibar_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'minibar_items' },
        (payload) => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(itemsSubscription);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('minibar_items')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching minibar items:', error);
      } else {
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching minibar items:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setShowAddItemPopup(true);
  };

  const handlePopupClose = () => {
    setShowAddItemPopup(false);
    setNewItem({ name: '', category: 'Amenities', stock: 0, price: 0 });
  };

  const addItem = async () => {
    if (newItem.name.trim() !== '') {
      try {
        const { data, error } = await supabase
          .from('minibar_items')
          .insert([newItem]);

        if (error) {
          console.error('Error adding item:', error);
        } else {
          setNewItem({ name: '', category: 'Amenities', stock: 0, price: 0 });
          setShowAddItemPopup(false);
          fetchItems();
        }
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
  };

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('minibar_items')
        .delete()
        .match({ id: id });

      if (error) {
        console.error('Error deleting item:', error);
      } else {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const startEditing = (item) => {
    setEditItem({ ...item });
  };

  const handleEditInputChange = (e) => {
    setEditItem({ ...editItem, [e.target.name]: e.target.value });
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase
        .from('minibar_items')
        .update(editItem)
        .match({ id: editItem.id });

      if (error) {
        console.error('Error updating item:', error);
      } else {
        setEditItem(null);
        fetchItems();
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const cancelEdit = () => {
    setEditItem(null);
  };

  const amenities = items.filter(item => item.category === 'Amenities');
  const minibar = items.filter(item => item.category === 'Minibar');

  return (
    <div className="minibar">
      <h2>Minibar & Amenities</h2>
      <button className="add-item-button" onClick={handleAddClick}>Add Item</button>

      {showAddItemPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Item</h3>
            <div className="add-item-form">
              <label>Name:</label>
              <input type="text" name="name" value={newItem.name} onChange={handleInputChange} />

              <label>Category:</label>
              <select name="category" value={newItem.category} onChange={handleInputChange}>
                <option value="Amenities">Amenities</option>
                <option value="Minibar">Minibar</option>
              </select>
              <label>Stock:</label>
              <input type="number" name="stock" min="0" value={newItem.stock} onChange={handleInputChange} />
              <label>Price (BDT):</label>
              <input type="number" name="price" min="0" value={newItem.price} onChange={handleInputChange} />
              <div className='popup-buttons'>
                <button onClick={addItem}>Add</button>
                <button onClick={handlePopupClose}>Cancel</button>
              </div>
            </div>
            <button className="close-button" onClick={handlePopupClose}>X</button>
          </div>
        </div>
      )}
      <h3>Amenities</h3>
      <div className="table-container">
        <table className="minibar-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock</th>
              <th>Price (BDT)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {amenities.map((item) => (
              <tr key={item.id}>
                {editItem && editItem.id === item.id ? (
                  <>
                    <td><input type="text" name='name' value={editItem.name} onChange={handleEditInputChange} /></td>
                    <td><input type="number" name='stock' min="0" value={editItem.stock} onChange={handleEditInputChange} /></td>
                    <td><input type="number" name='price' min="0" value={editItem.price} onChange={handleEditInputChange} /></td>
                    <td>
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.name}</td>
                    <td>{item.stock}</td>
                    <td>{item.price}</td>
                    <td>
                      <button onClick={() => startEditing(item)}>Edit</button>
                      <button onClick={() => deleteItem(item.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Minibar</h3>
      <div className="table-container">
        <table className="minibar-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock</th>
              <th>Price (BDT)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {minibar.map((item) => (
              <tr key={item.id}>
                {editItem && editItem.id === item.id ? (
                  <>
                    <td><input type="text" name='name' value={editItem.name} onChange={handleEditInputChange} /></td>
                    <td><input type="number" name='stock' min="0" value={editItem.stock} onChange={handleEditInputChange} /></td>
                    <td><input type="number" name='price' min="0" value={editItem.price} onChange={handleEditInputChange} /></td>
                    <td>
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.name}</td>
                    <td>{item.stock}</td>
                    <td>{item.price}</td>
                    <td>
                      <button onClick={() => startEditing(item)}>Edit</button>
                      <button onClick={() => deleteItem(item.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Minibar;
