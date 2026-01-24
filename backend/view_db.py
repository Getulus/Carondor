#!/usr/bin/env python
"""Quick database viewer for Carondor (SQLAlchemy backend-agnostic)"""
from pprint import pprint
from contextlib import contextmanager

from app import app
from models.db import db, SavedGame, Resource, Building, Unit


@contextmanager
def ctx():
    with app.app_context():
        yield


def view_database():
    print("=" * 80)
    print("CARONDOR DATABASE VIEWER")
    print("=" * 80)

    with ctx():
        # Saved Games
        print("\n📝 SAVED GAMES:")
        print("-" * 80)
        games = SavedGame.query.order_by(SavedGame.id).all()
        if games:
            for g in games:
                print(f"ID: {g.id}")
                print(f"  Hero: {g.hero_name} (Level {g.level})")
                print(f"  Class: {g.hero_class}, Race: {g.hero_race}")
                print(f"  Created: {g.created_at}")
                print(f"  Updated: {g.updated_at}")
                print()
        else:
            print("  No saved games found.\n")

        # Resources
        print("\n💰 RESOURCES:")
        print("-" * 80)
        res_rows = (
            db.session.query(SavedGame.hero_name, Resource.resource_type, Resource.amount)
            .join(Resource, Resource.game_id == SavedGame.id)
            .order_by(SavedGame.id, Resource.resource_type)
            .all()
        )
        if res_rows:
            current_hero = None
            for hero_name, rtype, amount in res_rows:
                if hero_name != current_hero:
                    current_hero = hero_name
                    print(f"\n  {current_hero}'s Resources:")
                print(f"    {rtype:15} {amount:>10.1f}")
        else:
            print("  No resources found.\n")

        # Buildings
        print("\n\n🏗️ BUILDINGS:")
        print("-" * 80)
        bld_rows = (
            db.session.query(SavedGame.hero_name, Building.building_type, Building.level, Building.built_at)
            .join(Building, Building.game_id == SavedGame.id)
            .order_by(SavedGame.id, Building.building_type)
            .all()
        )
        if bld_rows:
            current_hero = None
            for hero_name, btype, level, built_at in bld_rows:
                if hero_name != current_hero:
                    current_hero = hero_name
                    print(f"\n  {current_hero}'s Buildings:")
                print(f"    {btype:20} Level {level} (built: {built_at})")
        else:
            print("  No buildings found.\n")

        # Units
        print("\n\n⚔️ ARMY UNITS:")
        print("-" * 80)
        unit_rows = (
            db.session.query(SavedGame.hero_name, Unit.unit_type, Unit.race, Unit.count, Unit.hired_at)
            .join(Unit, Unit.game_id == SavedGame.id)
            .order_by(SavedGame.id, Unit.unit_type)
            .all()
        )
        if unit_rows:
            current_hero = None
            for hero_name, utype, race, count, hired_at in unit_rows:
                if hero_name != current_hero:
                    current_hero = hero_name
                    print(f"\n  {current_hero}'s Army:")
                print(f"    {count:>4} × {utype:15} ({race}) - hired: {hired_at}")
        else:
            print("  No units recruited yet.\n")

        # Statistics
        print("\n\n📊 STATISTICS:")
        print("-" * 80)
        total_games = db.session.query(db.func.count(SavedGame.id)).scalar() or 0
        print(f"  Total Games: {total_games}")
        total_buildings = db.session.query(db.func.count(Building.id)).scalar() or 0
        print(f"  Total Buildings: {total_buildings}")
        total_units = db.session.query(db.func.coalesce(db.func.sum(Unit.count), 0)).scalar() or 0
        print(f"  Total Units: {total_units}")

        print("\n" + "=" * 80)


if __name__ == '__main__':
    try:
        view_database()
    except Exception as e:
        print(f"Error: {e}")
        print("\nEnsure the Flask app can start (tables are created on boot).")
        print("If using PostgreSQL, set DATABASE_URL or POSTGRES_URL.")
