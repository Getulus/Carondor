"""Add enemy columns to map_tiles table"""

from app import app
from models.db import db
from sqlalchemy import text

with app.app_context():
    # Check if we're using SQLite or PostgreSQL
    db_url = app.config['SQLALCHEMY_DATABASE_URI']
    is_sqlite = 'sqlite' in db_url
    
    # Add new columns to map_tiles if they don't exist
    with db.engine.connect() as conn:
        if is_sqlite:
            # SQLite: Check columns using pragma
            result = conn.execute(text("PRAGMA table_info(map_tiles)"))
            existing_columns = [row[1] for row in result]
            
            # SQLite doesn't support ADD COLUMN IF NOT EXISTS easily,
            # so we check first
            if 'enemy_type' not in existing_columns:
                conn.execute(text("ALTER TABLE map_tiles ADD COLUMN enemy_type VARCHAR(50)"))
                conn.commit()
                print("Added enemy_type column")
            else:
                print("enemy_type column already exists")
            
            if 'enemy_strength' not in existing_columns:
                conn.execute(text("ALTER TABLE map_tiles ADD COLUMN enemy_strength INTEGER DEFAULT 0"))
                conn.commit()
                print("Added enemy_strength column")
            else:
                print("enemy_strength column already exists")
        else:
            # PostgreSQL: Use information_schema
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='map_tiles' AND column_name IN ('enemy_type', 'enemy_strength')
            """))
            
            existing_columns = [row[0] for row in result]
            
            if 'enemy_type' not in existing_columns:
                conn.execute(text("ALTER TABLE map_tiles ADD COLUMN enemy_type VARCHAR(50)"))
                conn.commit()
                print("Added enemy_type column")
            else:
                print("enemy_type column already exists")
            
            if 'enemy_strength' not in existing_columns:
                conn.execute(text("ALTER TABLE map_tiles ADD COLUMN enemy_strength INTEGER DEFAULT 0"))
                conn.commit()
                print("Added enemy_strength column")
            else:
                print("enemy_strength column already exists")
        
        # Update existing neutral tiles to have enemies
        conn.execute(text("""
            UPDATE map_tiles 
            SET occupied_by = 'neutral',
                enemy_type = 'goblins',
                enemy_strength = 1
            WHERE occupied_by IS NULL OR occupied_by = 'enemy'
        """))
        conn.commit()
        print("Updated existing neutral tiles with enemies")
        
        # Ensure center tile (0,0) is player owned
        conn.execute(text("""
            UPDATE map_tiles 
            SET occupied_by = 'player',
                explored = 1,
                enemy_type = NULL,
                enemy_strength = 0
            WHERE q = 0 AND r = 0
        """))
        conn.commit()
        print("Set center tile as player-owned")
    
    print("Migration completed successfully!")

