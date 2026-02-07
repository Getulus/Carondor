import React, { FC, useState, useEffect } from 'react';
import { SavedGame, Item } from '../services/gameService';
import imageUtils from '../utils/imageUtils';
import './HeroModal.css';

interface HeroModalProps {
  gameState: SavedGame;
  onClose: () => void;
}

export const HeroModal: FC<HeroModalProps> = ({ gameState, onClose }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    loadItems();
  }, [gameState.id]);

  const loadItems = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/load/${gameState.id}`);
      const data = await response.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  const handleEquip = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/${gameState.id}/item/${itemId}/equip`, {
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
      const response = await fetch(`http://localhost:5000/api/game/${gameState.id}/item/${itemId}/unequip`, {
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
    <div className="hero-modal-overlay" onClick={onClose}>
      <div className="hero-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="hero-modal-close" onClick={onClose}>✕</button>
        
        <div className="hero-modal-header">
          <h2>{gameState.hero_name}</h2>
          <div className="hero-modal-subtitle">
            <span>{gameState.hero_class}</span>
            <span>•</span>
            <span>{gameState.hero_race}</span>
            <span>•</span>
            <span>Level {gameState.level}</span>
          </div>
        </div>

        <div className="hero-modal-body">
          <div className="hero-left-section">
            <div className="hero-modal-portrait">
              <img
                src={imageUtils.getHeroImage(gameState.hero_name, gameState.hero_class)}
                alt={gameState.hero_name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23333'/%3E%3Ctext x='150' y='180' text-anchor='middle' fill='%23d4af37' font-size='28' font-weight='bold'%3E${encodeURIComponent(gameState.hero_name)}%3C/text%3E%3Ctext x='150' y='220' text-anchor='middle' fill='%23888' font-size='18'%3E${encodeURIComponent(gameState.hero_class)}%3C/text%3E%3Ctext x='150' y='245' text-anchor='middle' fill='%23888' font-size='18'%3ELevel ${gameState.level}%3C/text%3E%3C/svg%3E`;
                }}
              />
            </div>

            <div className="hero-modal-stats">
              <h3>Statistics</h3>
              <div className="hero-stat-grid">
                <div className="hero-stat-item">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{gameState.level}</span>
                </div>
                <div className="hero-stat-item">
                  <span className="stat-label">Experience</span>
                  <span className="stat-value">{gameState.experience} XP</span>
                </div>
                <div className="hero-stat-item">
                  <span className="stat-label">Attack</span>
                  <span className="stat-value">⚔️ {gameState.hero_attack || 10}</span>
                </div>
                <div className="hero-stat-item">
                  <span className="stat-label">Defense</span>
                  <span className="stat-value">🛡️ {gameState.hero_defense || 8}</span>
                </div>
                <div className="hero-stat-item">
                  <span className="stat-label">Magic</span>
                  <span className="stat-value">✨ {gameState.hero_magic || 5}</span>
                </div>
                <div className="hero-stat-item">
                  <span className="stat-label">HP</span>
                  <span className="stat-value">❤️ {gameState.hero_hp || 100}</span>
                </div>
              </div>
            </div>

            <div className="hero-modal-info">
              <h3>Hero Information</h3>
              <div className="hero-info-grid">
                <div className="hero-info-item">
                  <span className="info-label">Class:</span>
                  <span className="info-value">{gameState.hero_class}</span>
                </div>
                <div className="hero-info-item">
                  <span className="info-label">Race:</span>
                  <span className="info-value">{gameState.hero_race}</span>
                </div>
                <div className="hero-info-item">
                  <span className="info-label">Buildings:</span>
                  <span className="info-value">{gameState.buildings.length}</span>
                </div>
                <div className="hero-info-item">
                  <span className="info-label">Army Units:</span>
                  <span className="info-value">{gameState.units.reduce((sum, u) => sum + u.count, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right-section">
            <div className="hero-equipment-section">
              <h3>⚔️ Equipped Items</h3>
              <div className="hero-equipment-slots">
                {slots.map(slot => {
                  const equippedItem = getItemsBySlot(slot);
                  return (
                    <div key={slot} className="hero-equipment-slot">
                      <div className="hero-slot-label">{slot.toUpperCase()}</div>
                      {equippedItem ? (
                        <div 
                          className={`hero-item-card rarity-${equippedItem.rarity}`}
                          onClick={() => setSelectedItem(equippedItem)}
                        >
                          <div className="hero-item-name">{equippedItem.template_data.name}</div>
                          <div className="hero-item-rarity">{equippedItem.rarity}</div>
                          <button 
                            className="hero-unequip-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnequip(equippedItem.id);
                            }}
                          >
                            Unequip
                          </button>
                        </div>
                      ) : (
                        <div className="hero-empty-slot">Empty</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hero-inventory-section">
              <h3>🎒 Inventory ({inventoryItems.length} items)</h3>
              {inventoryItems.length === 0 ? (
                <div className="hero-empty-inventory">No items in inventory</div>
              ) : (
                <div className="hero-inventory-grid">
                  {inventoryItems.map(item => (
                    <div 
                      key={item.id}
                      className={`hero-item-card rarity-${item.rarity}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="hero-item-name">{item.template_data.name}</div>
                      <div className="hero-item-type">{item.template_data.slot}</div>
                      <div className="hero-item-rarity">{item.rarity}</div>
                      <button 
                        className="hero-equip-btn"
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
              <div className="hero-item-details">
                <h3>{selectedItem.template_data.name}</h3>
                <div className={`hero-detail-rarity rarity-${selectedItem.rarity}`}>
                  {selectedItem.rarity.toUpperCase()}
                </div>
                <div className="hero-detail-type">
                  {selectedItem.template_data.slot} - {selectedItem.template_data.type}
                </div>
                <div className="hero-detail-stats">
                  <h4>Stats:</h4>
                  {Object.entries(selectedItem.stats).map(([stat, value]) => (
                    <div key={stat} className="hero-stat-row">
                      <span className="hero-stat-name">{stat.replace('_', ' ')}:</span>
                      <span className="hero-stat-value">+{value}</span>
                    </div>
                  ))}
                </div>
                <div className="hero-detail-description">
                  {selectedItem.template_data.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
