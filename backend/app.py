"""Main Flask application"""

from flask import Flask
from flask_cors import CORS
from routes.api import api
from models.db import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///carondor.db'
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
