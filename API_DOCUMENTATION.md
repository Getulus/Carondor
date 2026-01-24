# Carondor API Documentation

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Get All Character Classes

**Request:**
```
GET /api/classes
```

**Response (200 OK):**
```json
{
  "classes": [
    {
      "id": "Warrior",
      "name": "Warrior",
      "health_point": 150,
      "physical_attack": 25,
      "physical_defense": 20,
      "magical_attack": 5,
      "magical_defense": 10,
      "description": "A master of melee combat with high health and physical defense."
    },
    {
      "id": "Sorcerer",
      "name": "Sorcerer",
      "health_point": 80,
      "physical_attack": 8,
      "physical_defense": 8,
      "magical_attack": 30,
      "magical_defense": 15,
      "description": "A wielder of magical power with strong spell attacks."
    },
    ...
  ]
}
```

### 2. Get All Character Races

**Request:**
```
GET /api/races
```

**Response (200 OK):**
```json
{
  "races": [
    {
      "id": "Human",
      "name": "Human",
      "physical_bonus": 2,
      "magical_bonus": 2,
      "health_bonus": 5,
      "description": "Versatile and adaptable, humans are well-rounded warriors."
    },
    {
      "id": "Elf",
      "name": "Elf",
      "physical_bonus": 1,
      "magical_bonus": 4,
      "health_bonus": 0,
      "description": "Graceful and magical, elves excel at spellcasting."
    },
    ...
  ]
}
```

### 3. Create a New Hero

**Request:**
```
POST /api/hero/create
Content-Type: application/json

{
  "name": "Aragorn",
  "class": "Warrior",
  "race": "Human"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "hero": {
    "name": "Aragorn",
    "class": "Warrior",
    "race": "Human",
    "level": 1,
    "experience": 0,
    "stats": {
      "health_point": 155,
      "physical_attack": 27,
      "physical_defense": 22,
      "magical_attack": 7,
      "magical_defense": 12
    },
    "created_at": "2026-01-24T21:05:30.123456"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required fields"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid class or race"
}
```

### 4. Health Check

**Request:**
```
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

## Classes

### Available Classes
1. **Warrior**
   - Health: 150
   - Physical Attack: 25
   - Physical Defense: 20
   - Magical Attack: 5
   - Magical Defense: 10

2. **Sorcerer**
   - Health: 80
   - Physical Attack: 8
   - Physical Defense: 8
   - Magical Attack: 30
   - Magical Defense: 15

3. **Paladin**
   - Health: 130
   - Physical Attack: 18
   - Physical Defense: 25
   - Magical Attack: 12
   - Magical Defense: 20

4. **Druid**
   - Health: 110
   - Physical Attack: 15
   - Physical Defense: 12
   - Magical Attack: 20
   - Magical Defense: 18

5. **ShadowHunter**
   - Health: 100
   - Physical Attack: 22
   - Physical Defense: 12
   - Magical Attack: 18
   - Magical Defense: 12

6. **Bandit**
   - Health: 95
   - Physical Attack: 28
   - Physical Defense: 10
   - Magical Attack: 8
   - Magical Defense: 8

## Races

### Available Races
1. **Human** (Balanced)
   - Physical Bonus: +2
   - Magical Bonus: +2
   - Health Bonus: +5

2. **Elf** (Magical)
   - Physical Bonus: +1
   - Magical Bonus: +4
   - Health Bonus: 0

3. **Dwarf** (Physical Tank)
   - Physical Bonus: +3
   - Magical Bonus: 0
   - Health Bonus: +8

4. **Orc** (Physical Attacker)
   - Physical Bonus: +5
   - Magical Bonus: 0
   - Health Bonus: +6

5. **Undead** (Hybrid Tank)
   - Physical Bonus: +2
   - Magical Bonus: +3
   - Health Bonus: +10

6. **Dragonborn** (Hybrid)
   - Physical Bonus: +4
   - Magical Bonus: +3
   - Health Bonus: +4

## Stat Calculation

Final hero stats are calculated by combining class base stats with race bonuses:

```
Final Stat = Class Stat + Race Bonus
```

For example:
```
Warrior with Human race:
- Health: 150 + 5 = 155
- Physical Attack: 25 + 2 = 27
- Physical Defense: 20 + 2 = 22
- Magical Attack: 5 + 2 = 7
- Magical Defense: 10 + 2 = 12
```

## Error Handling

All errors return appropriate HTTP status codes:
- **400 Bad Request**: Invalid input or missing required fields
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## CORS

The API has CORS enabled for all origins to allow frontend communication.

## Testing

To test the API, you can use curl:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Get all classes
curl http://localhost:5000/api/classes

# Get all races
curl http://localhost:5000/api/races

# Create a hero
curl -X POST http://localhost:5000/api/hero/create \
  -H "Content-Type: application/json" \
  -d '{"name":"Aragorn","class":"Warrior","race":"Human"}'
```

Or use a tool like Postman or Insomnia for more interactive testing.
