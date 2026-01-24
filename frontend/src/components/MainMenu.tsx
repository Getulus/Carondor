import React, { FC } from 'react';
import '../styles/MainMenu.css';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onQuit: () => void;
}

const MainMenu: FC<MainMenuProps> = ({ onNewGame, onLoadGame, onQuit }) => {
  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="game-title">CARONDOR</h1>
        <p className="game-subtitle">A Strategy & RPG Adventure</p>
        
        <div className="menu-buttons">
          <button className="menu-button" onClick={onNewGame}>
            New Game
          </button>
          <button className="menu-button" onClick={onLoadGame}>
            Load Game
          </button>
          <button className="menu-button quit-button" onClick={onQuit}>
            Quit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
