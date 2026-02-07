"""Migration script to add items table"""

from app import app
from models.db import db, Item

def migrate():
    with app.app_context():
        # Create items table if it doesn't exist
        db.create_all()
        print("Items table created successfully!")

if __name__ == '__main__':
    migrate()
