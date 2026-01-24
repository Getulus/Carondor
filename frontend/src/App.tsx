import React, { useState, useEffect, FC } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import CharacterCreation from './components/CharacterCreation';
import GameWorld from './components/GameWorld';
import { TownManagement } from './components/TownManagement';
import { gameService, GameClass, Race, Hero, HeroCreationData } from './services/gameService';

type PageType = 'mainMenu' | 'newGame' | 'gameWorld' | 'town';

interface AppState {
  currentPage: PageType;
  classes: GameClass[];
  races: Race[];
  hero: Hero | null;
  gameId: number | null;
  loading: boolean;
  error: string | null;
}

const App: FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'mainMenu',
    classes: [],
    races: [],
    hero: null,
    gameId: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (appState.currentPage === 'newGame') {
      fetchGameData();
    }
  }, [appState.currentPage]);

  const fetchGameData = async (): Promise<void> => {
    setAppState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [classesRes, racesRes] = await Promise.all([
        gameService.getClasses(),
        gameService.getRaces(),
      ]);
      setAppState((prev) => ({
        ...prev,
        classes: classesRes.data.classes,
        races: racesRes.data.races,
        loading: false,
      }));
    } catch (err) {
      setAppState((prev) => ({
        ...prev,
        error: 'Failed to load game data. Make sure the backend is running.',
        loading: false,
      }));
      console.error(err);
    }
  };

  const handleNewGame = (): void => {
    setAppState((prev) => ({ ...prev, currentPage: 'newGame' }));
  };

  const handleLoadGame = (): void => {
    alert('Load game feature coming soon!');
  };

  const handleQuit = (): void => {
    alert('Thanks for playing Carondor!');
  };

  const handleHeroCreated = async (heroData: HeroCreationData): Promise<void> => {
    setAppState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await gameService.createHero(heroData);
      const hero = response.data.hero;
      
      // Save game with initial resources and buildings
      const saveResponse = await gameService.saveGame({
        hero_name: hero.name,
        hero_class: hero.class,
        hero_race: hero.race,
        level: hero.level,
        experience: hero.experience,
        resources: {
          wood: 500,
          food: 400,
          gold: 300,
          crystal: 100,
          soul_energy: 50,
          stone: 600,
          iron: 200,
        },
        buildings: [
          { type: 'wood_mine', level: 1 },
          { type: 'farm', level: 1 },
          { type: 'barracks', level: 1 },
        ],
        units: [],
      });
      
      setAppState((prev) => ({
        ...prev,
        hero: hero,
        gameId: saveResponse.data.game_id,
        currentPage: 'town',
        loading: false,
      }));
    } catch (err) {
      setAppState((prev) => ({
        ...prev,
        error: 'Failed to create hero. Please try again.',
        loading: false,
      }));
      console.error(err);
    }
  };

  const handleCancel = (): void => {
    setAppState((prev) => ({ ...prev, currentPage: 'mainMenu' }));
  };

  const handleBackToMenu = (): void => {
    setAppState((prev) => ({
      ...prev,
      hero: null,
      gameId: null,
      currentPage: 'mainMenu',
    }));
  };

  const { currentPage, classes, races, hero, gameId, loading, error } = appState;

  return (
    <div className="App">
      {error && <div className="error-banner">{error}</div>}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && currentPage === 'mainMenu' && (
        <MainMenu
          onNewGame={handleNewGame}
          onLoadGame={handleLoadGame}
          onQuit={handleQuit}
        />
      )}

      {!loading && currentPage === 'newGame' && (
        <CharacterCreation
          classes={classes}
          races={races}
          onHeroCreated={handleHeroCreated}
          onCancel={handleCancel}
        />
      )}

      {!loading && currentPage === 'gameWorld' && hero && (
        <GameWorld hero={hero} onBack={handleBackToMenu} />
      )}

      {!loading && currentPage === 'town' && hero && gameId && (
        <TownManagement gameId={gameId} heroRace={hero.race} />
      )}
    </div>
  );
};

export default App;
