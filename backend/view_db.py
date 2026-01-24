#!/usr/bin/env python
"""Quick database viewer for Carondor"""
import sqlite3
import json
from datetime import datetime

DB_PATH = 'instance/carondor.db'

def view_database():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    print("=" * 80)
    print("CARONDOR DATABASE VIEWER")
    print("=" * 80)
    
    # Saved Games
    print("\n📝 SAVED GAMES:")
    print("-" * 80)
    cursor.execute("SELECT * FROM saved_games")
    games = cursor.fetchall()
    if games:
        for game in games:
            print(f"ID: {game['id']}")
            print(f"  Hero: {game['hero_name']} (Level {game['level']})")
            print(f"  Class: {game['hero_class']}, Race: {game['hero_race']}")
            print(f"  Created: {game['created_at']}")
            print(f"  Updated: {game['updated_at']}")
            print()
    else:
        print("  No saved games found.\n")
    
    # Resources
    print("\n💰 RESOURCES:")
    print("-" * 80)
    cursor.execute("""
        SELECT sg.hero_name, r.resource_type, r.amount 
        FROM resources r 
        JOIN saved_games sg ON r.game_id = sg.id
        ORDER BY sg.id, r.resource_type
    """)
    resources = cursor.fetchall()
    if resources:
        current_hero = None
        for res in resources:
            if res['hero_name'] != current_hero:
                current_hero = res['hero_name']
                print(f"\n  {current_hero}'s Resources:")
            print(f"    {res['resource_type']:15} {res['amount']:>10.1f}")
    else:
        print("  No resources found.\n")
    
    # Buildings
    print("\n\n🏗️ BUILDINGS:")
    print("-" * 80)
    cursor.execute("""
        SELECT sg.hero_name, b.building_type, b.level, b.built_at 
        FROM buildings b 
        JOIN saved_games sg ON b.game_id = sg.id
        ORDER BY sg.id, b.building_type
    """)
    buildings = cursor.fetchall()
    if buildings:
        current_hero = None
        for bld in buildings:
            if bld['hero_name'] != current_hero:
                current_hero = bld['hero_name']
                print(f"\n  {current_hero}'s Buildings:")
            print(f"    {bld['building_type']:20} Level {bld['level']} (built: {bld['built_at']})")
    else:
        print("  No buildings found.\n")
    
    # Units
    print("\n\n⚔️ ARMY UNITS:")
    print("-" * 80)
    cursor.execute("""
        SELECT sg.hero_name, u.unit_type, u.race, u.count, u.hired_at 
        FROM units u 
        JOIN saved_games sg ON u.game_id = sg.id
        ORDER BY sg.id, u.unit_type
    """)
    units = cursor.fetchall()
    if units:
        current_hero = None
        for unit in units:
            if unit['hero_name'] != current_hero:
                current_hero = unit['hero_name']
                print(f"\n  {current_hero}'s Army:")
            print(f"    {unit['count']:>4} × {unit['unit_type']:15} ({unit['race']}) - hired: {unit['hired_at']}")
    else:
        print("  No units recruited yet.\n")
    
    # Statistics
    print("\n\n📊 STATISTICS:")
    print("-" * 80)
    cursor.execute("SELECT COUNT(*) as count FROM saved_games")
    print(f"  Total Games: {cursor.fetchone()['count']}")
    
    cursor.execute("SELECT COUNT(*) as count FROM buildings")
    print(f"  Total Buildings: {cursor.fetchone()['count']}")
    
    cursor.execute("SELECT SUM(count) as count FROM units")
    total_units = cursor.fetchone()['count']
    print(f"  Total Units: {total_units if total_units else 0}")
    
    print("\n" + "=" * 80)
    
    conn.close()

if __name__ == '__main__':
    try:
        view_database()
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure the database exists at: instance/carondor.db")
        print("The database is created when you start the Flask app.")
