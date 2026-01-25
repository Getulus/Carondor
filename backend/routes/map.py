"""World map API endpoints"""

from flask import Blueprint, request, jsonify
from models.db import db, SavedGame, MapTile
from models.world_map import WorldMap, TERRAIN_TRAITS

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
        for tile in world_map.tiles.values():
            map_tile = MapTile(
                game_id=game_id,
                q=tile.q,
                r=tile.r,
                terrain_type=tile.terrain_type,
                explored=False
            )
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
                map_tile = MapTile(
                    game_id=game_id,
                    q=tile.q,
                    r=tile.r,
                    terrain_type=tile.terrain_type,
                    explored=False
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


@map_routes.route('/tile/<int:game_id>/<int:q>/<int:r>', methods=['GET'])
def get_tile(game_id, q, r):
    """Get a specific tile"""
    try:
        tile = MapTile.query.filter_by(game_id=game_id, q=q, r=r).first()
        
        if not tile:
            return jsonify({'error': 'Tile not found'}), 404
        
        return jsonify(tile.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@map_routes.route('/tile/<int:game_id>/<int:q>/<int:r>/occupy', methods=['POST'])
def occupy_tile(game_id, q, r):
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


@map_routes.route('/tile/<int:game_id>/<int:q>/<int:r>/explore', methods=['POST'])
def explore_tile(game_id, q, r):
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


@map_routes.route('/neighbors/<int:game_id>/<int:q>/<int:r>', methods=['GET'])
def get_neighbors(game_id, q, r):
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
