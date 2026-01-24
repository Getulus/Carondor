# 🎮 CARONDOR - Visual Project Overview

## Project Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        USER'S WEB BROWSER                           │
│                   (http://localhost:3000)                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Main Menu   │  │  Character   │  │ Game World   │              │
│  │              │→ │  Creation    │→ │              │              │
│  │ • New Game   │  │ (4-step)     │  │ • Hero Stats │              │
│  │ • Load Game  │  │              │  │ • Town Info  │              │
│  │ • Quit       │  │              │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ────────────────────────────────────────────────────────────────  │
│                                                                     │
│              REACT FRONTEND (React Components)                      │
│                                                                     │
│  • MainMenu.js          • CharacterCreation.js                      │
│  • GameWorld.js         • gameService.js (API calls)                │
│  • Modern CSS styling   • Error handling & loading states           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │ (HTTP/JSON)
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│              FLASK BACKEND (http://localhost:5000)                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     routes/api.py                           │  │
│  │                                                             │  │
│  │  GET /api/classes       ← Get all classes                  │  │
│  │  GET /api/races         ← Get all races                    │  │
│  │  POST /api/hero/create  ← Create hero with class + race    │  │
│  │  GET /api/health        ← Health check                     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    Game Models                              │  │
│  │                                                             │  │
│  │  models/classes.py      models/races.py     models/hero.py │  │
│  │  ──────────────────      ─────────────────    ──────────  │  │
│  │  • 6 Classes:           • 6 Races:           • Hero Stats  │  │
│  │    - Warrior              - Human              Calculation │  │
│  │    - Sorcerer             - Elf                (Class +    │  │
│  │    - Paladin              - Dwarf              Race)       │  │
│  │    - Druid                - Orc                            │  │
│  │    - ShadowHunter         - Undead                         │  │
│  │    - Bandit               - Dragonborn                     │  │
│  │                                                             │  │
│  │  Each class has:        Each race has:       Returns:      │  │
│  │  • Health Point         • Physical bonus    • Hero name     │  │
│  │  • Phys Attack/Def      • Magical bonus     • Class        │  │
│  │  • Magical Attack/Def   • Health bonus      • Race         │  │
│  │  • Description                             • Final stats   │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Python 3.13 • Flask 2.3.2 • CORS Enabled                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Stat Calculation Flow

```
USER SELECTS: Warrior + Human

                     ↓

          CLASS STATS (Warrior)          RACE BONUSES (Human)
          ─────────────────────          ──────────────────
          • HP: 150                      • Physical: +2
          • Physical Attack: 25          • Magical: +2
          • Physical Defense: 20         • Health: +5
          • Magical Attack: 5
          • Magical Defense: 10

                     ↓                           ↓

          COMBINATION: Class + Race Bonuses

                     ↓

          FINAL HERO STATS
          ────────────────
          • HP: 150 + 5 = 155
          • Physical Attack: 25 + 2 = 27
          • Physical Defense: 20 + 2 = 22
          • Magical Attack: 5 + 2 = 7
          • Magical Defense: 10 + 2 = 12

                     ↓

          HERO CREATED & DISPLAYED
```

## Component Interaction Diagram

```
APP.js (Main Component)
│
├─ STATE:
│  ├─ currentPage (mainMenu, newGame, gameWorld)
│  ├─ classes (from API)
│  ├─ races (from API)
│  ├─ hero (created hero data)
│  └─ loading, error states
│
├─ MainMenu Component
│  ├─ onNewGame() → Fetch classes/races
│  ├─ onLoadGame() → Coming soon
│  └─ onQuit() → Exit
│
├─ CharacterCreation Component
│  ├─ Step 1: Hero Name Input
│  ├─ Step 2: Class Selection (shows classes)
│  ├─ Step 3: Race Selection (shows races)
│  ├─ Step 4: Review & Confirm
│  └─ onHeroCreated() → POST /hero/create
│
└─ GameWorld Component
   ├─ Display Hero Stats
   ├─ Show Town (race name)
   └─ onBack() → Return to Main Menu
```

## Data Flow for Hero Creation

```
USER CLICKS "CREATE HERO"
        ↓
CharacterCreation collects:
• name: "Aragorn"
• class: "Warrior"
• race: "Human"
        ↓
gameService.createHero(data)
        ↓
POST http://localhost:5000/api/hero/create
        ↓
Backend processes:
1. Find Warrior class: HP=150, P.Atk=25, etc.
2. Find Human race: P.Bonus=2, M.Bonus=2, HP.Bonus=5
3. Calculate: Final = Class + Race
4. Create Hero object with final stats
        ↓
Return JSON response:
{
  "success": true,
  "hero": {
    "name": "Aragorn",
    "class": "Warrior",
    "race": "Human",
    "stats": {
      "health_point": 155,
      "physical_attack": 27,
      "physical_defense": 22,
      "magical_attack": 7,
      "magical_defense": 12
    }
  }
}
        ↓
Frontend:
1. Store hero in state
2. Switch to GameWorld view
3. Display hero information
```

## Technology Stack Visualization

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  FRONTEND STACK          |  BACKEND STACK                 │
│  ──────────────────      |  ────────────────               │
│                          |                                 │
│  React 18.2.0           |  Python 3.13.9                  │
│  ├─ Components          |  ├─ Flask 2.3.2                 │
│  ├─ State Management    |  ├─ Flask-CORS 4.0.0            │
│  └─ JSX Rendering       |  └─ python-dotenv 1.0.0         │
│                          |                                 │
│  React Router 6.14.1    |  REST API Architecture          │
│  ├─ Page Navigation     |  ├─ Blueprint routing           │
│  └─ URL Management      |  ├─ JSON responses              │
│                          |  └─ Error handling              │
│  Axios 1.4.0            |                                  │
│  ├─ HTTP Requests       |  Database: Not yet              │
│  ├─ API Communication   |  (Models in memory for now)     │
│  └─ Response Handling   |                                  │
│                          |  Future: SQLAlchemy + DB        │
│  CSS3 Styling           |                                  │
│  ├─ Gradients           |                                  │
│  ├─ Animations          |                                  │
│  ├─ Responsive Design   |                                  │
│  └─ Dark Theme          |                                  │
│                          |                                  │
│  Node.js 18+ (runtime)  |  WSGI Server (production)       │
│  npm (package manager)  |  (Gunicorn recommended)         │
│                          |                                  │
└────────────────────────────────────────────────────────────┘
```

## Game Balance Matrix

```
CLASS vs ROLE MAPPING

        TANK    | DAMAGE  | SUPPORT
    ────────────┼─────────┼─────────
    Physical   │Warrior  │Paladin |Druid
    Magic      │Paladin  │Sorcerer│Druid
    Hybrid     │Undead   │Shadow  │Druid
               │Dwarf    │Bandit  │
    ────────────┴─────────┴─────────

RACE vs CLASS SYNERGIES

Best Combinations:
  Warrior + Orc       → Max Physical (30 Attack)
  Sorcerer + Elf      → Max Magic (34 Attack)
  Paladin + Undead    → Tank Monster (155+ HP)
  Druid + Human       → Balanced Support
  Bandit + Elf        → Speed/Magic Assassin
  ShadowHunter + Orc  → Physical Beast
```

## File Structure Tree

```
c:\Users\tamas\Documents\Carondor\
│
├── 📄 README.md                 (Project overview)
├── 📄 QUICKSTART.md             (Getting started guide)
├── 📄 API_DOCUMENTATION.md      (API reference)
├── 📄 SETUP_COMPLETE.md         (Setup summary)
├── 📄 STATUS.md                 (Current status)
│
├── 🐍 backend/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── 📄 classes.py        (6 classes with stats)
│   │   ├── 📄 races.py          (6 races with bonuses)
│   │   └── 📄 hero.py           (Hero stat calculation)
│   ├── routes/
│   │   ├── __init__.py
│   │   └── 📄 api.py            (4 API endpoints)
│   ├── 📄 app.py                (Flask application)
│   ├── 📄 requirements.txt       (Dependencies)
│   └── .venv/                   (Virtual environment)
│
└── ⚛️  frontend/
    ├── public/
    │   └── 📄 index.html        (HTML entry point)
    ├── src/
    │   ├── components/
    │   │   ├── 📄 MainMenu.js
    │   │   ├── 📄 CharacterCreation.js
    │   │   └── 📄 GameWorld.js
    │   ├── services/
    │   │   └── 📄 gameService.js
    │   ├── styles/
    │   │   ├── 📄 MainMenu.css
    │   │   ├── 📄 CharacterCreation.css
    │   │   └── 📄 GameWorld.css
    │   ├── 📄 App.js             (Main component)
    │   ├── 📄 App.css            (Global styles)
    │   ├── 📄 index.js           (React entry)
    │   └── 📄 config.js          (API config)
    ├── 📄 package.json           (Dependencies)
    └── node_modules/             (to install)
```

## Server Architecture Diagram

```
DEVELOPMENT SETUP

┌─ Terminal 1 ────────────────────────┐
│                                      │
│  Flask Server (Running)              │
│  Port: 5000                          │
│  URL: http://localhost:5000          │
│                                      │
│  $ flask --app app run               │
│                                      │
│  Status: ✓ RUNNING                   │
│                                      │
└──────────────────────────────────────┘
           ↑                 ↓
           │ HTTP/JSON       │
           │ Requests        │
           │                 │ Responses
           │                 ↓

┌─ Terminal 2 ────────────────────────┐
│                                      │
│  React Dev Server (TO START)         │
│  Port: 3000                          │
│  URL: http://localhost:3000          │
│                                      │
│  $ npm start                         │
│                                      │
│  Status: ⏳ READY (needs npm install) │
│                                      │
└──────────────────────────────────────┘

┌─ Browser ────────────────────────────┐
│                                      │
│  Your Game (localhost:3000)          │
│  Connected to API (localhost:5000)   │
│                                      │
│  Status: ⏳ READY TO ACCESS           │
│                                      │
└──────────────────────────────────────┘
```

## Setup Timeline

```
✓ Completed                    ⏳ In Progress          ⏹️ Future

✓ Folder structure           ⏳ Frontend setup      ⏹️ Save/Load
✓ Backend models             ⏳ npm install         ⏹️ Combat
✓ API endpoints              ⏳ npm start           ⏹️ Buildings
✓ Flask app                  ⏳ Test in browser     ⏹️ Army
✓ Frontend components                               ⏹️ Quests
✓ CSS styling                                       ⏹️ Economy
✓ Service layer                                     ⏹️ Multiplayer
✓ Backend running            
✓ API tested                  

CURRENT TIME →|← 5 min to full setup
```

---

## Quick Reference

### Backend API Calls (curl examples)
```bash
# Get classes
curl http://localhost:5000/api/classes

# Get races
curl http://localhost:5000/api/races

# Create hero
curl -X POST http://localhost:5000/api/hero/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Hero","class":"Warrior","race":"Human"}'

# Health check
curl http://localhost:5000/api/health
```

### Frontend Commands
```bash
# Install dependencies (one time)
cd frontend
npm install

# Start development server
npm start

# Build for production
npm build
```

### Backend Commands
```bash
# Activate virtual environment
cd backend
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python -m flask --app app run
```

---

**Everything is set up and ready to go! 🚀**
