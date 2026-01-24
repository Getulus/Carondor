import React, { FC } from 'react';
import { SavedGame } from '../services/gameService';
import './GameHeader.css';

interface GameHeaderProps {
  gameState: SavedGame | null;
  onRefresh?: () => void;
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

export const GameHeader: FC<GameHeaderProps> = ({ gameState, onRefresh }) => {
  if (!gameState) return null;

  const totalUnits = gameState.units.reduce((sum, unit) => sum + unit.count, 0);
  const totalBuildings = gameState.buildings.length;

  return (
    <header className="game-header">
      <div className="header-hero-section">
        <div className="hero-avatar">
          <span className="avatar-icon">⚔️</span>
        </div>
        <div className="hero-details">
          <h3 className="hero-name">{gameState.hero_name}</h3>
          <div className="hero-meta">
            <span className="hero-class">{gameState.hero_class}</span>
            <span className="hero-race">{gameState.hero_race}</span>
            <span className="hero-level">Level {gameState.level}</span>
          </div>
        </div>
      </div>

      <div className="header-resources-section">
        {Object.entries(gameState.resources).map(([type, amount]) => (
          <div key={type} className="header-resource">
            <span className="resource-icon-small">{RESOURCE_ICONS[type] || '📦'}</span>
            <span className="resource-value">{Math.floor(amount)}</span>
          </div>
        ))}
      </div>

      <div className="header-stats-section">
        <div className="stat-item">
          <span className="stat-icon">🏗️</span>
          <span className="stat-value">{totalBuildings}</span>
          <span className="stat-label">Buildings</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⚔️</span>
          <span className="stat-value">{totalUnits}</span>
          <span className="stat-label">Army</span>
        </div>
      </div>

      {onRefresh && (
        <button className="refresh-btn" onClick={onRefresh} title="Refresh">
          🔄
        </button>
      )}
    </header>
  );
};
