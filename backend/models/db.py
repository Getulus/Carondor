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
    'academy': {
        'name': 'Academy',
        'resource': None,
        'base_cost': {'gold': 1000, 'crystal': 200, 'stone': 300},
        'production_per_second': 0,
        'description': 'Research talents to improve economy and units',
        'special': 'talent_points'
    },
    # Race-Specific Special Buildings
    'human_cathedral': {
        'name': 'Grand Cathedral',
        'resource': None,
        'base_cost': {'gold': 1500, 'stone': 500, 'crystal': 150},
        'production_per_second': 0,
        'description': 'Human special building - Grants +20% gold production and +10% unit defense',
        'race': 'Human',
        'bonus': {'gold_multiplier': 1.2, 'unit_defense': 10}
    },
    'elf_world_tree': {
        'name': 'Ancient World Tree',
        'resource': None,
        'base_cost': {'gold': 1500, 'wood': 800, 'crystal': 200},
        'production_per_second': 0,
        'description': 'Elf special building - Grants +25% wood production and +15% unit magical attack',
        'race': 'Elf',
        'bonus': {'wood_multiplier': 1.25, 'unit_magical_attack': 15}
    },
    'dwarf_forge': {
        'name': 'Legendary Forge',
        'resource': None,
        'base_cost': {'gold': 1500, 'iron': 600, 'stone': 400},
        'production_per_second': 0,
        'description': 'Dwarf special building - Grants +30% iron production and +20% unit physical attack',
        'race': 'Dwarf',
        'bonus': {'iron_multiplier': 1.3, 'unit_physical_attack': 20}
    },
    'orc_warcamp': {
        'name': 'Great War Camp',
        'resource': None,
        'base_cost': {'gold': 1500, 'food': 700, 'iron': 300},
        'production_per_second': 0,
        'description': 'Orc special building - Grants +20% food production and +25 unit HP',
        'race': 'Orc',
        'bonus': {'food_multiplier': 1.2, 'unit_hp': 25}
    },
    'undead_necropolis': {
        'name': 'Dark Necropolis',
        'resource': None,
        'base_cost': {'gold': 1500, 'soul_energy': 500, 'crystal': 250},
        'production_per_second': 0,
        'description': 'Undead special building - Grants +50% soul energy production and units cost -20% resources',
        'race': 'Undead',
        'bonus': {'soul_energy_multiplier': 1.5, 'unit_cost_reduction': 0.2}
    },
    'dragonborn_sanctuary': {
        'name': 'Dragon Sanctuary',
        'resource': None,
        'base_cost': {'gold': 2000, 'crystal': 400, 'iron': 400},
        'production_per_second': 0,
        'description': 'Dragonborn special building - Grants +35% crystal production and +15% all unit stats',
        'race': 'Dragonborn',
        'bonus': {'crystal_multiplier': 1.35, 'unit_all_stats': 15}
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
    
    def get_xp_needed_for_next_level(self):
        """Calculate XP needed to reach next level"""
        # Formula: 100 * level^1.5
        return int(100 * (self.level ** 1.5))
    
    def add_experience(self, xp_gained):
        """Add experience and handle level-ups"""
        self.experience += xp_gained
        levels_gained = 0
        
        # Check for level-ups
        while self.experience >= self.get_xp_needed_for_next_level():
            self.experience -= self.get_xp_needed_for_next_level()
            self.level += 1
            levels_gained += 1
        
        return levels_gained
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resources = db.relationship('Resource', backref='game', lazy=True, cascade='all, delete-orphan')
    buildings = db.relationship('Building', backref='game', lazy=True, cascade='all, delete-orphan')
    units = db.relationship('Unit', backref='game', lazy=True, cascade='all, delete-orphan')
    map_tiles = db.relationship('MapTile', backref='game', lazy=True, cascade='all, delete-orphan')
    talents = db.relationship('Talent', backref='game', lazy=True, cascade='all, delete-orphan')
    items = db.relationship('Item', backref='game', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'hero_name': self.hero_name,
            'hero_class': self.hero_class,
            'hero_race': self.hero_race,
            'level': self.level,
            'experience': self.experience,
            'xp_needed': self.get_xp_needed_for_next_level(),
            'xp_progress': round((self.experience / self.get_xp_needed_for_next_level()) * 100, 1),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'resources': {r.resource_type: r.amount for r in self.resources},
            'buildings': [b.to_dict() for b in self.buildings],
            'units': [u.to_dict() for u in self.units],
            'talents': [t.to_dict() for t in self.talents],
            'items': [i.to_dict() for i in self.items],
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


class MapTile(db.Model):
    """World map hexagonal tiles"""
    __tablename__ = 'map_tiles'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('saved_games.id'), nullable=False)
    q = db.Column(db.Integer, nullable=False)  # Axial coordinate Q
    r = db.Column(db.Integer, nullable=False)  # Axial coordinate R
    terrain_type = db.Column(db.String(50), nullable=False)
    occupied_by = db.Column(db.String(50), nullable=True)  # 'player', 'neutral', or None
    explored = db.Column(db.Boolean, default=False)
    enemy_type = db.Column(db.String(50), nullable=True)  # Type of enemy on neutral tiles
    enemy_strength = db.Column(db.Integer, default=0)  # Enemy power level
    
    __table_args__ = (db.UniqueConstraint('game_id', 'q', 'r', name='uq_game_tile_coords'),)
    
    def to_dict(self):
        from models.world_map import TERRAIN_TRAITS, ENEMY_TYPES
        
        traits = TERRAIN_TRAITS.get(self.terrain_type, {})
        resource_bonuses = {}
        
        for key, value in traits.items():
            if key.endswith('_bonus') and key != 'defense_bonus':
                resource_name = key.replace('_bonus', '')
                resource_bonuses[resource_name] = value
        
        enemy_data = None
        if self.enemy_type and self.enemy_type in ENEMY_TYPES:
            enemy_info = ENEMY_TYPES[self.enemy_type]
            enemy_data = {
                'type': self.enemy_type,
                'name': enemy_info['name'],
                'strength': self.enemy_strength,
                'description': enemy_info['description'],
                'power': enemy_info['base_power'] + (self.enemy_strength * enemy_info['power_per_level'])
            }
        
        return {
            'id': self.id,
            'q': self.q,
            'r': self.r,
            'terrain_type': self.terrain_type,
            'terrain_name': traits.get('name', self.terrain_type),
            'color': traits.get('color', '#CCCCCC'),
            'defense_bonus': traits.get('defense_bonus', 0),
            'movement_cost': traits.get('movement_cost', 1),
            'resource_bonuses': resource_bonuses,
            'description': traits.get('description', ''),
            'occupied_by': self.occupied_by,
            'explored': self.explored,
            'enemy': enemy_data,
        }


# ==================== TALENT SYSTEM ====================

TALENT_TREE = {
    # Economy Talents
    'efficient_mining': {
        'name': 'Efficient Mining',
        'category': 'economy',
        'max_level': 5,
        'cost_per_level': 1,
        'description': 'Increases all resource production by 5% per level',
        'bonus': {'resource_multiplier': 0.05}
    },
    'wealthy_empire': {
        'name': 'Wealthy Empire',
        'category': 'economy',
        'max_level': 3,
        'cost_per_level': 2,
        'description': 'Increases gold production by 15% per level',
        'bonus': {'gold_multiplier': 0.15}
    },
    'crystal_mastery': {
        'name': 'Crystal Mastery',
        'category': 'economy',
        'max_level': 3,
        'cost_per_level': 2,
        'description': 'Increases crystal production by 20% per level',
        'bonus': {'crystal_multiplier': 0.2}
    },
    'abundant_harvest': {
        'name': 'Abundant Harvest',
        'category': 'economy',
        'max_level': 5,
        'cost_per_level': 1,
        'description': 'Increases food production by 10% per level',
        'bonus': {'food_multiplier': 0.1}
    },
    'forestry_expertise': {
        'name': 'Forestry Expertise',
        'category': 'economy',
        'max_level': 5,
        'cost_per_level': 1,
        'description': 'Increases wood production by 10% per level',
        'bonus': {'wood_multiplier': 0.1}
    },
    # Combat Talents
    'warrior_training': {
        'name': 'Warrior Training',
        'category': 'military',
        'max_level': 5,
        'cost_per_level': 1,
        'description': 'Increases all unit attack by 5% per level',
        'bonus': {'unit_attack_multiplier': 0.05}
    },
    'fortification': {
        'name': 'Fortification',
        'category': 'military',
        'max_level': 5,
        'cost_per_level': 1,
        'description': 'Increases all unit defense by 5% per level',
        'bonus': {'unit_defense_multiplier': 0.05}
    },
    'vitality': {
        'name': 'Vitality',
        'category': 'military',
        'max_level': 5,
        'cost_per_level': 1,
        'description': 'Increases all unit HP by 10 per level',
        'bonus': {'unit_hp_bonus': 10}
    },
    'reduced_upkeep': {
        'name': 'Reduced Upkeep',
        'category': 'military',
        'max_level': 3,
        'cost_per_level': 2,
        'description': 'Reduces unit recruitment cost by 10% per level',
        'bonus': {'unit_cost_reduction': 0.1}
    },
    'rapid_recruitment': {
        'name': 'Rapid Recruitment',
        'category': 'military',
        'max_level': 3,
        'cost_per_level': 2,
        'description': 'Can recruit 2 additional units per click per level',
        'bonus': {'recruitment_speed': 2}
    },
    # Special Talents
    'arcane_knowledge': {
        'name': 'Arcane Knowledge',
        'category': 'special',
        'max_level': 1,
        'cost_per_level': 5,
        'description': 'Unlocks advanced magical abilities',
        'bonus': {'magical_power': 50}
    },
    'legendary_hero': {
        'name': 'Legendary Hero',
        'category': 'special',
        'max_level': 1,
        'cost_per_level': 5,
        'description': 'Your hero gains +50% to all stats',
        'bonus': {'hero_stats_multiplier': 0.5}
    },
}


class Talent(db.Model):
    """Talent points invested in the Academy"""
    __tablename__ = 'talents'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('saved_games.id'), nullable=False)
    talent_id = db.Column(db.String(50), nullable=False)  # Key from TALENT_TREE
    level = db.Column(db.Integer, default=0)
    
    __table_args__ = (db.UniqueConstraint('game_id', 'talent_id', name='uq_game_talent'),)
    
    def get_talent_info(self):
        """Get talent definition"""
        return TALENT_TREE.get(self.talent_id, {})
    
    def get_current_bonus(self):
        """Calculate current bonus based on level"""
        talent_info = self.get_talent_info()
        bonus = talent_info.get('bonus', {})
        return {key: value * self.level for key, value in bonus.items()}
    
    def to_dict(self):
        talent_info = self.get_talent_info()
        return {
            'id': self.id,
            'talent_id': self.talent_id,
            'name': talent_info.get('name', self.talent_id),
            'category': talent_info.get('category', 'unknown'),
            'level': self.level,
            'max_level': talent_info.get('max_level', 1),
            'cost_per_level': talent_info.get('cost_per_level', 1),
            'description': talent_info.get('description', ''),
            'current_bonus': self.get_current_bonus(),
        }


# ==================== ITEM SYSTEM ====================

ITEM_TYPES = {
    'weapon': 'Weapon',
    'armor': 'Armor',
    'helmet': 'Helmet',
    'boots': 'Boots',
    'amulet': 'Amulet',
    'ring': 'Ring',
}

ITEM_RARITIES = {
    'common': {'name': 'Common', 'color': '#9e9e9e', 'stat_multiplier': 1.0},
    'uncommon': {'name': 'Uncommon', 'color': '#4caf50', 'stat_multiplier': 1.5},
    'rare': {'name': 'Rare', 'color': '#2196f3', 'stat_multiplier': 2.0},
    'epic': {'name': 'Epic', 'color': '#9c27b0', 'stat_multiplier': 2.5},
    'legendary': {'name': 'Legendary', 'color': '#ff9800', 'stat_multiplier': 3.0},
}

ITEM_TEMPLATES = {
    # Weapons
    'iron_sword': {
        'name': 'Iron Sword',
        'type': 'weapon',
        'base_stats': {'attack': 10, 'physical_attack': 5},
        'description': 'A sturdy iron blade'
    },
    'steel_sword': {
        'name': 'Steel Sword',
        'type': 'weapon',
        'base_stats': {'attack': 15, 'physical_attack': 8},
        'description': 'A well-crafted steel weapon'
    },
    'magic_staff': {
        'name': 'Magic Staff',
        'type': 'weapon',
        'base_stats': {'magical_attack': 12, 'attack': 5},
        'description': 'A staff imbued with magical power'
    },
    # Armor
    'leather_armor': {
        'name': 'Leather Armor',
        'type': 'armor',
        'base_stats': {'defense': 8, 'physical_defense': 5},
        'description': 'Light but protective leather armor'
    },
    'chainmail': {
        'name': 'Chainmail',
        'type': 'armor',
        'base_stats': {'defense': 15, 'physical_defense': 10},
        'description': 'Heavy chainmail protection'
    },
    'plate_armor': {
        'name': 'Plate Armor',
        'type': 'armor',
        'base_stats': {'defense': 25, 'physical_defense': 15, 'hp': 50},
        'description': 'Thick plate armor for maximum protection'
    },
    # Helmets
    'iron_helmet': {
        'name': 'Iron Helmet',
        'type': 'helmet',
        'base_stats': {'defense': 5, 'hp': 20},
        'description': 'Protects your head from harm'
    },
    'war_helm': {
        'name': 'War Helm',
        'type': 'helmet',
        'base_stats': {'defense': 10, 'physical_defense': 5, 'hp': 30},
        'description': 'A battle-hardened helm'
    },
    # Boots
    'leather_boots': {
        'name': 'Leather Boots',
        'type': 'boots',
        'base_stats': {'defense': 3, 'hp': 15},
        'description': 'Comfortable leather boots'
    },
    'steel_boots': {
        'name': 'Steel Boots',
        'type': 'boots',
        'base_stats': {'defense': 8, 'physical_defense': 5, 'hp': 25},
        'description': 'Heavy steel-reinforced boots'
    },
    # Amulets
    'health_amulet': {
        'name': 'Amulet of Vitality',
        'type': 'amulet',
        'base_stats': {'hp': 100},
        'description': 'Increases maximum health'
    },
    'power_amulet': {
        'name': 'Amulet of Power',
        'type': 'amulet',
        'base_stats': {'attack': 15, 'magical_attack': 10},
        'description': 'Boosts offensive capabilities'
    },
    # Rings
    'ring_of_strength': {
        'name': 'Ring of Strength',
        'type': 'ring',
        'base_stats': {'physical_attack': 10, 'attack': 5},
        'description': 'Enhances physical prowess'
    },
    'ring_of_magic': {
        'name': 'Ring of Magic',
        'type': 'ring',
        'base_stats': {'magical_attack': 12, 'magical_defense': 5},
        'description': 'Amplifies magical abilities'
    },
}


class Item(db.Model):
    """Hero inventory items"""
    __tablename__ = 'items'
    
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('saved_games.id'), nullable=False)
    item_template = db.Column(db.String(50), nullable=False)  # Key from ITEM_TEMPLATES
    rarity = db.Column(db.String(20), default='common')  # common, uncommon, rare, epic, legendary
    equipped = db.Column(db.Boolean, default=False)
    acquired_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_template(self):
        """Get item template"""
        return ITEM_TEMPLATES.get(self.item_template, {})
    
    def get_stats(self):
        """Get item stats with rarity multiplier applied"""
        template = self.get_template()
        base_stats = template.get('base_stats', {})
        multiplier = ITEM_RARITIES.get(self.rarity, {}).get('stat_multiplier', 1.0)
        
        return {key: int(value * multiplier) for key, value in base_stats.items()}
    
    def to_dict(self):
        template = self.get_template()
        rarity_info = ITEM_RARITIES.get(self.rarity, {})
        
        return {
            'id': self.id,
            'item_template': self.item_template,
            'name': template.get('name', self.item_template),
            'type': template.get('type', 'unknown'),
            'type_name': ITEM_TYPES.get(template.get('type', ''), 'Unknown'),
            'rarity': self.rarity,
            'rarity_name': rarity_info.get('name', self.rarity),
            'rarity_color': rarity_info.get('color', '#9e9e9e'),
            'stats': self.get_stats(),
            'description': template.get('description', ''),
            'equipped': self.equipped,
            'acquired_at': self.acquired_at.isoformat(),
        }
