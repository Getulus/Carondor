import React, { FC, useEffect, useState } from 'react';
import { gameService, SavedGame, Resources, Building, Unit, BuildingType, UnitType } from '../services/gameService';
import imageUtils from '../utils/imageUtils';
import { GameHeader } from './GameHeader';
import { HeroModal } from './HeroModal';
import WorldMap from './WorldMap';
import Academy from './Academy';
import './TownManagement.css';

interface TownManagementProps {
  gameId: number;
  heroRace: string;
  onLogout?: () => void;
}

const RESOURCE_ICONS: { [key: string]: string } = {
  wood: '🪵',
  food: '🌾',
  gold: '💰',
  crystal: '💎',
  soul_energy: '👻',
  stone: '🪨',
  iron: '⚒️',
};

export const TownManagement: FC<TownManagementProps> = ({ gameId, heroRace, onLogout }) => {
  const [gameState, setGameState] = useState<SavedGame | null>(null);
  const [availableBuildings, setAvailableBuildings] = useState<BuildingType[]>([]);
  const [availableUnits, setAvailableUnits] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'buildings' | 'units' | 'worldmap'>('buildings');
  const [showHeroModal, setShowHeroModal] = useState(false);

  useEffect(() => {
    loadGameState();
    loadAvailableBuildings();
    loadAvailableUnits();
  }, [gameId, heroRace]);

  // Auto-refresh game state every 2 seconds to show production in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      loadGameState();
    }, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  const loadGameState = async () => {
    try {
      const response = await gameService.getTownStatus(gameId);
      setGameState(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load game state');
      setLoading(false);
    }
  };

  const loadAvailableBuildings = async () => {
    try {
      const response = await gameService.getAvailableBuildings();
      setAvailableBuildings(response.data);
    } catch (err) {
      console.error('Failed to load available buildings', err);
    }
  };

  const loadAvailableUnits = async () => {
    try {
      const response = await gameService.getAvailableUnits(heroRace);
      setAvailableUnits(response.data);
    } catch (err) {
      console.error('Failed to load available units', err);
    }
  };

  const handleBuildBuilding = async (buildingType: string) => {
    try {
      await gameService.createBuilding(gameId, buildingType);
      loadGameState();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to build');
    }
  };

  const handleUpgradeBuilding = async (buildingId: number) => {
    try {
      await gameService.upgradeBuilding(buildingId);
      loadGameState();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to upgrade');
    }
  };

  const handleRecruitUnit = async (unitType: string, count: number) => {
    try {
      await gameService.recruitUnit(gameId, unitType, heroRace, count);
      loadGameState();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to recruit');
    }
  };

  if (loading) return <div className="town-loading">Loading town...</div>;
  if (error) return <div className="town-error">{error}</div>;
  if (!gameState) return <div className="town-error">No game state</div>;

  const townBackgroundStyle: React.CSSProperties = {
    backgroundImage: `url('${imageUtils.getTownBackground(heroRace)}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="town-management" style={townBackgroundStyle}>
      <div className="town-overlay"></div>
      <GameHeader 
        gameState={gameState} 
        onRefresh={loadGameState} 
        onLogout={onLogout}
        onShowHero={() => setShowHeroModal(true)}
      />
      {showHeroModal && (
        <HeroModal gameState={gameState} onClose={() => setShowHeroModal(false)} />
      )}
      
      <div className="town-container">
        <div className="town-sidebar">
          <button 
            className={activeTab === 'buildings' ? 'active' : ''}
            onClick={() => setActiveTab('buildings')}
          >
            🏗️ Buildings
          </button>
          <button 
            className={activeTab === 'units' ? 'active' : ''}
            onClick={() => setActiveTab('units')}
          >
            ⚔️ Army
          </button>
          <button 
            className={activeTab === 'worldmap' ? 'active' : ''}
            onClick={() => setActiveTab('worldmap')}
          >
            🗺️ World Map
          </button>
          <button 
            className={activeTab === 'academy' ? 'active' : ''}
            onClick={() => setActiveTab('academy')}
          >
            🎓 Academy
          </button>
        </div>

        <div className="town-content">
          <div className="town-viewport">
            <div className="town-center">
              <img
                src={imageUtils.getTownBackground(heroRace)}
                alt={`${heroRace} town`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='200'%3E%3Crect width='320' height='200' fill='%23222'/%3E%3Ctext x='160' y='100' text-anchor='middle' dy='.3em' fill='white' font-size='18'%3E${heroRace} Town%3C/text%3E%3C/svg%3E`;
                }}
              />
              <div className="town-label">{heroRace} Town</div>
            </div>

            <div className="town-building-belt">
              {gameState.buildings.length === 0 ? (
                <div className="town-empty">No buildings yet. Build one to populate the town.</div>
              ) : (
                gameState.buildings.map((building) => (
                  <div key={building.id} className="town-building-tile">
                    <img
                      src={imageUtils.getBuildingImage(building.type, building.level)}
                      alt={building.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23333'/%3E%3Ctext x='48' y='48' text-anchor='middle' dy='.3em' fill='white' font-size='10'%3E${building.name}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                    <div className="tile-name">{building.name}</div>
                    <div className="tile-level">Lv {building.level}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        {activeTab === 'buildings' && (
          <div className="buildings-panel">
            <div className="existing-buildings">
              <h3>Your Buildings</h3>
              {gameState.buildings.length === 0 ? (
                <p>No buildings yet. Build some below!</p>
              ) : (
                <div className="buildings-grid">
                  {gameState.buildings.map((building) => (
                    <div key={building.id} className="building-card">
                      <div className="building-image">
                        <img 
                          src={imageUtils.getBuildingImage(building.type, building.level)}
                          alt={building.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%23555'/%3E%3Ctext x='75' y='75' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E${building.name}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      </div>
                      <h4>{building.name}</h4>
                      <div className="building-level">Level {building.level}</div>
                      <p>{building.description}</p>
                      {building.resource && (
                        <div className="building-production">
                          Produces: {building.production_per_second} {building.resource}/sec
                        </div>
                      )}
                      <div className="upgrade-cost">
                        <strong>Upgrade cost:</strong>
                        {Object.entries(building.next_level_cost).map(([res, cost]) => (
                          <span key={res} className="cost-item">
                            {RESOURCE_ICONS[res]} {cost}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleUpgradeBuilding(building.id)}
                        className="upgrade-btn"
                      >
                        Upgrade to Level {building.level + 1}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="available-buildings">
              <h3>Build New</h3>
              {(() => {
                const builtTypes = new Set(gameState.buildings.map(b => b.type));
                const unbuiltBuildings = availableBuildings.filter(b => !builtTypes.has(b.type));
                
                if (unbuiltBuildings.length === 0) {
                  return <p>All buildings have been constructed!</p>;
                }
                
                return (
                  <div className="buildings-grid">
                    {unbuiltBuildings.map((buildingType) => (
                      <div key={buildingType.type} className="building-card available">
                        <div className="building-image">
                          <img 
                            src={imageUtils.getBuildingImage(buildingType.type, 1)}
                            alt={buildingType.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%23555'/%3E%3Ctext x='75' y='75' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3E${buildingType.name}%3C/text%3E%3C/svg%3E`;
                            }}
                          />
                        </div>
                        <h4>{buildingType.name}</h4>
                        <p>{buildingType.description}</p>
                        {buildingType.resource && (
                          <div className="building-production">
                            Base production: {buildingType.production_per_second} {buildingType.resource}/sec
                          </div>
                        )}
                        <div className="build-cost">
                          <strong>Cost:</strong>
                          {Object.entries(buildingType.base_cost).map(([res, cost]) => (
                            <span key={res} className="cost-item">
                              {RESOURCE_ICONS[res]} {cost}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => handleBuildBuilding(buildingType.type)}
                          className="build-btn"
                        >
                          Build
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="units-panel">
            <div className="existing-units">
              <h3>Your Army</h3>
              {gameState.units.length === 0 ? (
                <p>No units recruited yet.</p>
              ) : (
                <div className="units-grid">
                  {gameState.units.map((unit) => (
                    <div key={unit.id} className="unit-card">
                      <div className="unit-image">
                        <img 
                          src={imageUtils.getUnitImage(unit.type)}
                          alt={unit.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23444'/%3E%3Ctext x='60' y='60' text-anchor='middle' dy='.3em' fill='white' font-size='12'%3E${unit.name}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      </div>
                      <h4>{unit.name}</h4>
                      <div className="unit-count">Count: {unit.count}</div>
                      <div className="unit-stats">
                        <span>⚔️ {unit.attack}</span>
                        <span>🛡️ {unit.defense}</span>
                        <span>❤️ {unit.hp}</span>
                      </div>
                      <p>{unit.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="available-units">
              <h3>Recruit Units</h3>
              <div className="units-grid">
                {availableUnits.map((unitType) => (
                  <div key={unitType.type} className="unit-card available">
                    <div className="unit-image">
                      <img 
                        src={imageUtils.getUnitImage(unitType.type)}
                        alt={unitType.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23444'/%3E%3Ctext x='60' y='60' text-anchor='middle' dy='.3em' fill='white' font-size='12'%3E${unitType.name}%3C/text%3E%3C/svg%3E`;
                        }}
                      />
                    </div>
                    <h4>{unitType.name}</h4>
                    <div className="unit-stats">
                      <span>⚔️ {unitType.attack}</span>
                      <span>🛡️ {unitType.defense}</span>
                      <span>❤️ {unitType.hp}</span>
                    </div>
                    <p>{unitType.description}</p>
                    <div className="recruit-cost">
                      <strong>Cost per unit:</strong>
                      {Object.entries(unitType.cost).map(([res, cost]) => (
                        <span key={res} className="cost-item">
                          {RESOURCE_ICONS[res]} {cost}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleRecruitUnit(unitType.type, 1)}
                      className="recruit-btn"
                    >
                      Recruit 1
                    </button>
                    <button 
                      onClick={() => handleRecruitUnit(unitType.type, 5)}
                      className="recruit-btn"
                    >
                      Recruit 5
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'worldmap' && (
          <div className="worldmap-panel">
            <WorldMap gameId={gameId} />
          </div>
        )}

        {activeTab === 'academy' && (
          <div className="academy-panel">
            <Academy gameId={gameId} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
