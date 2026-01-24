#!/usr/bin/env python
"""Migrate data from local SQLite (instance/carondor.db) to the active SQLAlchemy database.

Usage:
  Ensure DATABASE_URL points to your Postgres. Then run:
    python migrate_sqlite_to_postgres.py

This script preserves existing IDs and syncs Postgres sequences.
"""
import sqlite3
from datetime import datetime

from app import app
from models.db import db, SavedGame, Resource, Building, Unit

SQLITE_DB_PATH = 'instance/carondor.db'


def parse_dt(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return datetime.fromisoformat(str(val))
    except Exception:
        return None


def migrate():
    with app.app_context():
        # Ensure tables exist in target DB
        db.create_all()

        # Connect to source SQLite
        con = sqlite3.connect(SQLITE_DB_PATH)
        con.row_factory = sqlite3.Row
        cur = con.cursor()

        # Read source data
        cur.execute('SELECT * FROM saved_games')
        saved_games = cur.fetchall()

        cur.execute('SELECT * FROM resources')
        resources = cur.fetchall()

        cur.execute('SELECT * FROM buildings')
        buildings = cur.fetchall()

        cur.execute('SELECT * FROM units')
        units = cur.fetchall()

        # Insert into target DB preserving IDs
        # Saved games
        for g in saved_games:
            obj = SavedGame(
                id=g['id'],
                hero_name=g['hero_name'],
                hero_class=g['hero_class'],
                hero_race=g['hero_race'],
                level=g['level'],
                experience=g['experience'],
                created_at=parse_dt(g['created_at']) or datetime.utcnow(),
                updated_at=parse_dt(g['updated_at']) or datetime.utcnow(),
            )
            db.session.merge(obj)

        # Resources
        for r in resources:
            obj = Resource(
                id=r['id'],
                game_id=r['game_id'],
                resource_type=r['resource_type'],
                amount=r['amount'],
            )
            db.session.merge(obj)

        # Buildings
        for b in buildings:
            obj = Building(
                id=b['id'],
                game_id=b['game_id'],
                building_type=b['building_type'],
                level=b['level'],
                built_at=parse_dt(b['built_at']) or datetime.utcnow(),
            )
            db.session.merge(obj)

        # Units
        for u in units:
            obj = Unit(
                id=u['id'],
                game_id=u['game_id'],
                unit_type=u['unit_type'],
                race=u['race'],
                count=u['count'],
                hired_at=parse_dt(u['hired_at']) or datetime.utcnow(),
            )
            db.session.merge(obj)

        db.session.commit()

        # Sync sequences in Postgres (no-op on SQLite)
        try:
            for table, col in [
                ('saved_games', 'id'),
                ('resources', 'id'),
                ('buildings', 'id'),
                ('units', 'id'),
            ]:
                db.session.execute(
                    db.text(
                        "SELECT setval(pg_get_serial_sequence(:t, :c), COALESCE((SELECT MAX(id) FROM "
                        + table
                        + "), 1))"
                    ),
                    {"t": table, "c": col},
                )
            db.session.commit()
        except Exception:
            # Likely not Postgres; ignore
            pass

        con.close()
        print('Migration complete.')


if __name__ == '__main__':
    migrate()
