import React, { useState, useEffect } from 'react';
import './Extras.css';
import supabase from '../supabaseClient';

const Extras = () => {
  const [extras, setExtras] = useState([]);
  const [addons, setAddons] = useState([]);
  const [newExtra, setNewExtra] = useState('');
  const [newAddon, setNewAddon] = useState('');
  const [editingExtraId, setEditingExtraId] = useState(null);
  const [editedExtraName, setEditedExtraName] = useState('');
  const [editingAddonId, setEditingAddonId] = useState(null);
  const [editedAddonName, setEditedAddonName] = useState('');

  useEffect(() => {
    fetchExtras();
    fetchAddons();

    const extrasSubscription = supabase.channel('public:extras')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'extras' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchExtras();
          }
        }
      )
      .subscribe();

    const addonsSubscription = supabase.channel('public:addons')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'addons' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchAddons();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(extrasSubscription);
      supabase.removeChannel(addonsSubscription);
    };
  }, []);

  const fetchExtras = async () => {
    try {
      const { data, error } = await supabase
        .from('extras')
        .select('*')
        .order('id', { ascending: false });
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
        .select('*')
        .order('id', { ascending: false });
      if (error) {
        console.error('Error fetching addons:', error);
      } else {
        setAddons(data);
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
  };

  const handleAddExtra = async () => {
    try {
      if (newExtra.trim() !== '') {
        const { data, error } = await supabase
          .from('extras')
          .insert([{ name: newExtra }]);

        if (error) {
          console.error('Error adding extra:', error);
        } else {
          setNewExtra('');
          fetchExtras(); // Refresh the list after adding
        }
      } else {
        alert('Extra name cannot be empty.');
      }
    } catch (error) {
      console.error('Error adding extra:', error);
    }
  };

  const handleAddAddon = async () => {
    try {
      if (newAddon.trim() !== '') {
        const { data, error } = await supabase
          .from('addons')
          .insert([{ name: newAddon }]);

        if (error) {
          console.error('Error adding addon:', error);
        } else {
          setNewAddon('');
          fetchAddons(); // Refresh the list after adding
        }
      } else {
        alert('Add-on name cannot be empty.');
      }
    } catch (error) {
      console.error('Error adding addon:', error);
    }
  };

  const handleEditExtra = (extra) => {
    setEditingExtraId(extra.id);
    setEditedExtraName(extra.name);
  };

  const handleUpdateExtra = async () => {
    try {
      if (editedExtraName.trim() !== '') {
        const { data, error } = await supabase
          .from('extras')
          .update({ name: editedExtraName })
          .eq('id', editingExtraId);

        if (error) {
          console.error('Error updating extra:', error);
        } else {
          setEditingExtraId(null);
          setEditedExtraName('');
          fetchExtras(); // Refresh the list after updating
        }
      } else {
        alert('Extra name cannot be empty.');
      }
    } catch (error) {
      console.error('Error updating extra:', error);
    }
  };

  const handleDeleteExtra = async (id) => {
    try {
      const { data, error } = await supabase
        .from('extras')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting extra:', error);
      } else {
        fetchExtras(); // Refresh the list after deleting
      }
    } catch (error) {
      console.error('Error deleting extra:', error);
    }
  };

  const handleEditAddon = (addon) => {
    setEditingAddonId(addon.id);
    setEditedAddonName(addon.name);
  };

  const handleUpdateAddon = async () => {
    try {
      if (editedAddonName.trim() !== '') {
        const { data, error } = await supabase
          .from('addons')
          .update({ name: editedAddonName })
          .eq('id', editingAddonId);

        if (error) {
          console.error('Error updating addon:', error);
        } else {
          setEditingAddonId(null);
          setEditedAddonName('');
          fetchAddons(); // Refresh the list after updating
        }
      } else {
        alert('Add-on name cannot be empty.');
      }
    } catch (error) {
      console.error('Error updating addon:', error);
    }
  };

  const handleDeleteAddon = async (id) => {
    try {
      const { data, error } = await supabase
        .from('addons')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting addon:', error);
      } else {
        fetchAddons(); // Refresh the list after deleting
      }
    } catch (error) {
      console.error('Error deleting addon:', error);
    }
  };

  return (
    <div className="extras-container">
      <div className="extras-section">
        <h2>Extras</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="hide-id">ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extras.map(extra => (
                <tr key={extra.id}>
                  <td className="hide-id">{extra.id}</td>
                  <td>
                    {editingExtraId === extra.id ? (
                      <input
                        type="text"
                        value={editedExtraName}
                        onChange={e => setEditedExtraName(e.target.value)}
                      />
                    ) : (
                      extra.name
                    )}
                  </td>
                  <td>
                    {editingExtraId === extra.id ? (
                      <>
                        <button onClick={handleUpdateExtra}>Update</button>
                        <button onClick={() => setEditingExtraId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditExtra(extra)}>Edit</button>
                        <button onClick={() => handleDeleteExtra(extra.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="New Extra"
            value={newExtra}
            onChange={e => setNewExtra(e.target.value)}
          />
          <button onClick={handleAddExtra}>Add Extra</button>
        </div>
      </div>

      <div className="addons-section">
        <h2>Add-ons</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th className="hide-id">ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addons.map(addon => (
                <tr key={addon.id}>
                  <td className="hide-id">{addon.id}</td>
                  <td>
                    {editingAddonId === addon.id ? (
                      <input
                        type="text"
                        value={editedAddonName}
                        onChange={e => setEditedAddonName(e.target.value)}
                      />
                    ) : (
                      addon.name
                    )}
                  </td>
                  <td>
                    {editingAddonId === addon.id ? (
                      <>
                        <button onClick={handleUpdateAddon}>Update</button>
                        <button onClick={() => setEditingAddonId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditAddon(addon)}>Edit</button>
                        <button onClick={() => handleDeleteAddon(addon.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="input-group">
          <input
            type="text"
            placeholder="New Add-on"
            value={newAddon}
            onChange={e => setNewAddon(e.target.value)}
          />
          <button onClick={handleAddAddon}>Add Add-on</button>
        </div>
      </div>
    </div>
  );
};

export default Extras;
