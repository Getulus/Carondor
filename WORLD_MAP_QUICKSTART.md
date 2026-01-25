# 🗺️ World Map - Quick Start Guide

## What You Built

A complete hexagonal world map system with:
- **30 unique terrain types** (Plains, Mountains, Forests, Rivers, Ancient Ruins, etc.)
- **~300 hexagonal tiles** generated randomly
- **7 resource types** as bonuses (food, wood, gold, stone, iron, crystal, soul_energy)
- **Defense bonuses** (0-4) for strategic advantage
- **Movement costs** (1-4) for terrain difficulty
- **Exploration system** - tiles start hidden, click to reveal
- **Interactive canvas** - drag to pan, click to select
- **Territory control** - mark tiles as player/enemy controlled

## Files Created

### Backend
```
backend/models/world_map.py       - Terrain types and map generation logic
backend/routes/map.py             - 7 API endpoints for map operations
backend/models/db.py              - Added MapTile database model
```

### Frontend
```
frontend/src/services/mapService.ts   - API client and coordinate helpers
frontend/src/components/WorldMap.tsx  - Canvas-based hex grid renderer
frontend/src/components/WorldMap.css  - Map styling
```

### Integration
```
frontend/src/components/TownManagement.tsx  - Added "🗺️ World Map" tab
```

## How to Test

1. **Start Backend:**
   ```bash
   cd backend
   python run.py
   ```
   Backend runs on http://localhost:5000

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm start
   ```
   Frontend opens at http://localhost:3000

3. **In-Game:**
   - Create a new game or load existing
   - Click the "🗺️ World Map" tab (third tab)
   - Map auto-generates with 300 tiles
   - Click any tile to explore it (reveals color/info)
   - Drag the map to pan around
   - View tile details in the right panel

## Terrain Types (Sample)

| Terrain | Resources | Defense | Movement | Description |
|---------|-----------|---------|----------|-------------|
| Plains | +2 food | 0 | 1 | Open grasslands |
| Forest | +3 wood | +1 | 2 | Dense woods |
| Mountain | +2 stone, +1 iron | +3 | 3 | Rugged peaks |
| Gold Vein | +4 gold | 0 | 2 | Rich gold deposit |
| Ancient Ruins | +3 crystal, +2 gold | +2 | 1 | Old treasures |
| Farmland | +5 food | 0 | 1 | Max food production |

...and 24 more unique types!

## API Endpoints

```
POST   /api/map/generate/<game_id>              - Generate new map
GET    /api/map/<game_id>                       - Get all tiles
GET    /api/map/tile/<game_id>/<q>/<r>         - Get specific tile
POST   /api/map/tile/<game_id>/<q>/<r>/occupy  - Control tile
POST   /api/map/tile/<game_id>/<q>/<r>/explore - Reveal tile
GET    /api/map/neighbors/<game_id>/<q>/<r>    - Get adjacent tiles
GET    /api/map/terrain-info                    - Get terrain definitions
```

## Map Controls

- **Left Click** - Select and explore tile
- **Drag** - Pan camera around map
- **Reset View** - Center camera
- **Refresh Map** - Reload from server

## Key Features

1. **Random Generation**: Each game gets a unique map layout
2. **Persistent**: Map saves to database per game
3. **Exploration**: Fog of war - unexplored tiles are dark
4. **Strategic**: Resource bonuses and defense values matter
5. **Visual**: Color-coded terrain, highlighted selection
6. **Responsive**: Smooth panning and clicking
7. **Scalable**: Map size configurable (default radius 10)

## Database

New `map_tiles` table stores:
```sql
id, game_id, q, r, terrain_type, occupied_by, explored
```

Automatically created when backend starts.

## Troubleshooting

**Map not showing?**
- Check browser console (F12) for errors
- Verify backend is running (http://localhost:5000/api/map/terrain-info)
- Check that game was created/loaded properly

**Tiles all dark?**
- This is normal! Click tiles to explore them
- Each click reveals a tile's true color and properties

**Backend database error?**
- Backend auto-creates tables on startup
- If using SQLite, check `backend/instance/carondor.db` exists
- If using PostgreSQL, verify connection string

## What's Next?

The map is ready for gameplay features like:
- Unit movement between tiles
- Resource collection from controlled tiles
- Combat for territory control
- Quest markers and objectives
- Building placement on tiles
- Fog of war visualization
- Minimap overview

## Success!

Your game now has a fully functional hexagonal world map with diverse terrain types and strategic gameplay elements. Players can explore, control, and benefit from different tiles across a vast generated world.

Enjoy your new world map system! 🎮🗺️
