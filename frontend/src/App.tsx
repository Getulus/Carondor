import React, { useState, useEffect, FC } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import CharacterCreation from './components/CharacterCreation';
import GameWorld from './components/GameWorld';
import { TownManagement } from './components/TownManagement';
import { LoadGameModal } from './components/LoadGameModal';
import { gameService, GameClass, Race, Hero, HeroCreationData } from './services/gameService';

type PageType = 'mainMenu' | 'newGame' | 'gameWorld' | 'town';

interface AppState {
  currentPage: PageType;
  classes: GameClass[];
  races: Race[];
  hero: Hero | null;
  gameId: number | null;
  loadModalOpen: boolean;
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
    loadModalOpen: false,
    loading: false,
    error: null,
  });

  // On mount, check if there's a saved game in localStorage and restore it
  useEffect(() => {
    const savedGameId = localStorage.getItem('currentGameId');
    const savedHeroRace = localStorage.getItem('currentHeroRace');
    const savedHeroName = localStorage.getItem('currentHeroName');
    const savedHeroClass = localStorage.getItem('currentHeroClass');

    if (savedGameId && savedHeroRace && savedHeroName && savedHeroClass) {
      // Restore the current game from localStorage
      const hero: Hero = {
        name: savedHeroName,
        class: savedHeroClass,
        race: savedHeroRace,
        level: 1,
        experience: 0,
        stats: {
          health_point: 0,
          physical_attack: 0,
          physical_defense: 0,
          magical_attack: 0,
          magical_defense: 0,
        },
        created_at: new Date().toISOString(),
      };
      
      setAppState((prev) => ({
        ...prev,
        currentPage: 'town',
        gameId: parseInt(savedGameId),
        hero: hero,
      }));
    }
  }, []);

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
    setAppState((prev) => ({ ...prev, loadModalOpen: true }));
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
      
      // Save to localStorage for refresh persistence
      localStorage.setItem('currentGameId', saveResponse.data.game_id.toString());
      localStorage.setItem('currentHeroRace', hero.race);
      localStorage.setItem('currentHeroName', hero.name);
      localStorage.setItem('currentHeroClass', hero.class);
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
    // Clear localStorage when going back to menu
    localStorage.removeItem('currentGameId');
    localStorage.removeItem('currentHeroRace');
    localStorage.removeItem('currentHeroName');
    localStorage.removeItem('currentHeroClass');
    
    setAppState((prev) => ({
      ...prev,
      hero: null,
      gameId: null,
      loadModalOpen: false,
      currentPage: 'mainMenu',
    }));
  };

  const handleLoadSelected = async (gameId: number): Promise<void> => {
    setAppState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await gameService.loadGame(gameId);
      const loaded = res.data;
      const heroFromSave: Hero = {
        name: loaded.hero_name,
        class: loaded.hero_class,
        race: loaded.hero_race,
        level: loaded.level,
        experience: loaded.experience,
        stats: {
          health_point: 0,
          physical_attack: 0,
          physical_defense: 0,
          magical_attack: 0,
          magical_defense: 0,
        },
        created_at: loaded.created_at,
      };

      setAppState((prev) => ({
        ...prev,
        hero: heroFromSave,
        gameId: loaded.id,
        currentPage: 'town',
        loadModalOpen: false,
        loading: false,
      }));
      
      // Save to localStorage for refresh persistence
      localStorage.setItem('currentGameId', loaded.id.toString());
      localStorage.setItem('currentHeroRace', loaded.hero_race);
      localStorage.setItem('currentHeroName', loaded.hero_name);
      localStorage.setItem('currentHeroClass', loaded.hero_class);
    } catch (err) {
      setAppState((prev) => ({
        ...prev,
        error: 'Failed to load saved game. Please try again.',
        loading: false,
      }));
      console.error(err);
    }
  };

  const { currentPage, classes, races, hero, gameId, loading, error, loadModalOpen } = appState;

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
        <TownManagement gameId={gameId} heroRace={hero.race} onLogout={handleBackToMenu} />
      )}

      <LoadGameModal
        isOpen={loadModalOpen}
        onClose={() => setAppState((prev) => ({ ...prev, loadModalOpen: false }))}
        onSelect={handleLoadSelected}
      />
    </div>
  );
};

export default App;
