"""World map with hexagonal tiles and terrain traits"""

import random
from typing import List, Dict, Tuple

# ==================== TERRAIN TRAITS ====================

TERRAIN_TRAITS = {
    'plains': {
        'name': 'Plains',
        'food_bonus': 2,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#90EE90',
        'description': 'Open grasslands, good for farming'
    },
    'forest': {
        'name': 'Forest',
        'wood_bonus': 3,
        'defense_bonus': 1,
        'movement_cost': 2,
        'color': '#228B22',
        'description': 'Dense woods, provides lumber and cover'
    },
    'mountain': {
        'name': 'Mountain',
        'stone_bonus': 2,
        'iron_bonus': 1,
        'defense_bonus': 3,
        'movement_cost': 3,
        'color': '#696969',
        'description': 'Rugged peaks, rich in minerals'
    },
    'hill': {
        'name': 'Hill',
        'stone_bonus': 1,
        'defense_bonus': 2,
        'movement_cost': 2,
        'color': '#8B7355',
        'description': 'Rolling hills with strategic advantage'
    },
    'swamp': {
        'name': 'Swamp',
        'food_bonus': 1,
        'defense_bonus': 1,
        'movement_cost': 3,
        'color': '#556B2F',
        'description': 'Murky wetlands, difficult to traverse'
    },
    'desert': {
        'name': 'Desert',
        'defense_bonus': 0,
        'movement_cost': 2,
        'color': '#EDC9AF',
        'description': 'Barren sands with little resources'
    },
    'fertile_land': {
        'name': 'Fertile Land',
        'food_bonus': 4,
        'gold_bonus': 1,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#7FFF00',
        'description': 'Extremely productive farmland'
    },
    'volcanic': {
        'name': 'Volcanic',
        'crystal_bonus': 2,
        'iron_bonus': 1,
        'defense_bonus': 1,
        'movement_cost': 3,
        'color': '#8B0000',
        'description': 'Active volcanic region with rare crystals'
    },
    'river': {
        'name': 'River',
        'food_bonus': 2,
        'gold_bonus': 1,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#4682B4',
        'description': 'Fresh water for trade and farming'
    },
    'lake': {
        'name': 'Lake',
        'food_bonus': 3,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#1E90FF',
        'description': 'Large body of water, rich in fish'
    },
    'ancient_ruins': {
        'name': 'Ancient Ruins',
        'crystal_bonus': 3,
        'gold_bonus': 2,
        'defense_bonus': 2,
        'movement_cost': 1,
        'color': '#9370DB',
        'description': 'Old civilization remnants with treasures'
    },
    'enchanted_forest': {
        'name': 'Enchanted Forest',
        'crystal_bonus': 2,
        'wood_bonus': 2,
        'defense_bonus': 2,
        'movement_cost': 2,
        'color': '#9400D3',
        'description': 'Magical woods with mystical energy'
    },
    'gold_mine': {
        'name': 'Gold Vein',
        'gold_bonus': 4,
        'defense_bonus': 0,
        'movement_cost': 2,
        'color': '#FFD700',
        'description': 'Rich gold deposit'
    },
    'crystal_field': {
        'name': 'Crystal Field',
        'crystal_bonus': 4,
        'defense_bonus': 0,
        'movement_cost': 2,
        'color': '#00CED1',
        'description': 'Natural crystal formation'
    },
    'iron_deposit': {
        'name': 'Iron Deposit',
        'iron_bonus': 4,
        'defense_bonus': 1,
        'movement_cost': 2,
        'color': '#708090',
        'description': 'Pure iron ore vein'
    },
    'meadow': {
        'name': 'Meadow',
        'food_bonus': 3,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#ADFF2F',
        'description': 'Beautiful flowering fields'
    },
    'tundra': {
        'name': 'Tundra',
        'defense_bonus': 1,
        'movement_cost': 2,
        'color': '#E0FFFF',
        'description': 'Frozen plains with sparse resources'
    },
    'jungle': {
        'name': 'Jungle',
        'food_bonus': 2,
        'wood_bonus': 2,
        'defense_bonus': 2,
        'movement_cost': 3,
        'color': '#006400',
        'description': 'Dense tropical forest'
    },
    'canyon': {
        'name': 'Canyon',
        'defense_bonus': 3,
        'stone_bonus': 2,
        'movement_cost': 3,
        'color': '#D2691E',
        'description': 'Deep ravine with natural fortification'
    },
    'oasis': {
        'name': 'Oasis',
        'food_bonus': 3,
        'gold_bonus': 1,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#00FA9A',
        'description': 'Life-giving water in the desert'
    },
    'cave_system': {
        'name': 'Cave System',
        'stone_bonus': 2,
        'crystal_bonus': 1,
        'defense_bonus': 3,
        'movement_cost': 2,
        'color': '#36454F',
        'description': 'Underground caverns'
    },
    'battlefield': {
        'name': 'Battlefield',
        'iron_bonus': 1,
        'soul_energy_bonus': 2,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#8B4513',
        'description': 'Ancient battle site with lingering energy'
    },
    'holy_ground': {
        'name': 'Holy Ground',
        'crystal_bonus': 2,
        'soul_energy_bonus': 3,
        'defense_bonus': 1,
        'movement_cost': 1,
        'color': '#FFE4B5',
        'description': 'Sacred land with divine presence'
    },
    'cursed_land': {
        'name': 'Cursed Land',
        'soul_energy_bonus': 4,
        'defense_bonus': -1,
        'movement_cost': 2,
        'color': '#483D8B',
        'description': 'Dark energy emanates from this place'
    },
    'quarry': {
        'name': 'Quarry',
        'stone_bonus': 4,
        'defense_bonus': 1,
        'movement_cost': 2,
        'color': '#A9A9A9',
        'description': 'Worked stone extraction site'
    },
    'farmland': {
        'name': 'Farmland',
        'food_bonus': 5,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#F0E68C',
        'description': 'Cultivated fields, maximum food production'
    },
    'steep_cliffs': {
        'name': 'Steep Cliffs',
        'defense_bonus': 4,
        'movement_cost': 4,
        'color': '#4B4B4B',
        'description': 'Nearly impassable rocky faces'
    },
    'trade_route': {
        'name': 'Trade Route',
        'gold_bonus': 3,
        'defense_bonus': 0,
        'movement_cost': 1,
        'color': '#DAA520',
        'description': 'Well-traveled merchant path'
    },
    'sacred_grove': {
        'name': 'Sacred Grove',
        'wood_bonus': 2,
        'crystal_bonus': 2,
        'soul_energy_bonus': 2,
        'defense_bonus': 1,
        'movement_cost': 2,
        'color': '#2E8B57',
        'description': 'Ancient trees with magical properties'
    },
    'wasteland': {
        'name': 'Wasteland',
        'defense_bonus': 0,
        'movement_cost': 2,
        'color': '#8B8680',
        'description': 'Desolate land devoid of life'
    }
}

# ==================== ENEMY TYPES ====================

ENEMY_TYPES = {
    'goblins': {
        'name': 'Goblin Camp',
        'description': 'A group of hostile goblins',
        'base_power': 10,
        'power_per_level': 5,
        'loot_multiplier': 1.0
    },
    'bandits': {
        'name': 'Bandit Hideout',
        'description': 'Dangerous bandits control this area',
        'base_power': 15,
        'power_per_level': 7,
        'loot_multiplier': 1.2
    },
    'wolves': {
        'name': 'Wolf Pack',
        'description': 'Wild wolves roam this territory',
        'base_power': 12,
        'power_per_level': 6,
        'loot_multiplier': 0.8
    },
    'orcs': {
        'name': 'Orc Warband',
        'description': 'Fierce orc warriors',
        'base_power': 25,
        'power_per_level': 10,
        'loot_multiplier': 1.5
    },
    'undead': {
        'name': 'Undead Legion',
        'description': 'Cursed undead creatures',
        'base_power': 20,
        'power_per_level': 8,
        'loot_multiplier': 1.3
    },
    'trolls': {
        'name': 'Troll Den',
        'description': 'Massive trolls defend this area',
        'base_power': 30,
        'power_per_level': 12,
        'loot_multiplier': 1.6
    },
    'dragons': {
        'name': 'Dragon Lair',
        'description': 'A powerful dragon guards this land',
        'base_power': 50,
        'power_per_level': 20,
        'loot_multiplier': 3.0
    },
    'elementals': {
        'name': 'Elemental Guardians',
        'description': 'Ancient elemental spirits',
        'base_power': 35,
        'power_per_level': 15,
        'loot_multiplier': 2.0
    },
    'demons': {
        'name': 'Demon Portal',
        'description': 'Demonic entities from another realm',
        'base_power': 40,
        'power_per_level': 18,
        'loot_multiplier': 2.5
    },
    'giants': {
        'name': 'Giant Camp',
        'description': 'Towering giants block your path',
        'base_power': 45,
        'power_per_level': 17,
        'loot_multiplier': 2.2
    },
}

# Trait distribution weights (higher = more common)
TERRAIN_WEIGHTS = {
    'plains': 20,
    'forest': 18,
    'hill': 15,
    'mountain': 10,
    'swamp': 8,
    'desert': 8,
    'river': 12,
    'meadow': 10,
    'farmland': 5,
    'fertile_land': 5,
    'lake': 6,
    'jungle': 7,
    'tundra': 5,
    'canyon': 4,
    'quarry': 4,
    'trade_route': 6,
    'oasis': 3,
    'cave_system': 4,
    'volcanic': 3,
    'enchanted_forest': 3,
    'ancient_ruins': 2,
    'gold_mine': 2,
    'crystal_field': 2,
    'iron_deposit': 3,
    'battlefield': 3,
    'holy_ground': 2,
    'cursed_land': 2,
    'sacred_grove': 2,
    'steep_cliffs': 3,
    'wasteland': 4,
}


class HexTile:
    """Represents a single hexagon tile on the world map"""
    
    def __init__(self, q: int, r: int, terrain_type: str):
        """
        Initialize a hex tile with axial coordinates
        q: column coordinate
        r: row coordinate
        terrain_type: key from TERRAIN_TRAITS
        """
        self.q = q
        self.r = r
        self.terrain_type = terrain_type
        self.occupied_by = None  # Can be 'player', 'enemy', or None
        
    @property
    def traits(self) -> Dict:
        """Get terrain traits for this tile"""
        return TERRAIN_TRAITS.get(self.terrain_type, {})
    
    def get_resource_bonuses(self) -> Dict[str, int]:
        """Get all resource bonuses from this tile"""
        traits = self.traits
        bonuses = {}
        
        for key, value in traits.items():
            if key.endswith('_bonus') and key != 'defense_bonus':
                resource_name = key.replace('_bonus', '')
                bonuses[resource_name] = value
                
        return bonuses
    
    def to_dict(self) -> Dict:
        """Convert tile to dictionary for API"""
        traits = self.traits
        return {
            'q': self.q,
            'r': self.r,
            'terrain_type': self.terrain_type,
            'terrain_name': traits.get('name', self.terrain_type),
            'color': traits.get('color', '#CCCCCC'),
            'defense_bonus': traits.get('defense_bonus', 0),
            'movement_cost': traits.get('movement_cost', 1),
            'resource_bonuses': self.get_resource_bonuses(),
            'description': traits.get('description', ''),
            'occupied_by': self.occupied_by,
        }


class WorldMap:
    """Manages the hexagonal world map"""
    
    def __init__(self, radius: int = 10):
        """
        Create a hexagonal map
        radius: number of hexes from center (radius 10 = ~300 tiles)
        """
        self.radius = radius
        self.tiles: Dict[Tuple[int, int], HexTile] = {}
        self.generate_map()
        
    def generate_map(self):
        """Generate all hex tiles in a hexagonal shape"""
        tiles_generated = 0
        
        # Generate hexagonal grid using axial coordinates
        for q in range(-self.radius, self.radius + 1):
            r1 = max(-self.radius, -q - self.radius)
            r2 = min(self.radius, -q + self.radius)
            
            for r in range(r1, r2 + 1):
                # Randomly select terrain based on weights
                terrain_type = self._random_terrain()
                tile = HexTile(q, r, terrain_type)
                self.tiles[(q, r)] = tile
                tiles_generated += 1
        
        print(f"Generated {tiles_generated} hex tiles")
        
    def _random_terrain(self) -> str:
        """Select random terrain type based on weights"""
        terrain_types = list(TERRAIN_WEIGHTS.keys())
        weights = list(TERRAIN_WEIGHTS.values())
        return random.choices(terrain_types, weights=weights, k=1)[0]
    
    def get_tile(self, q: int, r: int) -> HexTile:
        """Get tile at coordinates"""
        return self.tiles.get((q, r))
    
    def get_neighbors(self, q: int, r: int) -> List[HexTile]:
        """Get all neighboring tiles"""
        # Axial coordinate neighbors
        directions = [
            (1, 0), (1, -1), (0, -1),
            (-1, 0), (-1, 1), (0, 1)
        ]
        
        neighbors = []
        for dq, dr in directions:
            neighbor = self.get_tile(q + dq, r + dr)
            if neighbor:
                neighbors.append(neighbor)
                
        return neighbors
    
    def to_dict(self) -> Dict:
        """Convert entire map to dictionary for API"""
        return {
            'radius': self.radius,
            'tile_count': len(self.tiles),
            'tiles': [tile.to_dict() for tile in self.tiles.values()],
            'terrain_types': list(TERRAIN_TRAITS.keys()),
            'terrain_info': TERRAIN_TRAITS,
        }
    
    def get_tiles_in_range(self, center_q: int, center_r: int, range_radius: int) -> List[HexTile]:
        """Get all tiles within a certain range of a center tile"""
        tiles_in_range = []
        
        for q in range(center_q - range_radius, center_q + range_radius + 1):
            for r in range(center_r - range_radius, center_r + range_radius + 1):
                # Check if within hexagonal distance
                if abs(q - center_q) + abs(r - center_r) + abs((-q - r) - (-center_q - center_r)) <= range_radius * 2:
                    tile = self.get_tile(q, r)
                    if tile:
                        tiles_in_range.append(tile)
                        
        return tiles_in_range
