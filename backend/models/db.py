"""Database configuration and models"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

# ==================== RESOURCE TYPES ====================

RESOURCES = {
    'wood': 'Wood',
    'food': 'Food',
    'gold': 'Gold',
    'crystal': 'Crystal',
    'soul_energy': 'Soul Energy',
    'stone': 'Stone',
    'iron': 'Iron',
}

# ==================== BUILDING DEFINITIONS ====================

BUILDINGS = {
    'wood_mine': {
        'name': 'Wood Mine',
        'resource': 'wood',
        'base_cost': {'gold': 100, 'stone': 50},
        'production_per_second': 16,  # per level
        'description': 'Produces wood'
    },
    'farm': {
        'name': 'Farm',
        'resource': 'food',
        'base_cost': {'gold': 80, 'stone': 40},
        'production_per_second': 20,
        'description': 'Produces food'
    },
    'gold_mine': {
        'name': 'Gold Mine',
        'resource': 'gold',
        'base_cost': {'gold': 300, 'stone': 200},
        'production_per_second': 8,
        'description': 'Produces gold'
    },
    'crystal_mine': {
        'name': 'Crystal Mine',
        'resource': 'crystal',
        'base_cost': {'gold': 500, 'iron': 200},
        'production_per_second': 5,
        'description': 'Produces crystal'
    },
    'soul_extractor': {
        'name': 'Soul Extractor',
        'resource': 'soul_energy',
        'base_cost': {'gold': 800, 'crystal': 100},
        'production_per_second': 3,
        'description': 'Produces soul energy'
    },
    'stone_quarry': {
        'name': 'Stone Quarry',
        'resource': 'stone',
        'base_cost': {'gold': 60, 'wood': 30},
        'production_per_second': 25,
        'description': 'Produces stone'
    },
    'iron_mine': {
        'name': 'Iron Mine',
        'resource': 'iron',
        'base_cost': {'gold': 200, 'stone': 100},
        'production_per_second': 13,
        'description': 'Produces iron'
    },
    'barracks': {
        'name': 'Barracks',
        'resource': None,
        'base_cost': {'gold': 150, 'wood': 100, 'stone': 100},
        'production_per_second': 0,
        'description': 'Train soldiers'
    },
}

# ==================== UNIT DEFINITIONS ====================

UNITS = {
    'Human': {
        'soldier': {
            'name': 'Knight',
            'cost': {'gold': 50, 'food': 20},
            'attack': 15,
            'defense': 12,
            'hp': 100,
            'description': 'Skilled warrior with sword and shield'
        },
        'archer': {
            'name': 'Archer',
            'cost': {'gold': 40, 'food': 15},
            'attack': 18,
            'defense': 5,
            'hp': 60,
            'description': 'Ranged attacker with bow'
        },
        'mage': {
            'name': 'Mage',
            'cost': {'gold': 80, 'crystal': 30},
            'attack': 20,
            'defense': 3,
            'hp': 40,
            'description': 'Magical offensive unit'
        },
        'healer': {
            'name': 'Cleric',
            'cost': {'gold': 70, 'food': 25},
            'attack': 8,
            'defense': 8,
            'hp': 50,
            'description': 'Support unit that heals allies'
        },
        'cavalry': {
            'name': 'Cavalry',
            'cost': {'gold': 100, 'food': 30},
            'attack': 22,
            'defense': 10,
            'hp': 120,
            'description': 'Fast mounted warrior'
        }
    },
    'Elf': {
        'archer': {
            'name': 'Elven Archer',
            'cost': {'gold': 45, 'wood': 20},
            'attack': 20,
            'defense': 6,
            'hp': 70,
            'description': 'Highly accurate ranged attacker'
        },
        'mage': {
            'name': 'Mage Adept',
            'cost': {'gold': 75, 'crystal': 35},
            'attack': 25,
            'defense': 4,
            'hp': 45,
            'description': 'Powerful magical user'
        },
        'scout': {
            'name': 'Scout',
            'cost': {'gold': 35, 'wood': 15},
            'attack': 16,
            'defense': 4,
            'hp': 50,
            'description': 'Fast reconnaissance unit'
        },
        'ranger': {
            'name': 'Ranger',
            'cost': {'gold': 60, 'wood': 30},
            'attack': 22,
            'defense': 8,
            'hp': 80,
            'description': 'Versatile ranged warrior'
        },
        'druid': {
            'name': 'Druid',
            'cost': {'gold': 85, 'crystal': 40},
            'attack': 12,
            'defense': 10,
            'hp': 70,
            'description': 'Nature magic specialist'
        }
    },
    'Dwarf': {
        'warrior': {
            'name': 'Dwarf Warrior',
            'cost': {'gold': 60, 'iron': 30},
            'attack': 18,
            'defense': 16,
            'hp': 130,
            'description': 'Strong armored fighter'
        },
        'berserker': {
            'name': 'Berserker',
            'cost': {'gold': 90, 'iron': 50},
            'attack': 28,
            'defense': 10,
            'hp': 140,
            'description': 'Rage-fueled melee attacker'
        },
        'engineer': {
            'name': 'Engineer',
            'cost': {'gold': 70, 'iron': 40, 'stone': 30},
            'attack': 10,
            'defense': 12,
            'hp': 90,
            'description': 'Support unit with explosives'
        },
        'defender': {
            'name': 'Defender',
            'cost': {'gold': 55, 'iron': 35, 'stone': 20},
            'attack': 12,
            'defense': 20,
            'hp': 150,
            'description': 'Ultimate defensive warrior'
        },
        'rogue': {
            'name': 'Rogue',
            'cost': {'gold': 45, 'iron': 20},
            'attack': 20,
            'defense': 7,
            'hp': 70,
            'description': 'Fast attack specialist'
        }
    },
    'Orc': {
        'warrior': {
            'name': 'Orc Warrior',
            'cost': {'gold': 55, 'food': 25},
            'attack': 20,
            'defense': 10,
            'hp': 140,
            'description': 'Aggressive melee fighter'
        },
        'shaman': {
            'name': 'Shaman',
            'cost': {'gold': 80, 'soul_energy': 30},
            'attack': 18,
            'defense': 8,
            'hp': 85,
            'description': 'Magic and melee hybrid'
        },
        'raider': {
            'name': 'Raider',
            'cost': {'gold': 65, 'food': 30},
            'attack': 24,
            'defense': 8,
            'hp': 110,
            'description': 'High damage melee attacker'
        },
        'brute': {
            'name': 'Brute',
            'cost': {'gold': 100, 'food': 40},
            'attack': 26,
            'defense': 12,
            'hp': 160,
            'description': 'Massive powerful unit'
        },
        'skirmisher': {
            'name': 'Skirmisher',
            'cost': {'gold': 50, 'food': 20},
            'attack': 16,
            'defense': 6,
            'hp': 80,
            'description': 'Mobile attacker'
        }
    },
    'Undead': {
        'skeleton': {
            'name': 'Skeleton',
            'cost': {'gold': 40, 'soul_energy': 20},
            'attack': 14,
            'defense': 8,
            'hp': 70,
            'description': 'Animated bone warrior'
        },
        'warlock': {
            'name': 'Warlock',
            'cost': {'gold': 90, 'soul_energy': 50},
            'attack': 22,
            'defense': 6,
            'hp': 80,
            'description': 'Dark magic specialist'
        },
        'crawler': {
            'name': 'Crawler',
            'cost': {'gold': 50, 'soul_energy': 30},
            'attack': 18,
            'defense': 7,
            'hp': 75,
            'description': 'Rapid melee attacker'
        },
        'revenant': {
            'name': 'Revenant',
            'cost': {'gold': 120, 'soul_energy': 80},
            'attack': 25,
            'defense': 14,
            'hp': 150,
            'description': 'Powerful undead champion'
        },
        'phantom': {
            'name': 'Phantom',
            'cost': {'gold': 85, 'soul_energy': 60},
            'attack': 20,
            'defense': 10,
            'hp': 90,
            'description': 'Ghost warrior'
        }
    },
    'Dragonborn': {
        'warrior': {
            'name': 'Dragon Warrior',
            'cost': {'gold': 100, 'crystal': 30},
            'attack': 24,
            'defense': 14,
            'hp': 150,
            'description': 'Dragon-blooded fighter'
        },
        'wyvern_rider': {
            'name': 'Wyvern Rider',
            'cost': {'gold': 150, 'crystal': 50},
            'attack': 28,
            'defense': 12,
            'hp': 160,
            'description': 'Mounted aerial warrior'
        },
        'fire_mage': {
            'name': 'Fire Mage',
            'cost': {'gold': 95, 'crystal': 40},
            'attack': 26,
            'defense': 8,
            'hp': 95,
            'description': 'Flame spell specialist'
        },
        'berserker': {
            'name': 'Dragon Berserker',
            'cost': {'gold': 110, 'crystal': 35},
            'attack': 30,
            'defense': 11,
            'hp': 155,
            'description': 'Enraged draconic warrior'
        },
        'defender': {
            'name': 'Dragon Defender',
            'cost': {'gold': 105, 'crystal': 40},
            'attack': 16,
            'defense': 18,
            'hp': 180,
            'description': 'Heavily armored protector'
        }
    }
}

# ==================== DATABASE MODELS ====================

class SavedGame(db.Model):
    """Saved game for a player"""
    __tablename__ = 'saved_games'
    
    id = db.Column(db.Integer, primary_key=True)
    hero_name = db.Column(db.String(100), nullable=False)
    hero_class = db.Column(db.String(50), nullable=False)
    hero_race = db.Column(db.String(50), nullable=False)
    level = db.Column(db.Integer, default=1)
    experience = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resources = db.relationship('Resource', backref='game', lazy=True, cascade='all, delete-orphan')
    buildings = db.relationship('Building', backref='game', lazy=True, cascade='all, delete-orphan')
    units = db.relationship('Unit', backref='game', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'hero_name': self.hero_name,
            'hero_class': self.hero_class,
            'hero_race': self.hero_race,
            'level': self.level,
            'experience': self.experience,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resources': {r.resource_type: r.amount for r in self.resources},
            'buildings': [b.to_dict() for b in self.buildings],
            'units': [u.to_dict() for u in self.units],
        }


class Resource(db.Model):
    """Town resources"""
    __tablename__ = 'resources'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('saved_games.id'), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # wood, food, gold, etc.
    amount = db.Column(db.Float, default=0)
    
    def to_dict(self):
        return {
            'type': self.resource_type,
            'amount': self.amount,
            'name': RESOURCES.get(self.resource_type, self.resource_type)
        }


class Building(db.Model):
    """Town buildings"""
    __tablename__ = 'buildings'
    __table_args__ = (db.UniqueConstraint('game_id', 'building_type', name='uq_game_building_type'),)
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('saved_games.id'), nullable=False)
    building_type = db.Column(db.String(50), nullable=False)  # wood_mine, farm, barracks, etc.
    level = db.Column(db.Integer, default=1)
    built_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_production_rate(self):
        """Get production per second for this building at current level"""
        building_def = BUILDINGS.get(self.building_type, {})
        base_rate = building_def.get('production_per_second', 0)
        return base_rate * self.level
    
    def get_build_cost(self):
        """Get cost to build this building at next level"""
        building_def = BUILDINGS.get(self.building_type, {})
        base_cost = building_def.get('base_cost', {})
        
        # Cost increases with level
        multiplier = 1 + (self.level * 0.3)
        return {resource: int(cost * multiplier) for resource, cost in base_cost.items()}
    
    def to_dict(self):
        building_def = BUILDINGS.get(self.building_type, {})
        return {
            'id': self.id,
            'type': self.building_type,
            'name': building_def.get('name', self.building_type),
            'level': self.level,
            'resource': building_def.get('resource'),
            'production_per_second': self.get_production_rate(),
            'description': building_def.get('description', ''),
            'built_at': self.built_at.isoformat(),
            'next_level_cost': self.get_build_cost(),
        }


class Unit(db.Model):
    """Army units in town"""
    __tablename__ = 'units'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('saved_games.id'), nullable=False)
    unit_type = db.Column(db.String(50), nullable=False)  # soldier, archer, mage, etc.
    race = db.Column(db.String(50), nullable=False)
    count = db.Column(db.Integer, default=0)
    hired_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_unit_stats(self):
        """Get base stats for this unit type"""
        race_units = UNITS.get(self.race, {})
        unit_def = race_units.get(self.unit_type, {})
        return unit_def
    
    def get_hire_cost(self):
        """Get cost to hire one unit"""
        unit_def = self.get_unit_stats()
        return unit_def.get('cost', {})
    
    def to_dict(self):
        unit_def = self.get_unit_stats()
        return {
            'id': self.id,
            'type': self.unit_type,
            'race': self.race,
            'name': unit_def.get('name', self.unit_type),
            'count': self.count,
            'attack': unit_def.get('attack', 0),
            'defense': unit_def.get('defense', 0),
            'hp': unit_def.get('hp', 0),
            'description': unit_def.get('description', ''),
            'cost_per_unit': self.get_hire_cost(),
            'total_cost': {k: v * self.count for k, v in self.get_hire_cost().items()},
            'hired_at': self.hired_at.isoformat(),
        }
