# Carondor Database & Game Systems Documentation

## Overview

The Carondor game backend uses **SQLAlchemy ORM** with **SQLite** for persistent game state management. This document outlines the complete database schema, game systems, and API endpoints.

---

## Database Schema

### 1. **SavedGame** (Root Entity)

Stores hero and game state information.

```python
class SavedGame(db.Model):
    id              Integer       # Primary key
    hero_name       String(100)   # Hero name
    hero_class      String(50)    # Class (Warrior, Sorcerer, etc.)
    hero_race       String(50)    # Race (Human, Elf, Dwarf, etc.)
    level           Integer       # Current hero level (default: 1)
    experience      Integer       # Experience points (default: 0)
    created_at      DateTime      # Game creation timestamp
    updated_at      DateTime      # Last update timestamp
    
    # Relationships
    resources       OneToMany(Resource)   # 7 resource types
    buildings       OneToMany(Building)   # Town buildings
    units           OneToMany(Unit)       # Recruited army
```

### 2. **Resource** (Resource Management)

Tracks resource quantities for a town.

```python
class Resource(db.Model):
    id              Integer       # Primary key
    game_id         Integer       # Foreign key to SavedGame
    resource_type   String(50)    # Type: wood, food, gold, crystal, soul_energy, stone, iron
    amount          Float         # Current quantity
    
    # Foreign key
    game_id → SavedGame.id
```

**Available Resources:**
- `wood` - Harvested from Wood Mines
- `food` - Produced by Farms
- `gold` - Mined from Gold Mines
- `crystal` - Extracted from Crystal Mines
- `soul_energy` - Produced by Soul Extractors
- `stone` - Quarried from Stone Quarries
- `iron` - Mined from Iron Mines

### 3. **Building** (Town Infrastructure)

Represents building instances with levels and production.

```python
class Building(db.Model):
    id              Integer       # Primary key
    game_id         Integer       # Foreign key to SavedGame
    building_type   String(50)    # Type (wood_mine, farm, barracks, etc.)
    level           Integer       # Building level (affects production)
    built_at        DateTime      # Construction timestamp
    
    # Foreign key
    game_id → SavedGame.id
    
    # Methods
    get_production_rate()          # Returns resources/minute based on level
    get_build_cost()               # Returns cost for next level upgrade
```

**Available Buildings:**

| Type | Name | Resource | Base Production | Description |
|------|------|----------|-----------------|-------------|
| `wood_mine` | Wood Mine | Wood | 10/min | Produces wood |
| `farm` | Farm | Food | 12/min | Produces food |
| `gold_mine` | Gold Mine | Gold | 5/min | Produces gold |
| `crystal_mine` | Crystal Mine | Crystal | 3/min | Produces crystal |
| `soul_extractor` | Soul Extractor | Soul Energy | 2/min | Produces soul energy |
| `stone_quarry` | Stone Quarry | Stone | 15/min | Produces stone |
| `iron_mine` | Iron Mine | Iron | 8/min | Produces iron |
| `barracks` | Barracks | N/A | 0/min | Trains soldiers |

**Production Formula:**
```
production_per_minute = base_rate × level
```

**Upgrade Cost Formula:**
```
cost_for_next_level = base_cost × (1 + current_level × 0.3)
```

### 4. **Unit** (Army Management)

Represents recruited units/soldiers.

```python
class Unit(db.Model):
    id              Integer       # Primary key
    game_id         Integer       # Foreign key to SavedGame
    unit_type       String(50)    # Type (soldier, archer, mage, etc.)
    race            String(50)    # Race (Human, Elf, Dwarf, Orc, Undead, Dragonborn)
    count           Integer       # Number of this unit type
    hired_at        DateTime      # Recruitment timestamp
    
    # Foreign key
    game_id → SavedGame.id
    
    # Methods
    get_unit_stats()               # Returns base stats (attack, defense, hp)
    get_hire_cost()                # Returns cost per unit
```

---

## Unit System

### 6 Races × 5 Unit Types = 30 Unique Units

Each race has 5 different unit types with unique stats and costs.

#### **Human Units**

| Unit Type | Name | Attack | Defense | HP | Cost |
|-----------|------|--------|---------|----|----|
| soldier | Knight | 15 | 12 | 100 | 50g, 20f |
| archer | Archer | 18 | 5 | 60 | 40g, 15f |
| mage | Mage | 20 | 3 | 40 | 80g, 30c |
| healer | Cleric | 8 | 8 | 50 | 70g, 25f |
| cavalry | Cavalry | 22 | 10 | 120 | 100g, 30f |

#### **Elf Units**

| Unit Type | Name | Attack | Defense | HP | Cost |
|-----------|------|--------|---------|----|----|
| archer | Elven Archer | 20 | 6 | 70 | 45g, 20w |
| mage | Mage Adept | 25 | 4 | 45 | 75g, 35c |
| scout | Scout | 16 | 4 | 50 | 35g, 15w |
| ranger | Ranger | 22 | 8 | 80 | 60g, 30w |
| druid | Druid | 12 | 10 | 70 | 85g, 40c |

#### **Dwarf Units**

| Unit Type | Name | Attack | Defense | HP | Cost |
|-----------|------|--------|---------|----|----|
| warrior | Dwarf Warrior | 18 | 16 | 130 | 60g, 30i |
| berserker | Berserker | 28 | 10 | 140 | 90g, 50i |
| engineer | Engineer | 10 | 12 | 90 | 70g, 40i, 30s |
| defender | Defender | 12 | 20 | 150 | 55g, 35i, 20s |
| rogue | Rogue | 20 | 7 | 70 | 45g, 20i |

#### **Orc Units**

| Unit Type | Name | Attack | Defense | HP | Cost |
|-----------|------|--------|---------|----|----|
| warrior | Orc Warrior | 20 | 10 | 140 | 55g, 25f |
| shaman | Shaman | 18 | 8 | 85 | 80g, 30s |
| raider | Raider | 24 | 8 | 110 | 65g, 30f |
| brute | Brute | 26 | 12 | 160 | 100g, 40f |
| skirmisher | Skirmisher | 16 | 6 | 80 | 50g, 20f |

#### **Undead Units**

| Unit Type | Name | Attack | Defense | HP | Cost |
|-----------|------|--------|---------|----|----|
| skeleton | Skeleton | 14 | 8 | 70 | 40g, 20se |
| warlock | Warlock | 22 | 6 | 80 | 90g, 50se |
| crawler | Crawler | 18 | 7 | 75 | 50g, 30se |
| revenant | Revenant | 25 | 14 | 150 | 120g, 80se |
| phantom | Phantom | 20 | 10 | 90 | 85g, 60se |

#### **Dragonborn Units**

| Unit Type | Name | Attack | Defense | HP | Cost |
|-----------|------|--------|---------|----|----|
| warrior | Dragon Warrior | 24 | 14 | 150 | 100g, 30c |
| wyvern_rider | Wyvern Rider | 28 | 12 | 160 | 150g, 50c |
| fire_mage | Fire Mage | 26 | 8 | 95 | 95g, 40c |
| berserker | Dragon Berserker | 30 | 11 | 155 | 110g, 35c |
| defender | Dragon Defender | 16 | 18 | 180 | 105g, 40c |

Legend: g=gold, f=food, c=crystal, s=stone, i=iron, se=soul_energy, w=wood

---

## API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Character Creation (Existing)

#### GET `/classes`
Get all available character classes
```json
{
  "classes": [
    {
      "id": "warrior",
      "name": "Warrior",
      "hp": 150,
      "attack": 20,
      ...
    }
  ]
}
```

#### GET `/races`
Get all available races
```json
{
  "races": [
    {
      "id": "human",
      "name": "Human",
      "hp_bonus": 5,
      ...
    }
  ]
}
```

### Game Save/Load

#### POST `/game/save`
Save current game state
```json
Request:
{
  "hero_name": "Aragorn",
  "hero_class": "Warrior",
  "hero_race": "Human",
  "level": 1,
  "experience": 0,
  "resources": {
    "wood": 500,
    "food": 400,
    "gold": 300,
    "crystal": 100,
    "soul_energy": 50,
    "stone": 600,
    "iron": 200
  },
  "buildings": [
    {"type": "wood_mine", "level": 1},
    {"type": "barracks", "level": 1}
  ],
  "units": []
}

Response (201):
{
  "message": "Game saved successfully",
  "game_id": 1,
  "saved_at": "2026-01-24T21:03:50.375949"
}
```

#### GET `/game/load/{game_id}`
Load saved game
```
GET /game/load/1

Response (200):
{
  "id": 1,
  "hero_name": "Aragorn",
  "hero_class": "Warrior",
  "hero_race": "Human",
  "level": 1,
  "experience": 0,
  "created_at": "2026-01-24T21:03:50.375949",
  "updated_at": "2026-01-24T21:03:50.375949",
  "resources": {
    "wood": 500,
    ...
  },
  "buildings": [...],
  "units": [...]
}
```

#### GET `/game/list`
List all saved games
```
Response (200):
[
  {
    "id": 1,
    "hero_name": "Aragorn",
    "hero_class": "Warrior",
    "hero_race": "Human",
    "level": 1,
    "created_at": "2026-01-24T21:03:50.375949",
    "updated_at": "2026-01-24T21:03:50.375949"
  }
]
```

### Town Management

#### GET `/game/town/{game_id}`
Get complete town status (resources, buildings, units)
```
GET /game/town/1

Response (200):
{
  "id": 1,
  "hero_name": "Aragorn",
  "resources": {...},
  "buildings": [...],
  "units": [...]
}
```

### Resource Management

#### GET `/game/resource/{game_id}/{resource_type}`
Get specific resource amount
```
GET /game/resource/1/wood

Response (200):
{
  "type": "wood",
  "amount": 500,
  "name": "Wood"
}
```

#### POST `/game/resource/{game_id}/{resource_type}`
Add or subtract resources
```json
POST /game/resource/1/wood

Request:
{
  "amount": 100
}

Response (200):
{
  "type": "wood",
  "amount": 600,
  "name": "Wood"
}
```

#### GET `/game/production/{game_id}`
Get all production rates from buildings
```
GET /game/production/1

Response (200):
{
  "production_rates": {
    "wood": 10,
    "food": 12,
    "stone": 15
  },
  "calculated_at": "2026-01-24T21:05:00.000000"
}
```

### Building Management

#### GET `/game/building/{game_id}`
Get all buildings in town
```
GET /game/building/1

Response (200):
[
  {
    "id": 1,
    "type": "wood_mine",
    "name": "Wood Mine",
    "level": 1,
    "resource": "wood",
    "production_per_minute": 10,
    "description": "Produces wood",
    "built_at": "2026-01-24T21:03:50.375949",
    "next_level_cost": {
      "gold": 130,
      "stone": 65
    }
  }
]
```

#### POST `/game/building/{game_id}`
Create new building
```json
POST /game/building/1

Request:
{
  "building_type": "farm"
}

Response (201):
{
  "message": "Building created",
  "building": {...}
}
```

#### POST `/game/building/{building_id}/upgrade`
Upgrade building to next level
```
POST /game/building/1/upgrade

Response (200):
{
  "message": "Building upgraded",
  "building": {
    ...
    "level": 2,
    "next_level_cost": {...}
  }
}
```

#### GET `/game/buildings/available`
Get list of all available building types
```
GET /game/buildings/available

Response (200):
[
  {
    "type": "wood_mine",
    "name": "Wood Mine",
    "description": "Produces wood",
    "resource": "wood",
    "base_cost": {"gold": 100, "stone": 50},
    "production_per_minute": 10
  },
  ...
]
```

### Unit Management

#### GET `/game/unit/{game_id}`
Get all units in town
```
GET /game/unit/1

Response (200):
[
  {
    "id": 1,
    "type": "soldier",
    "race": "Human",
    "name": "Knight",
    "count": 5,
    "attack": 15,
    "defense": 12,
    "hp": 100,
    "description": "Skilled warrior with sword and shield",
    "cost_per_unit": {"gold": 50, "food": 20},
    "total_cost": {"gold": 250, "food": 100},
    "hired_at": "2026-01-24T21:04:07.483241"
  }
]
```

#### POST `/game/unit/{game_id}/recruit`
Recruit new units
```json
POST /game/unit/1/recruit

Request:
{
  "unit_type": "soldier",
  "race": "Human",
  "count": 5
}

Response (201):
{
  "message": "Recruited 5 Knight",
  "unit": {...}
}
```

#### GET `/game/units/available/{race}`
Get available unit types for a race
```
GET /game/units/available/Human

Response (200):
[
  {
    "type": "soldier",
    "name": "Knight",
    "description": "Skilled warrior with sword and shield",
    "cost": {"gold": 50, "food": 20},
    "attack": 15,
    "defense": 12,
    "hp": 100
  },
  ...
]
```

---

## Game Flow Example

### 1. Create Hero
```
POST /api/hero/create
{
  "name": "Aragorn",
  "class": "Warrior",
  "race": "Human"
}
```

### 2. Save Game with Resources
```
POST /api/game/save
{
  "hero_name": "Aragorn",
  "hero_class": "Warrior",
  "hero_race": "Human",
  "level": 1,
  "experience": 0,
  "resources": {
    "wood": 500,
    "food": 400,
    "gold": 300,
    "crystal": 100,
    "soul_energy": 50,
    "stone": 600,
    "iron": 200
  },
  "buildings": [
    {"type": "wood_mine", "level": 1},
    {"type": "barracks", "level": 1}
  ],
  "units": []
}
```

### 3. Load Game
```
GET /api/game/load/1
```

### 4. Check Town Status
```
GET /api/game/town/1
GET /api/game/production/1
```

### 5. Recruit Units
```
POST /api/game/unit/1/recruit
{
  "unit_type": "soldier",
  "race": "Human",
  "count": 5
}
```

### 6. Upgrade Building
```
POST /api/game/building/1/upgrade
```

---

## Database Relationships Diagram

```
SavedGame (Hero)
    ├── Resource (7 resources: wood, food, gold, etc.)
    ├── Building (8 building types with levels)
    │   ├── wood_mine (produces wood)
    │   ├── farm (produces food)
    │   ├── gold_mine (produces gold)
    │   ├── crystal_mine (produces crystal)
    │   ├── soul_extractor (produces soul_energy)
    │   ├── stone_quarry (produces stone)
    │   ├── iron_mine (produces iron)
    │   └── barracks (trains units)
    └── Unit (5 types per race × 6 races = 30 unit types)
        ├── Human (Knight, Archer, Mage, Cleric, Cavalry)
        ├── Elf (Archer, Mage, Scout, Ranger, Druid)
        ├── Dwarf (Warrior, Berserker, Engineer, Defender, Rogue)
        ├── Orc (Warrior, Shaman, Raider, Brute, Skirmisher)
        ├── Undead (Skeleton, Warlock, Crawler, Revenant, Phantom)
        └── Dragonborn (Warrior, Wyvern Rider, Fire Mage, Berserker, Defender)
```

---

## Implementation Notes

- **Production Calculation**: Production rates are calculated on-demand from building levels. Consider implementing a scheduler for real-time production collection.
- **Cost Scaling**: Building upgrade costs increase by 30% per level using formula: `base_cost × (1 + level × 0.3)`
- **Resource Limits**: No maximum resource storage implemented (consider adding silo/storage buildings)
- **Unit Army Size**: No maximum army size limit (consider balancing with barracks level)
- **Timestamps**: All entities track creation and update timestamps for audit trails
- **Database**: SQLite by default, easily replaceable with PostgreSQL for production

---

## Status

✅ Database models complete
✅ All API endpoints implemented
✅ 6 races with 5 units each (30 total units)
✅ 8 building types with production formulas
✅ 7 resource types
✅ Save/Load game functionality
✅ Resource management
✅ Unit recruitment system
✅ Building upgrade system

