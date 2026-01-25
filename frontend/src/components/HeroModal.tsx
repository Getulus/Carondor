import React, { FC } from 'react';
import { SavedGame } from '../services/gameService';
import imageUtils from '../utils/imageUtils';
import './HeroModal.css';

interface HeroModalProps {
  gameState: SavedGame;
  onClose: () => void;
}

export const HeroModal: FC<HeroModalProps> = ({ gameState, onClose }) => {
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
          <div className="hero-modal-portrait">
            <img
              src={imageUtils.getHeroImage(gameState.hero_name, gameState.hero_class)}
              alt={gameState.hero_name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = imageUtils.getHeroPlaceholder(gameState.hero_class);
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
      </div>
    </div>
  );
};
