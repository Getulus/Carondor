# Carondor - Strategy RPG Game

A browser-based strategy and RPG game with Python backend and React frontend.

## Project Structure

```
carondor/
├── backend/
│   ├── models/
│   │   ├── classes.py       # Game class definitions
│   │   ├── races.py         # Race definitions with bonuses
│   │   └── hero.py          # Hero/player character model
│   ├── routes/
│   │   └── api.py           # Flask API endpoints
│   ├── app.py               # Main Flask application
│   └── requirements.txt      # Python dependencies
└── frontend/
    ├── public/
    │   └── index.html       # HTML entry point
    ├── src/
    │   ├── components/
    │   │   ├── MainMenu.js          # Main menu component
    │   │   ├── CharacterCreation.js # Hero creation wizard
    │   │   └── GameWorld.js         # Game world view
    │   ├── pages/               # Page components
    │   ├── services/
    │   │   └── gameService.js   # API service calls
    │   ├── styles/
    │   │   ├── MainMenu.css
    │   │   ├── CharacterCreation.css
    │   │   └── GameWorld.css
    │   ├── App.js               # Main App component
    │   ├── App.css              # Global styles
    │   ├── index.js             # React entry point
    │   └── config.js            # Configuration
    └── package.json             # Node dependencies
```

## Getting Started

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python app.py
   ```
   
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   
   The frontend will open at `http://localhost:3000`

## Features Implemented

### Main Menu
- New Game button
- Load Game button (coming soon)
- Quit button

### Character Creation
- Hero name input
- Class selection (6 classes with stats)
- Race selection (6 races with bonuses)
- Character preview with final stats
- Multi-step wizard interface

### Game Classes
1. **Warrior** - High HP and physical defense
2. **Sorcerer** - High magical attack
3. **Paladin** - Balanced physical and magical
4. **Druid** - Healer with balanced stats
5. **ShadowHunter** - Physical and shadow magic
6. **Bandit** - High attack, low defense

### Game Races
1. **Human** - Balanced bonuses
2. **Elf** - Magical bonuses
3. **Dwarf** - Physical and health bonuses
4. **Orc** - High physical bonus
5. **Undead** - High health bonus
6. **Dragonborn** - Mixed bonuses

### Game World
- Hero stats display
- Town based on selected race
- Coming soon features: Buildings, Army, Combat

## API Endpoints

- `GET /api/classes` - Get all available classes
- `GET /api/races` - Get all available races
- `POST /api/hero/create` - Create a new hero
- `GET /api/health` - Health check

## Next Steps

- Implement save/load game functionality
- Create building system for towns
- Implement army training and units
- Add combat mechanics
- Create exploration and quest system
- Add economy and trading
- Implement multiplayer features (optional)

## Technologies Used

- **Backend**: Python, Flask, Flask-CORS
- **Frontend**: React, Axios, React Router
- **Styling**: CSS3 with animations and gradients
