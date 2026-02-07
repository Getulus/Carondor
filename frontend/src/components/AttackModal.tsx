import React, { useState, useEffect } from 'react';
import { MapTile } from '../services/mapService';
import { Unit } from '../services/gameService';
import './AttackModal.css';

interface AttackModalProps {
  tile: MapTile | null;
  gameId: number;
  onClose: () => void;
  onAttackSuccess: () => void;
}

interface BattleResult {
  success: boolean;
  message: string;
  rewards?: {
    gold: number;
    wood: number;
    food: number;
  };
  xp_gained?: number;
  levels_gained?: number;
  hero_level?: number;
  hero_xp?: number;
  hero_xp_needed?: number;
  player_power?: number;
  enemy_power?: number;
  power_needed?: number;
  dropped_item?: {
    id: number;
    item_template: string;
    rarity: string;
    equipped: boolean;
    stats: {
      [key: string]: number;
    };
    template_data: {
      name: string;
      type: string;
      slot: string;
      description: string;
    };
  };
}

interface UnitSelection {
  [unitId: number]: number;
}

const AttackModal: React.FC<AttackModalProps> = ({ tile, gameId, onClose, onAttackSuccess }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitSelection, setUnitSelection] = useState<UnitSelection>({});
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(true);

  useEffect(() => {
    loadUnits();
  }, [gameId]);

  const loadUnits = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/game/load/${gameId}`);
      const data = await response.json();
      if (data.units) {
        setUnits(data.units.filter((u: Unit) => u.count > 0));
      }
    } catch (error) {
      console.error('Failed to load units:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleUnitCountChange = (unitId: number, count: number, maxCount: number) => {
    const validCount = Math.max(0, Math.min(count, maxCount));
    setUnitSelection(prev => ({
      ...prev,
      [unitId]: validCount
    }));
  };

  const calculateTotalPower = (): number => {
    let totalPower = 0;
    units.forEach(unit => {
      const selectedCount = unitSelection[unit.id] || 0;
      // Power = (attack + defense + hp/10) * count
      const unitPower = (unit.attack + unit.defense + unit.hp / 10) * selectedCount;
      totalPower += unitPower;
    });
    return Math.floor(totalPower);
  };

  const playerPower = calculateTotalPower();

  if (!tile) return null;

  const isPlayerOwned = tile.occupied_by === 'player';
  const isNeutral = tile.occupied_by === 'neutral';
  const hasEnemy = tile.enemy !== null;

  const handleAttack = async () => {
    if (!isNeutral || !hasEnemy) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/map/attack/${gameId}/${tile.q}/${tile.r}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_power: playerPower
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setBattleResult({
          success: false,
          message: data.error || 'Attack failed'
        });
      } else {
        setBattleResult(data);
        if (data.success) {
          // Wait a moment to show the victory message
          setTimeout(() => {
            onAttackSuccess();
            onClose();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Attack failed:', error);
      setBattleResult({
        success: false,
        message: 'Failed to connect to server'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attack-modal-overlay" onClick={onClose}>
      <div className="attack-modal" onClick={(e) => e.stopPropagation()}>
        <div className="attack-modal-header">
          <h2>{tile.terrain_name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="attack-modal-content">
          {/* Tile Information */}
          <div className="tile-details">
            <p className="tile-description">{tile.description}</p>
            <div className="tile-stats">
              <p><strong>Coordinates:</strong> ({tile.q}, {tile.r})</p>
              <p><strong>Defense Bonus:</strong> +{tile.defense_bonus}</p>
              <p><strong>Movement Cost:</strong> {tile.movement_cost}</p>
            </div>

            {Object.keys(tile.resource_bonuses).length > 0 && (
              <div className="resource-bonuses">
                <strong>Resource Bonuses:</strong>
                <ul>
                  {Object.entries(tile.resource_bonuses).map(([resource, bonus]) => (
                    <li key={resource}>
                      {resource.replace('_', ' ')}: +{bonus}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Player-Owned Tile */}
          {isPlayerOwned && (
            <div className="ownership-info">
              <p className="success-text">✓ You control this territory</p>
              <p style={{marginTop: '15px', color: '#e0e0e0'}}>
                This is your land. You can build structures and station troops here.
              </p>
              {tile.q === 0 && tile.r === 0 && (
                <div style={{marginTop: '15px', padding: '15px', background: 'rgba(76, 175, 80, 0.2)', borderRadius: '6px'}}>
                  <p style={{color: '#4caf50', fontWeight: 'bold'}}>🏰 Town Center</p>
                  <p style={{color: '#e0e0e0', fontSize: '0.9rem', marginTop: '5px'}}>
                    This is your main settlement where you manage buildings and recruit units.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Neutral Tile with Enemy */}
          {isNeutral && hasEnemy && tile.enemy && (
            <>
              <div className="enemy-info">
                <h3>⚔️ {tile.enemy.name}</h3>
                <p className="enemy-description">{tile.enemy.description}</p>
                <div className="enemy-stats">
                  <p><strong>Enemy Power:</strong> {tile.enemy.power}</p>
                  <p><strong>Level:</strong> {tile.enemy.strength}</p>
                </div>
              </div>

              {!battleResult && (
                <div className="battle-controls">
                  {loadingUnits ? (
                    <p style={{textAlign: 'center', color: '#aaa'}}>Loading units...</p>
                  ) : units.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                      <p style={{color: '#ff6b6b', fontWeight: 'bold'}}>⚠ No Units Available</p>
                      <p style={{color: '#aaa', fontSize: '0.9rem', marginTop: '10px'}}>
                        You need to recruit units from your town before attacking.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="unit-selection">
                        <h4>Select Units for Attack:</h4>
                        {units.map(unit => (
                          <div key={unit.id} className="unit-selector">
                            <div className="unit-image-container">
                              <img 
                                src={`/images/units/${unit.name.toLowerCase().replace(/\s+/g, '_')}.png`}
                                alt={unit.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/images/units/default.png';
                                }}
                              />
                            </div>
                            <div className="unit-info">
                              <span className="unit-name">{unit.name}</span>
                              <span className="unit-stats">
                                ⚔ Attack: {unit.attack} | 🛡 Defense: {unit.defense} | ❤ HP: {unit.hp}
                              </span>
                              <span className="unit-available">Available: {unit.count}</span>
                            </div>
                            <div className="unit-counter">
                              <button 
                                onClick={() => handleUnitCountChange(unit.id, (unitSelection[unit.id] || 0) - 1, unit.count)}
                                disabled={!unitSelection[unit.id] || unitSelection[unit.id] === 0}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                max={unit.count}
                                value={unitSelection[unit.id] || 0}
                                onChange={(e) => handleUnitCountChange(unit.id, parseInt(e.target.value) || 0, unit.count)}
                              />
                              <button 
                                onClick={() => handleUnitCountChange(unit.id, (unitSelection[unit.id] || 0) + 1, unit.count)}
                                disabled={unitSelection[unit.id] >= unit.count}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="power-display">
                        <strong>Total Army Power:</strong> 
                        <span className="power-value">{playerPower}</span>
                      </div>
                    </>
                  )}

                  <div className="battle-prediction">
                    {playerPower >= (tile.enemy?.power || 0) ? (
                      <p className="success-text">✓ Victory likely</p>
                    ) : (
                      <p className="danger-text">⚠ Defeat likely (need {(tile.enemy?.power || 0) - playerPower} more power)</p>
                    )}
                  </div>

                  <button
                    className="attack-button"
                    onClick={handleAttack}
                    disabled={loading || loadingUnits || units.length === 0 || playerPower === 0}
                  >
                    {loading ? 'Attacking...' : 'Launch Attack'}
                  </button>
                </div>
              )}

              {battleResult && (
                <div className={`battle-result ${battleResult.success ? 'victory' : 'defeat'}`}>
                  <h3>{battleResult.success ? '🎉 Victory!' : '💀 Defeat!'}</h3>
                  <p>{battleResult.message}</p>

                  {battleResult.success && battleResult.rewards && (
                    <>
                      <div className="rewards">
                        <h4>Rewards:</h4>
                        <ul>
                          <li>Gold: +{battleResult.rewards.gold}</li>
                          <li>Wood: +{battleResult.rewards.wood}</li>
                          <li>Food: +{battleResult.rewards.food}</li>
                        </ul>
                      </div>
                      
                      {battleResult.xp_gained !== undefined && (
                        <div className="xp-gain">
                          <h4>⭐ Experience Gained:</h4>
                          <p className="xp-amount">+{battleResult.xp_gained} XP</p>
                          {battleResult.levels_gained && battleResult.levels_gained > 0 ? (
                            <div className="level-up-notification">
                              <p className="level-up-text">
                                🎊 LEVEL UP! 🎊
                              </p>
                              <p className="new-level">
                                Level {(battleResult.hero_level || 1) - battleResult.levels_gained} → {battleResult.hero_level}
                              </p>
                            </div>
                          ) : (
                            <div className="xp-progress-display">
                              <p style={{fontSize: '0.9rem', color: '#b0b0b0'}}>
                                Level {battleResult.hero_level}: {battleResult.hero_xp} / {battleResult.hero_xp_needed} XP
                              </p>
                              <div className="xp-progress-bar">
                                <div 
                                  className="xp-progress-fill"
                                  style={{width: `${((battleResult.hero_xp || 0) / (battleResult.hero_xp_needed || 1)) * 100}%`}}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {battleResult.dropped_item && (
                        <div className="item-drop">
                          <h4>⚔️ Item Dropped!</h4>
                          <div className={`item-display rarity-${battleResult.dropped_item.rarity}`}>
                            <div className="item-header">
                              <span className="item-name">{battleResult.dropped_item.template_data.name}</span>
                              <span className="item-rarity">{battleResult.dropped_item.rarity.toUpperCase()}</span>
                            </div>
                            <div className="item-type">{battleResult.dropped_item.template_data.slot} - {battleResult.dropped_item.template_data.type}</div>
                            <div className="item-stats">
                              {Object.entries(battleResult.dropped_item.stats).map(([stat, value]) => (
                                <div key={stat} className="stat-line">
                                  <span className="stat-name">{stat.replace('_', ' ')}:</span>
                                  <span className="stat-value">+{value}</span>
                                </div>
                              ))}
                            </div>
                            <div className="item-description">{battleResult.dropped_item.template_data.description}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!battleResult.success && (
                    <div className="defeat-info">
                      <p>Your Power: {battleResult.player_power}</p>
                      <p>Enemy Power: {battleResult.enemy_power}</p>
                      {battleResult.power_needed && (
                        <p className="power-needed">Need {battleResult.power_needed} more power</p>
                      )}
                      <button className="retry-button" onClick={() => setBattleResult(null)}>
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Empty or Explored Tile */}
          {!isPlayerOwned && !isNeutral && (
            <div className="neutral-info">
              <p>This tile is unexplored.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttackModal;
