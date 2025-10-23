from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from config.database import init_db
from routes.auth import auth_bp
from routes.bills import bills_bp
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/grocery_bill_db')

# Initialize extensions
init_db(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(bills_bp, url_prefix='/api/bills')

@app.route('/')
def index():
    return {'message': 'Grocery Bill API is running'}

@app.route('/api/health')
def health_check():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)