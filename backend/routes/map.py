"""World map API endpoints"""

from flask import Blueprint, request, jsonify
from models.db import db, SavedGame, MapTile, Item, ITEM_TEMPLATES, ITEM_RARITIES
from models.world_map import WorldMap, TERRAIN_TRAITS, ENEMY_TYPES
import random

map_routes = Blueprint('map', __name__)


@map_routes.route('/generate/<int:game_id>', methods=['POST'])
def generate_world_map(game_id):
    """Generate a new world map for a game"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        # Delete existing map tiles if any
        MapTile.query.filter_by(game_id=game_id).delete()
        
        # Generate new map
        data = request.get_json() or {}
        radius = data.get('radius', 10)  # Default radius of 10 = ~300 tiles
        
        world_map = WorldMap(radius=radius)
        
        # Save tiles to database
        # Center tile (0,0) is owned by player (town location)
        tiles_to_add = []
        for tile in world_map.tiles.values():
            # Center tile is player's town
            if tile.q == 0 and tile.r == 0:
                occupied_by = 'player'
                explored = True
                enemy_type = None
                enemy_strength = 0
            else:
                # All other tiles are neutral with enemies
                occupied_by = 'neutral'
                # Adjacent tiles to center are initially explored (visible)
                distance = max(abs(tile.q), abs(tile.r), abs(-tile.q - tile.r))
                explored = (distance == 1)  # Only adjacent tiles are visible at start
                
                # Progressive difficulty: enemies get stronger with distance
                # Distance 1-2: Strength 1-2 (easy)
                # Distance 3-4: Strength 2-3 (medium)
                # Distance 5-6: Strength 3-4 (hard)
                # Distance 7+: Strength 4-5+ (very hard)
                base_strength = max(1, distance // 2)
                enemy_strength = base_strength + random.randint(0, min(2, distance // 3))
                enemy_strength = min(enemy_strength, 10)  # Cap at 10
                
                # Select enemy type based on strength
                if enemy_strength >= 8:
                    enemy_type = random.choice(['dragon', 'demon_lord', 'ancient_lich'])
                elif enemy_strength >= 6:
                    enemy_type = random.choice(['vampire', 'giant', 'demon_lord', 'dragon'])
                elif enemy_strength >= 4:
                    enemy_type = random.choice(['troll', 'orc_warlord', 'vampire', 'giant'])
                elif enemy_strength >= 2:
                    enemy_type = random.choice(['wolf_pack', 'bandit', 'troll', 'orc_warlord'])
                else:
                    enemy_type = random.choice(['goblin', 'wolf_pack', 'bandit'])
            
            map_tile = MapTile(
                game_id=game_id,
                q=tile.q,
                r=tile.r,
                terrain_type=tile.terrain_type,
                explored=explored,
                occupied_by=occupied_by,
                enemy_type=enemy_type,
                enemy_strength=enemy_strength
            )
            tiles_to_add.append(map_tile)
        
        # Add all tiles to session
        for map_tile in tiles_to_add:
            db.session.add(map_tile)
        
        db.session.commit()
        
        return jsonify({
            'message': 'World map generated successfully',
            'tile_count': len(world_map.tiles),
            'radius': radius
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@map_routes.route('/<int:game_id>', methods=['GET'])
def get_world_map(game_id):
    """Get the world map for a game"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        tiles = MapTile.query.filter_by(game_id=game_id).all()
        
        if not tiles:
            # Auto-generate map if it doesn't exist
            world_map = WorldMap(radius=10)
            for tile in world_map.tiles.values():
                # Center tile is player's town
                if tile.q == 0 and tile.r == 0:
                    occupied_by = 'player'
                    explored = True
                    enemy_type = None
                    enemy_strength = 0
                else:
                    # All other tiles are neutral with enemies
                    occupied_by = 'neutral'
                    explored = False
                    distance = max(abs(tile.q), abs(tile.r), abs(-tile.q - tile.r))
                    enemy_type = random.choice(list(ENEMY_TYPES.keys()))
                    enemy_strength = distance // 2 + random.randint(0, 2)
                
                map_tile = MapTile(
                    game_id=game_id,
                    q=tile.q,
                    r=tile.r,
                    terrain_type=tile.terrain_type,
                    explored=explored,
                    occupied_by=occupied_by,
                    enemy_type=enemy_type,
                    enemy_strength=enemy_strength
                )
                db.session.add(map_tile)
            
            db.session.commit()
            tiles = MapTile.query.filter_by(game_id=game_id).all()
        
        return jsonify({
            'game_id': game_id,
            'tile_count': len(tiles),
            'tiles': [tile.to_dict() for tile in tiles],
            'terrain_types': list(TERRAIN_TRAITS.keys()),
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@map_routes.route('/tile/<int:game_id>/<q>/<r>', methods=['GET'])
def get_tile(game_id, q, r):
    q = int(q)
    r = int(r)
    """Get a specific tile"""
    try:
        tile = MapTile.query.filter_by(game_id=game_id, q=q, r=r).first()
        
        if not tile:
            return jsonify({'error': 'Tile not found'}), 404
        
        return jsonify(tile.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@map_routes.route('/tile/<int:game_id>/<q>/<r>/occupy', methods=['POST'])
def occupy_tile(game_id, q, r):
    q = int(q)
    r = int(r)
    """Mark a tile as occupied by player or enemy"""
    try:
        data = request.get_json()
        occupied_by = data.get('occupied_by')  # 'player' or 'enemy'
        
        if occupied_by not in ['player', 'enemy', None]:
            return jsonify({'error': 'Invalid occupation type'}), 400
        
        tile = MapTile.query.filter_by(game_id=game_id, q=q, r=r).first()
        
        if not tile:
            return jsonify({'error': 'Tile not found'}), 404
        
        tile.occupied_by = occupied_by
        tile.explored = True
        db.session.commit()
        
        return jsonify({
            'message': 'Tile updated successfully',
            'tile': tile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@map_routes.route('/tile/<int:game_id>/<q>/<r>/explore', methods=['POST'])
def explore_tile(game_id, q, r):
    q = int(q)
    r = int(r)
    """Mark a tile as explored"""
    try:
        tile = MapTile.query.filter_by(game_id=game_id, q=q, r=r).first()
        
        if not tile:
            return jsonify({'error': 'Tile not found'}), 404
        
        tile.explored = True
        db.session.commit()
        
        return jsonify({
            'message': 'Tile explored',
            'tile': tile.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@map_routes.route('/neighbors/<int:game_id>/<q>/<r>', methods=['GET'])
def get_neighbors(game_id, q, r):
    q = int(q)
    r = int(r)
    """Get all neighboring tiles"""
    try:
        # Axial coordinate neighbors
        directions = [
            (1, 0), (1, -1), (0, -1),
            (-1, 0), (-1, 1), (0, 1)
        ]
        
        neighbors = []
        for dq, dr in directions:
            neighbor = MapTile.query.filter_by(
                game_id=game_id, 
                q=q + dq, 
                r=r + dr
            ).first()
            
            if neighbor:
                neighbors.append(neighbor.to_dict())
        
        return jsonify({
            'tile': {'q': q, 'r': r},
            'neighbors': neighbors
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@map_routes.route('/terrain-info', methods=['GET'])
def get_terrain_info():
    """Get information about all terrain types"""
    return jsonify({
        'terrain_types': TERRAIN_TRAITS
    }), 200


@map_routes.route('/attack/<int:game_id>/<q>/<r>', methods=['POST'])
def attack_tile(game_id, q, r):
    q = int(q)
    r = int(r)
    """Attack and attempt to conquer a neutral tile"""
    try:
        data = request.get_json() or {}
        player_power = data.get('player_power', 0)
        
        # Get the tile to attack
        tile = MapTile.query.filter_by(game_id=game_id, q=q, r=r).first()
        if not tile:
            return jsonify({'error': 'Tile not found'}), 404
        
        # Check if tile is already owned by player
        if tile.occupied_by == 'player':
            return jsonify({'error': 'You already own this tile'}), 400
        
        # Check if tile is neutral (has enemies)
        if tile.occupied_by != 'neutral':
            return jsonify({'error': 'This tile cannot be attacked'}), 400
        
        # Check if tile is adjacent to any player-owned tile
        directions = [
            (1, 0), (1, -1), (0, -1),
            (-1, 0), (-1, 1), (0, 1)
        ]
        
        adjacent_to_player = False
        for dq, dr in directions:
            neighbor = MapTile.query.filter_by(
                game_id=game_id, 
                q=q + dq, 
                r=r + dr
            ).first()
            if neighbor and neighbor.occupied_by == 'player':
                adjacent_to_player = True
                break
        
        if not adjacent_to_player:
            return jsonify({'error': 'You can only attack tiles adjacent to your territory'}), 400
        
        # Calculate enemy power
        enemy_info = ENEMY_TYPES.get(tile.enemy_type, {})
        enemy_power = enemy_info.get('base_power', 0) + (tile.enemy_strength * enemy_info.get('power_per_level', 0))
        
        # Determine battle outcome
        success = player_power >= enemy_power
        
        if success:
            # Get the game for XP gain
            game = SavedGame.query.get(game_id)
            
            # Grant XP based on enemy power and tile strength (before clearing tile data)
            xp_gained = int(enemy_power * 0.5 + tile.enemy_strength * 10)
            levels_gained = game.add_experience(xp_gained)
            
            # Store enemy_strength before clearing it for item drops
            original_enemy_strength = tile.enemy_strength
            
            # Conquer the tile
            tile.occupied_by = 'player'
            tile.explored = True
            tile.enemy_type = None
            tile.enemy_strength = 0
            
            # Reveal adjacent tiles (fog of war mechanic)
            # Hexagonal neighbors offsets
            neighbor_offsets = [
                (1, 0), (1, -1), (0, -1), 
                (-1, 0), (-1, 1), (0, 1)
            ]
            
            for dq, dr in neighbor_offsets:
                neighbor_q = q + dq
                neighbor_r = r + dr
                neighbor_tile = MapTile.query.filter_by(
                    game_id=game_id, 
                    q=neighbor_q, 
                    r=neighbor_r
                ).first()
                
                # Make adjacent tiles visible (explored but not conquered)
                if neighbor_tile and not neighbor_tile.explored:
                    neighbor_tile.explored = True
            
            # Calculate loot/rewards
            loot_multiplier = enemy_info.get('loot_multiplier', 1.0)
            base_gold = int(enemy_power * 2 * loot_multiplier)
            base_resources = int(enemy_power * 0.5 * loot_multiplier)
            
            rewards = {
                'gold': base_gold,
                'wood': base_resources,
                'food': base_resources,
            }
            
            # Determine item drop
            dropped_item = None
            drop_chance = min(0.3 + (enemy_power / 1000), 0.7)  # 30-70% based on enemy power
            
            if random.random() < drop_chance:
                # Select rarity based on enemy strength
                rarity_chances = []
                if original_enemy_strength >= 5:
                    rarity_chances = ['common', 'uncommon', 'rare', 'epic', 'legendary']
                    weights = [0.35, 0.30, 0.20, 0.10, 0.05]
                elif original_enemy_strength >= 4:
                    rarity_chances = ['common', 'uncommon', 'rare', 'epic']
                    weights = [0.40, 0.35, 0.20, 0.05]
                elif original_enemy_strength >= 3:
                    rarity_chances = ['common', 'uncommon', 'rare']
                    weights = [0.50, 0.35, 0.15]
                elif original_enemy_strength >= 2:
                    rarity_chances = ['common', 'uncommon']
                    weights = [0.70, 0.30]
                else:
                    rarity_chances = ['common']
                    weights = [1.0]
                
                rarity = random.choices(rarity_chances, weights=weights)[0]
                
                # Select random item template
                template_key = random.choice(list(ITEM_TEMPLATES.keys()))
                
                # Create the item
                new_item = Item(
                    game_id=game_id,
                    item_template=template_key,
                    rarity=rarity,
                    equipped=False
                )
                db.session.add(new_item)
                dropped_item = new_item.to_dict()
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Victory! Tile conquered.',
                'tile': tile.to_dict(),
                'rewards': rewards,
                'xp_gained': xp_gained,
                'levels_gained': levels_gained,
                'hero_level': game.level,
                'hero_xp': game.experience,
                'hero_xp_needed': game.get_xp_needed_for_next_level(),
                'player_power': player_power,
                'enemy_power': enemy_power,
                'dropped_item': dropped_item
            }), 200
        else:
            # Failed to conquer
            return jsonify({
                'success': False,
                'message': 'Defeat! Your forces were not strong enough.',
                'player_power': player_power,
                'enemy_power': enemy_power,
                'power_needed': enemy_power - player_power
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
