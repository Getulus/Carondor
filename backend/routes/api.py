"""API routes for the game"""

from flask import Blueprint, jsonify, request
from models.classes import CLASSES, ClassType
from models.races import RACES, RaceType
from models.hero import Hero
from routes.game import game_routes

api = Blueprint('api', __name__, url_prefix='/api')

# Register game routes with /game prefix
api.register_blueprint(game_routes, url_prefix='/game')


@api.route('/classes', methods=['GET'])
def get_classes():
    """Get all available character classes"""
    return jsonify({
        "classes": [
            {
                "id": class_type.value,
                "name": game_class.name,
                **game_class.to_dict()
            }
            for class_type, game_class in CLASSES.items()
        ]
    })


@api.route('/races', methods=['GET'])
def get_races():
    """Get all available character races"""
    return jsonify({
        "races": [
            {
                "id": race_type.value,
                "name": race.name,
                **race.to_dict()
            }
            for race_type, race in RACES.items()
        ]
    })


@api.route('/hero/create', methods=['POST'])
def create_hero():
    """Create a new hero with given class and race"""
    try:
        data = request.get_json()
        hero_name = data.get('name')
        class_name = data.get('class')
        race_name = data.get('race')

        if not all([hero_name, class_name, race_name]):
            return jsonify({"error": "Missing required fields"}), 400

        # Find the class and race
        game_class = None
        race = None

        for class_type, cls in CLASSES.items():
            if cls.name == class_name:
                game_class = cls
                break

        for race_type, r in RACES.items():
            if r.name == race_name:
                race = r
                break

        if not game_class or not race:
            return jsonify({"error": "Invalid class or race"}), 400

        # Create hero
        hero = Hero(name=hero_name, game_class=game_class, race=race)

        return jsonify({
            "success": True,
            "hero": hero.to_dict()
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok"})
