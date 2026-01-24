# 🚀 CARONDOR - QUICK REFERENCE CARD

## START THE GAME (Quick Steps)

### 1. Backend ✅ (Already Running)
```powershell
# Backend is running at http://127.0.0.1:5000
# Keep this running while developing
```

### 2. Frontend (Next Step)
```powershell
# Option 1: First time setup
cd c:\Users\tamas\Documents\Carondor\frontend
npm install
npm start

# Option 2: Already installed
cd c:\Users\tamas\Documents\Carondor\frontend
npm start
```

### 3. Open Game
```
Browser: http://localhost:3000
```

---

## 🎮 GAME QUICK PLAY

| Step | Action |
|------|--------|
| 1 | Click "New Game" on main menu |
| 2 | Enter your hero name |
| 3 | Pick a class (see stats) |
| 4 | Pick a race (for your town) |
| 5 | Confirm and play! |

---

## 📊 QUICK REFERENCE: CLASSES

| Class | HP | P.Atk | P.Def | M.Atk | M.Def | Best For |
|-------|----|----|----|----|----|----|
| **Warrior** | 150 | 25 | 20 | 5 | 10 | Tank |
| **Sorcerer** | 80 | 8 | 8 | 30 | 15 | Magic DPS |
| **Paladin** | 130 | 18 | 25 | 12 | 20 | Hybrid |
| **Druid** | 110 | 15 | 12 | 20 | 18 | Support |
| **ShadowHunter** | 100 | 22 | 12 | 18 | 12 | Hybrid DPS |
| **Bandit** | 95 | 28 | 10 | 8 | 8 | Glass Cannon |

---

## 🏘️ QUICK REFERENCE: RACES

| Race | P.Bonus | M.Bonus | HP.Bonus | Best For |
|------|---------|---------|----------|----------|
| **Human** | +2 | +2 | +5 | Balanced |
| **Elf** | +1 | +4 | 0 | Magic Users |
| **Dwarf** | +3 | 0 | +8 | Tanks |
| **Orc** | +5 | 0 | +6 | Physical |
| **Undead** | +2 | +3 | +10 | Tank/Hybrid |
| **Dragonborn** | +4 | +3 | +4 | Hybrid |

---

## 🗂️ FILE LOCATIONS

```
Frontend:  c:\Users\tamas\Documents\Carondor\frontend\
Backend:   c:\Users\tamas\Documents\Carondor\backend\
Config:    c:\Users\tamas\Documents\Carondor\
```

---

## 🔌 API ENDPOINTS

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/classes | Get all classes |
| GET | /api/races | Get all races |
| POST | /api/hero/create | Create new hero |
| GET | /api/health | Health check |

**Base URL:** `http://localhost:5000/api`

---

## 🔧 COMMON COMMANDS

### Start Backend
```powershell
cd c:\Users\tamas\Documents\Carondor\backend
C:/Users/tamas/Documents/Carondor/.venv/Scripts/python.exe -m flask --app app run
```

### Start Frontend
```powershell
cd c:\Users\tamas\Documents\Carondor\frontend
npm start
```

### Install Frontend Deps
```powershell
cd c:\Users\tamas\Documents\Carondor\frontend
npm install
```

---

## 💡 EDITING GAME BALANCE

### Change Class Stats
File: `backend/models/classes.py`
```python
ClassType.WARRIOR: GameClass(
    name="Warrior",
    health_point=150,  # ← Edit here
    physical_attack=25,  # ← Edit here
    ...
)
```

### Change Race Bonuses
File: `backend/models/races.py`
```python
RaceType.HUMAN: Race(
    name="Human",
    physical_bonus=2,  # ← Edit here
    magical_bonus=2,  # ← Edit here
    ...
)
```

### Change Colors
Files: `frontend/src/styles/*.css`
```css
.game-title {
    color: #ffd700; /* ← Edit here */
}
```

---

## 🧪 TEST API (Using PowerShell)

### Test Health
```powershell
Invoke-WebRequest http://localhost:5000/api/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Create Hero
```powershell
$body = @{name="Hero"; class="Warrior"; race="Human"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/hero/create" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

## 📁 PROJECT STRUCTURE

```
Carondor/
├── backend/
│   ├── models/ (classes, races, hero)
│   ├── routes/ (api.py)
│   ├── app.py
│   ├── requirements.txt
│   └── .venv/
├── frontend/
│   ├── src/
│   │   ├── components/ (3 components)
│   │   ├── services/ (gameService.js)
│   │   ├── styles/ (4 CSS files)
│   │   ├── App.js
│   │   └── config.js
│   ├── public/ (index.html)
│   └── package.json
└── (documentation files)
```

---

## ⚡ QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| `npm not found` | Install Node.js from nodejs.org |
| Backend not running | Run flask app in backend folder |
| Frontend won't connect | Make sure backend is running |
| "localhost:3000 won't load" | Run `npm install` then `npm start` |
| Stats not calculating | Check backend is running, refresh browser |
| Character creation fails | Check backend console for errors |

---

## 📚 DOCUMENTATION

| File | Purpose |
|------|---------|
| README.md | Project overview |
| QUICKSTART.md | Getting started |
| API_DOCUMENTATION.md | API reference |
| SETUP_COMPLETE.md | Setup guide |
| STATUS.md | Current status |
| VISUAL_GUIDE.md | Architecture diagrams |
| PROJECT_SUMMARY.md | Complete summary |

---

## 🎯 CURRENT STATE

✅ **Backend**: Running, tested, operational
✅ **Frontend**: Built, ready to deploy
✅ **API**: All 4 endpoints working
✅ **Documentation**: Complete
⏳ **Database**: Not yet (ready to add)
⏳ **Save/Load**: Not yet (ready to add)
⏳ **Combat**: Not yet (ready to add)

---

## 🎓 KEY FEATURES

✨ 6 balanced character classes
✨ 6 playable races with bonuses
✨ Stat calculation system (class + race)
✨ 4-step character creation wizard
✨ Beautiful animated UI
✨ Full REST API
✨ Responsive design
✨ Professional error handling

---

## 🚀 NEXT STEPS

1. **Today**: Install Node.js + Run `npm start`
2. **Next**: Create a character and test
3. **Then**: Add save/load functionality
4. **Then**: Add combat system
5. **Then**: Add town/buildings
6. **Then**: Add more features!

---

## 📞 HELPFUL LINKS

- Node.js Download: https://nodejs.org
- React Docs: https://react.dev
- Flask Docs: https://flask.palletsprojects.com
- Axios Docs: https://axios-http.com

---

## 📝 IMPORTANT NOTES

- 🔴 Keep backend running while developing
- 🟡 Frontend needs `npm install` first time only
- 🟢 Both run on localhost (local machine only)
- 🔵 Data is in-memory (not saved between restarts)
- 🟣 Ready for database integration later

---

**You're all set!** 🎮✨

_Backend running → Install Node → Run npm start → Play!_
