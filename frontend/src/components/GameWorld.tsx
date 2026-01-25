import React, { FC } from 'react';
import { Hero } from '../services/gameService';
import imageUtils from '../utils/imageUtils';
import '../styles/GameWorld.css';

interface GameWorldProps {
  hero: Hero;
  onBack: () => void;
}

const GameWorld: FC<GameWorldProps> = ({ hero, onBack }) => {
  return (
    <div className="game-world">
      <div className="world-header">
        <h1>Welcome to {hero.race}</h1>
        <h2>{hero.name} - Level {hero.level} {hero.class}</h2>
        <button className="btn-back" onClick={onBack}>← Main Menu</button>
      </div>

      <div className="world-container">
        <div className="hero-portrait">
          <img 
            src={imageUtils.getHeroImage(hero.name, hero.class)}
            alt={hero.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect width='200' height='300' fill='%23333'/%3E%3Ctext x='100' y='150' text-anchor='middle' dy='.3em' fill='white'%3E${hero.name}%3C/text%3E%3C/svg%3E`;
            }}
            className="hero-image"
          />
        </div>

        <div className="world-content">
          <div className="hero-stats">
            <h3>Hero Stats</h3>
            <div className="stats-grid">
              <div className="stat">
                <span>Health Points</span>
                <span className="value">{hero.stats.health_point}</span>
              </div>
              <div className="stat">
                <span>Physical Attack</span>
                <span className="value">{hero.stats.physical_attack}</span>
              </div>
              <div className="stat">
                <span>Physical Defense</span>
                <span className="value">{hero.stats.physical_defense}</span>
              </div>
              <div className="stat">
                <span>Magical Attack</span>
                <span className="value">{hero.stats.magical_attack}</span>
              </div>
              <div className="stat">
                <span>Magical Defense</span>
                <span className="value">{hero.stats.magical_defense}</span>
              </div>
              <div className="stat">
                <span>Experience</span>
                <span className="value">{hero.experience}</span>
              </div>
            </div>
          </div>

          <div className="world-features">
            <h3>Available Features (Coming Soon)</h3>
            <div className="features-list">
              <div className="feature-item">🏰 Buildings & Construction</div>
              <div className="feature-item">🪖 Army Training</div>
              <div className="feature-item">⚔️ Combat & Quests</div>
              <div className="feature-item">🗺️ Exploration</div>
              <div className="feature-item">💰 Economy & Trading</div>
              <div className="feature-item">🏆 Achievements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameWorld;
