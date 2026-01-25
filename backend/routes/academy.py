"""Academy and talent system endpoints"""

from flask import Blueprint, request, jsonify
from models.db import db, SavedGame, Talent, Building, Resource, TALENT_TREE

academy_routes = Blueprint('academy', __name__)


@academy_routes.route('/<int:game_id>/talents', methods=['GET'])
def get_talents(game_id):
    """Get all talents for a game"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        # Check if Academy is built
        academy = Building.query.filter_by(
            game_id=game_id,
            building_type='academy'
        ).first()
        
        if not academy:
            return jsonify({'error': 'Academy not built'}), 403
        
        # Get all invested talents
        talents = Talent.query.filter_by(game_id=game_id).all()
        
        # Calculate available talent points
        talent_points_used = sum(t.level * t.get_talent_info().get('cost_per_level', 1) for t in talents)
        talent_points_available = game.level * 2  # 2 points per level
        
        return jsonify({
            'talents': [t.to_dict() for t in talents],
            'available_talents': [
                {
                    'talent_id': tid,
                    'name': info['name'],
                    'category': info['category'],
                    'max_level': info['max_level'],
                    'cost_per_level': info['cost_per_level'],
                    'description': info['description'],
                    'bonus': info['bonus'],
                }
                for tid, info in TALENT_TREE.items()
            ],
            'talent_points_total': talent_points_available,
            'talent_points_used': talent_points_used,
            'talent_points_remaining': talent_points_available - talent_points_used,
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@academy_routes.route('/<int:game_id>/talents/<string:talent_id>/invest', methods=['POST'])
def invest_talent(game_id, talent_id):
    """Invest a talent point"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        # Check if Academy is built
        academy = Building.query.filter_by(
            game_id=game_id,
            building_type='academy'
        ).first()
        
        if not academy:
            return jsonify({'error': 'Academy not built. Build an Academy first!'}), 403
        
        # Validate talent exists
        if talent_id not in TALENT_TREE:
            return jsonify({'error': 'Invalid talent'}), 400
        
        talent_info = TALENT_TREE[talent_id]
        
        # Get or create talent
        talent = Talent.query.filter_by(game_id=game_id, talent_id=talent_id).first()
        if not talent:
            talent = Talent(game_id=game_id, talent_id=talent_id, level=0)
            db.session.add(talent)
        
        # Check if can level up
        if talent.level >= talent_info['max_level']:
            return jsonify({'error': 'Talent already at max level'}), 400
        
        # Calculate talent points
        all_talents = Talent.query.filter_by(game_id=game_id).all()
        talent_points_used = sum(
            t.level * t.get_talent_info().get('cost_per_level', 1) 
            for t in all_talents
        )
        talent_points_available = game.level * 2
        cost = talent_info['cost_per_level']
        
        if talent_points_used + cost > talent_points_available:
            return jsonify({
                'error': f'Not enough talent points. Need {cost}, have {talent_points_available - talent_points_used}'
            }), 400
        
        # Invest talent point
        talent.level += 1
        db.session.commit()
        
        return jsonify({
            'message': f'Invested in {talent_info["name"]}',
            'talent': talent.to_dict(),
            'talent_points_remaining': talent_points_available - talent_points_used - cost,
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@academy_routes.route('/<int:game_id>/talents/<string:talent_id>/refund', methods=['POST'])
def refund_talent(game_id, talent_id):
    """Refund a talent point (costs gold)"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        talent = Talent.query.filter_by(game_id=game_id, talent_id=talent_id).first()
        if not talent or talent.level == 0:
            return jsonify({'error': 'Talent not invested'}), 400
        
        # Refund costs gold
        refund_cost = talent.get_talent_info().get('cost_per_level', 1) * 100
        gold_resource = Resource.query.filter_by(
            game_id=game_id,
            resource_type='gold'
        ).first()
        
        if not gold_resource or gold_resource.amount < refund_cost:
            return jsonify({'error': f'Not enough gold. Need {refund_cost} gold to refund'}), 400
        
        # Deduct gold and refund talent point
        gold_resource.amount -= refund_cost
        talent.level -= 1
        
        if talent.level == 0:
            db.session.delete(talent)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Refunded talent point for {refund_cost} gold',
            'talent': talent.to_dict() if talent.level > 0 else None,
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@academy_routes.route('/<int:game_id>/bonuses', methods=['GET'])
def get_active_bonuses(game_id):
    """Get all active bonuses from talents and special buildings"""
    try:
        game = SavedGame.query.get(game_id)
        if not game:
            return jsonify({'error': 'Game not found'}), 404
        
        bonuses = {
            'resource_multipliers': {},
            'unit_bonuses': {},
            'special_effects': []
        }
        
        # Get talent bonuses
        talents = Talent.query.filter_by(game_id=game_id).all()
        for talent in talents:
            current_bonus = talent.get_current_bonus()
            for key, value in current_bonus.items():
                if key.endswith('_multiplier'):
                    resource = key.replace('_multiplier', '')
                    bonuses['resource_multipliers'][resource] = bonuses['resource_multipliers'].get(resource, 0) + value
                elif key.startswith('unit_'):
                    bonuses['unit_bonuses'][key] = bonuses['unit_bonuses'].get(key, 0) + value
                else:
                    bonuses['special_effects'].append({
                        'source': talent.get_talent_info()['name'],
                        'effect': key,
                        'value': value
                    })
        
        # Get special building bonuses
        from models.db import BUILDINGS
        buildings = Building.query.filter_by(game_id=game_id).all()
        for building in buildings:
            building_info = BUILDINGS.get(building.building_type, {})
            if 'bonus' in building_info:
                for key, value in building_info['bonus'].items():
                    if key.endswith('_multiplier'):
                        resource = key.replace('_multiplier', '')
                        bonuses['resource_multipliers'][resource] = bonuses['resource_multipliers'].get(resource, 0) + (value - 1)
                    elif key.startswith('unit_'):
                        bonuses['unit_bonuses'][key] = bonuses['unit_bonuses'].get(key, 0) + value
                    else:
                        bonuses['special_effects'].append({
                            'source': building_info['name'],
                            'effect': key,
                            'value': value
                        })
        
        return jsonify(bonuses), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
