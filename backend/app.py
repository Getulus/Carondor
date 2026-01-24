"""Main Flask application"""

from flask import Flask
from flask_cors import CORS
from routes.api import api

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(api)


@app.route('/')
def index():
    return {"message": "Carondor Game Backend API"}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
