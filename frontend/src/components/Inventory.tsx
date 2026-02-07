import React, { useState, useEffect } from 'react';
import { Item } from '../services/gameService';
import './Inventory.css';

interface InventoryProps {
  gameId: number;
  onClose: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ gameId, onClose }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    loadItems();
  }, [gameId]);

  const loadItems = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/load/${gameId}`);
      const data = await response.json();
      if (data.items) {
        setItems(data.items);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load items:', error);
      setLoading(false);
    }
  };

  const handleEquip = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/${gameId}/item/${itemId}/equip`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        loadItems();
      }
    } catch (error) {
      console.error('Failed to equip item:', error);
    }
  };

  const handleUnequip = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/${gameId}/item/${itemId}/unequip`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        loadItems();
      }
    } catch (error) {
      console.error('Failed to unequip item:', error);
    }
  };

  const equippedItems = items.filter(item => item.equipped);
  const inventoryItems = items.filter(item => !item.equipped);

  const getItemsBySlot = (slot: string) => {
    return equippedItems.find(item => item.template_data.slot === slot);
  };

  const slots = ['weapon', 'armor', 'helmet', 'boots', 'amulet', 'ring'];

  return (
    <div className="inventory-overlay">
      <div className="inventory-modal">
        <div className="inventory-header">
          <h2>⚔️ Hero Inventory</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="inventory-content">
          {loading ? (
            <div className="loading">Loading items...</div>
          ) : (
            <>
              <div className="equipment-section">
                <h3>Equipped Items</h3>
                <div className="equipment-slots">
                  {slots.map(slot => {
                    const equippedItem = getItemsBySlot(slot);
                    return (
                      <div key={slot} className="equipment-slot">
                        <div className="slot-label">{slot.toUpperCase()}</div>
                        {equippedItem ? (
                          <div 
                            className={`item-card rarity-${equippedItem.rarity}`}
                            onClick={() => setSelectedItem(equippedItem)}
                          >
                            <div className="item-name">{equippedItem.template_data.name}</div>
                            <div className="item-rarity">{equippedItem.rarity}</div>
                            <button 
                              className="unequip-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnequip(equippedItem.id);
                              }}
                            >
                              Unequip
                            </button>
                          </div>
                        ) : (
                          <div className="empty-slot">Empty</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="inventory-section">
                <h3>Inventory ({inventoryItems.length} items)</h3>
                {inventoryItems.length === 0 ? (
                  <div className="empty-inventory">No items in inventory</div>
                ) : (
                  <div className="inventory-grid">
                    {inventoryItems.map(item => (
                      <div 
                        key={item.id}
                        className={`item-card rarity-${item.rarity}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="item-name">{item.template_data.name}</div>
                        <div className="item-type">{item.template_data.slot}</div>
                        <div className="item-rarity">{item.rarity}</div>
                        <button 
                          className="equip-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEquip(item.id);
                          }}
                        >
                          Equip
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedItem && (
                <div className="item-details">
                  <h3>{selectedItem.template_data.name}</h3>
                  <div className={`detail-rarity rarity-${selectedItem.rarity}`}>
                    {selectedItem.rarity.toUpperCase()}
                  </div>
                  <div className="detail-type">
                    {selectedItem.template_data.slot} - {selectedItem.template_data.type}
                  </div>
                  <div className="detail-stats">
                    <h4>Stats:</h4>
                    {Object.entries(selectedItem.stats).map(([stat, value]) => (
                      <div key={stat} className="stat-row">
                        <span className="stat-name">{stat.replace('_', ' ')}:</span>
                        <span className="stat-value">+{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="detail-description">
                    {selectedItem.template_data.description}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
