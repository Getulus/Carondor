import React, { FC, useState } from 'react';
import { SavedGame } from '../services/gameService';
import './GameHeader.css';

interface GameHeaderProps {
  gameState: SavedGame | null;
  onRefresh?: () => void;
  onLogout?: () => void;
  onShowHero?: () => void;
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

export const GameHeader: FC<GameHeaderProps> = ({ gameState, onRefresh, onLogout, onShowHero }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!gameState) return null;

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
          {gameState.xp_needed && (
            <div className="xp-bar-container">
              <div className="xp-bar">
                <div 
                  className="xp-bar-fill"
                  style={{width: `${gameState.xp_progress || 0}%`}}
                ></div>
              </div>
              <span className="xp-text">{gameState.experience} / {gameState.xp_needed} XP</span>
            </div>
          )}
        </div>
        <button
          className="hero-btn"
          title="View Hero"
          onClick={() => (onShowHero ? onShowHero() : alert('Hero details coming soon'))}
        >
          🧙 Hero
        </button>
      </div>

      <div className="header-resources-section">
        {Object.entries(gameState.resources).map(([type, amount]) => (
          <div key={type} className="header-resource">
            <span className="resource-icon-small">{RESOURCE_ICONS[type] || '📦'}</span>
            <span className="resource-value">{Math.floor(amount)}</span>
          </div>
        ))}
      </div>

      <div className="header-actions">
        <div className="menu-container">
          <button 
            className="menu-btn" 
            onClick={() => setMenuOpen(!menuOpen)}
            title="Menu"
          >
            ☰
          </button>
          
          {menuOpen && (
            <div className="menu-dropdown">
              {onRefresh && (
                <button 
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onRefresh();
                  }}
                >
                  🔄 Refresh
                </button>
              )}
              {onLogout && (
                <button 
                  className="menu-item logout-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  🚪 Back to Main Menu
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
