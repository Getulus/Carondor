"""Main Flask application"""

import os
from flask import Flask
from flask_cors import CORS
from routes.api import api
from models.db import db
from dotenv import load_dotenv

app = Flask(__name__)

# Load environment variables (supports .env files)
load_dotenv()

# Ensure instance folder exists and configure database URI
os.makedirs(app.instance_path, exist_ok=True)

# Prefer DATABASE_URL/POSTGRES_URL if provided; else fallback to SQLite in instance/
db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
if db_url:
    # Normalize Heroku-style URLs
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    # Use Postgres when provided; do not silently fall back
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
else:
    # Fallback only when no DB URL is provided
    db_path = os.path.join(app.instance_path, 'carondor.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

# Register blueprints
app.register_blueprint(api)


@app.route('/')
def index():
    return {"message": "Carondor Game Backend API"}


# Create database tables
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
