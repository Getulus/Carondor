import React, { FC, useEffect, useState } from 'react';
import { gameService, SavedGame, Resources, Building, Unit, BuildingType, UnitType } from '../services/gameService';
import { GameHeader } from './GameHeader';
import './TownManagement.css';

interface TownManagementProps {
  gameId: number;
  heroRace: string;
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

export const TownManagement: FC<TownManagementProps> = ({ gameId, heroRace }) => {
  const [gameState, setGameState] = useState<SavedGame | null>(null);
  const [availableBuildings, setAvailableBuildings] = useState<BuildingType[]>([]);
  const [availableUnits, setAvailableUnits] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'resources' | 'buildings' | 'units'>('resources');

  useEffect(() => {
    loadGameState();
    loadAvailableBuildings();
    loadAvailableUnits();
  }, [gameId, heroRace]);

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

  return (
    <div className="town-management">
      <GameHeader gameState={gameState} onRefresh={loadGameState} />
      
      <div className="town-container">
        <div className="town-tabs">
          <button 
            className={activeTab === 'resources' ? 'active' : ''}
            onClick={() => setActiveTab('resources')}
          >
            📊 Resources
          </button>
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
        </div>

        <div className="town-content">{activeTab === 'resources' && (
          <div className="resources-panel">
            <h3>Resource Management</h3>
            <div className="resources-grid">
              {Object.entries(gameState.resources).map(([type, amount]) => (
                <div key={type} className="resource-item">
                  <span className="resource-icon">{RESOURCE_ICONS[type] || '📦'}</span>
                  <div className="resource-info">
                    <div className="resource-name">{type.replace('_', ' ')}</div>
                    <div className="resource-amount">{Math.floor(amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      <h4>{building.name}</h4>
                      <div className="building-level">Level {building.level}</div>
                      <p>{building.description}</p>
                      {building.resource && (
                        <div className="building-production">
                          Produces: {building.production_per_minute} {building.resource}/min
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
              <div className="buildings-grid">
                {availableBuildings.map((buildingType) => (
                  <div key={buildingType.type} className="building-card available">
                    <h4>{buildingType.name}</h4>
                    <p>{buildingType.description}</p>
                    {buildingType.resource && (
                      <div className="building-production">
                        Base production: {buildingType.production_per_minute} {buildingType.resource}/min
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
      </div>
      </div>
    </div>
  );
};
