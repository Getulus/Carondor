"""Game management endpoints (save, load, town status)"""

from flask import Blueprint, request, jsonify
from models.db import db, SavedGame, Resource, Building, Unit, RESOURCES, BUILDINGS, UNITS
from datetime import datetime, timedelta

game_routes = Blueprint('game', __name__)


# ==================== SAVE/LOAD ====================

@game_routes.route('/save', methods=['POST'])
def save_game():
    """Save current game state"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['hero_name', 'hero_class', 'hero_race', 'resources', 'buildings', 'units']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create or update saved game
        game = SavedGame(
            hero_name=data['hero_name'],
            hero_class=data['hero_class'],
            hero_race=data['hero_race'],
            level=data.get('level', 1),
            experience=data.get('experience', 0),
        )
        
        # Add resources
        for resource_type, amount in data['resources'].items():
            if resource_type in RESOURCES:
                resource = Resource(resource_type=resource_type, amount=amount)
                game.resources.append(resource)
        
        # Add buildings
        for building_data in data['buildings']:
            building = Building(
                building_type=building_data['type'],
                level=building_data.get('level', 1)
            )
            game.buildings.append(building)
        
        # Add units
        for unit_data in data['units']:
            unit = Unit(
                unit_type=unit_data['type'],
                race=unit_data['race'],
                count=unit_data.get('count', 0)
            )
            game.units.append(unit)
        
        db.session.add(game)
        db.session.commit()
        
        return jsonify({
            'message': 'Game saved successfully',
            'game_id': game.id,
            'saved_at': game.updated_at.isoformat()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@game_routes.route('/load/<int:game_id>', methods=['GET'])
def load_game(game_id):
    """Load saved game"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        return jsonify(game.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@game_routes.route('/list', methods=['GET'])
def list_games():
    """List all saved games"""
    try:
        games = SavedGame.query.order_by(SavedGame.updated_at.desc()).all()
        return jsonify([{
            'id': g.id,
            'hero_name': g.hero_name,
            'hero_class': g.hero_class,
            'hero_race': g.hero_race,
            'level': g.level,
            'created_at': g.created_at.isoformat(),
            'updated_at': g.updated_at.isoformat(),
        } for g in games]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== TOWN STATUS ====================

@game_routes.route('/town/<int:game_id>', methods=['GET'])
def get_town_status(game_id):
    """Get current town status (resources, buildings, units)"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        return jsonify(game.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== RESOURCE MANAGEMENT ====================

@game_routes.route('/resource/<int:game_id>/<resource_type>', methods=['GET'])
def get_resource(game_id, resource_type):
    """Get specific resource amount"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        resource = Resource.query.filter_by(game_id=game_id, resource_type=resource_type).first()
        if not resource:
            return jsonify({
                'type': resource_type,
                'amount': 0,
                'name': RESOURCES.get(resource_type, resource_type)
            }), 200
        
        return jsonify(resource.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@game_routes.route('/resource/<int:game_id>/<resource_type>', methods=['POST'])
def update_resource(game_id, resource_type):
    """Add or remove resource"""
    try:
        if resource_type not in RESOURCES:
            return jsonify({'error': 'Invalid resource type'}), 400
        
        data = request.get_json()
        if 'amount' not in data:
            return jsonify({'error': 'Missing amount field'}), 400
        
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        resource = Resource.query.filter_by(game_id=game_id, resource_type=resource_type).first()
        if not resource:
            resource = Resource(game_id=game_id, resource_type=resource_type)
            db.session.add(resource)
        
        resource.amount = max(0, resource.amount + data['amount'])
        db.session.commit()
        
        return jsonify(resource.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@game_routes.route('/production/<int:game_id>', methods=['GET'])
def get_production_rates(game_id):
    """Get all production rates from buildings"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        production = {}
        for building in game.buildings:
            building_def = BUILDINGS.get(building.building_type, {})
            resource = building_def.get('resource')
            if resource:
                rate = building.get_production_rate()
                production[resource] = production.get(resource, 0) + rate
        
        return jsonify({
            'production_rates': production,  # resources per minute
            'calculated_at': datetime.utcnow().isoformat()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== BUILDING MANAGEMENT ====================

@game_routes.route('/building/<int:game_id>', methods=['GET'])
def get_buildings(game_id):
    """Get all buildings in town"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        return jsonify([b.to_dict() for b in game.buildings]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@game_routes.route('/building/<int:game_id>', methods=['POST'])
def create_building(game_id):
    """Create new building in town"""
    try:
        data = request.get_json()
        building_type = data.get('building_type')
        
        if not building_type or building_type not in BUILDINGS:
            return jsonify({'error': 'Invalid building type'}), 400
        
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        # Check if player has enough resources
        building_def = BUILDINGS[building_type]
        required_cost = building_def.get('base_cost', {})
        
        for resource_type, required_amount in required_cost.items():
            resource = Resource.query.filter_by(game_id=game_id, resource_type=resource_type).first()
            if not resource or resource.amount < required_amount:
                return jsonify({'error': f'Not enough {resource_type}'}), 400
        
        # Deduct resources
        for resource_type, required_amount in required_cost.items():
            resource = Resource.query.filter_by(game_id=game_id, resource_type=resource_type).first()
            resource.amount -= required_amount
        
        # Create building
        building = Building(game_id=game_id, building_type=building_type, level=1)
        db.session.add(building)
        db.session.commit()
        
        return jsonify({
            'message': 'Building created',
            'building': building.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@game_routes.route('/building/<int:building_id>/upgrade', methods=['POST'])
def upgrade_building(building_id):
    """Upgrade building to next level"""
    try:
        building = Building.query.get(building_id)
        if not building:
            return jsonify({'error': 'Building not found'}), 404
        
        game = building.game
        next_level_cost = building.get_build_cost()
        
        # Check if player has enough resources
        for resource_type, required_amount in next_level_cost.items():
            resource = Resource.query.filter_by(game_id=game.id, resource_type=resource_type).first()
            if not resource or resource.amount < required_amount:
                return jsonify({'error': f'Not enough {resource_type}'}), 400
        
        # Deduct resources
        for resource_type, required_amount in next_level_cost.items():
            resource = Resource.query.filter_by(game_id=game.id, resource_type=resource_type).first()
            resource.amount -= required_amount
        
        # Upgrade building
        building.level += 1
        db.session.commit()
        
        return jsonify({
            'message': 'Building upgraded',
            'building': building.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== UNIT MANAGEMENT ====================

@game_routes.route('/unit/<int:game_id>', methods=['GET'])
def get_units(game_id):
    """Get all units in town"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        return jsonify([u.to_dict() for u in game.units]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@game_routes.route('/unit/<int:game_id>/recruit', methods=['POST'])
def recruit_unit(game_id):
    """Recruit new units"""
    try:
        data = request.get_json()
        unit_type = data.get('unit_type')
        race = data.get('race')
        count = data.get('count', 1)
        
        if count <= 0:
            return jsonify({'error': 'Invalid unit count'}), 400
        
        if race not in UNITS or unit_type not in UNITS.get(race, {}):
            return jsonify({'error': 'Invalid unit or race'}), 400
        
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        # Check if barracks exists
        barracks = Building.query.filter_by(game_id=game_id, building_type='barracks').first()
        if not barracks:
            return jsonify({'error': 'No barracks in town'}), 400
        
        # Get unit cost and calculate total
        unit_def = UNITS[race][unit_type]
        unit_cost = unit_def.get('cost', {})
        total_cost = {k: v * count for k, v in unit_cost.items()}
        
        # Check if player has enough resources
        for resource_type, required_amount in total_cost.items():
            resource = Resource.query.filter_by(game_id=game_id, resource_type=resource_type).first()
            if not resource or resource.amount < required_amount:
                return jsonify({'error': f'Not enough {resource_type}'}), 400
        
        # Deduct resources
        for resource_type, required_amount in total_cost.items():
            resource = Resource.query.filter_by(game_id=game_id, resource_type=resource_type).first()
            resource.amount -= required_amount
        
        # Add or update units
        unit = Unit.query.filter_by(game_id=game_id, unit_type=unit_type, race=race).first()
        if unit:
            unit.count += count
        else:
            unit = Unit(game_id=game_id, unit_type=unit_type, race=race, count=count)
            db.session.add(unit)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Recruited {count} {unit_def.get("name")}',
            'unit': unit.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== BUILDING TEMPLATES ====================

@game_routes.route('/buildings/available', methods=['GET'])
def get_available_buildings():
    """Get list of all available building types"""
    try:
        buildings = []
        for building_type, building_data in BUILDINGS.items():
            buildings.append({
                'type': building_type,
                'name': building_data.get('name'),
                'description': building_data.get('description'),
                'resource': building_data.get('resource'),
                'base_cost': building_data.get('base_cost', {}),
                'production_per_minute': building_data.get('production_per_minute', 0),
            })
        return jsonify(buildings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== UNIT TEMPLATES ====================

@game_routes.route('/units/available/<race>', methods=['GET'])
def get_available_units(race):
    """Get available unit types for a race"""
    try:
        if race not in UNITS:
            return jsonify({'error': 'Invalid race'}), 400
        
        units = []
        for unit_type, unit_data in UNITS[race].items():
            units.append({
                'type': unit_type,
                'name': unit_data.get('name'),
                'description': unit_data.get('description'),
                'cost': unit_data.get('cost', {}),
                'attack': unit_data.get('attack', 0),
                'defense': unit_data.get('defense', 0),
                'hp': unit_data.get('hp', 0),
            })
        return jsonify(units), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
