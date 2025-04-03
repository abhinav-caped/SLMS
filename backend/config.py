from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_CONFIG = {
    "USERNAME": "system",
    "PASSWORD": "Abhinav123",
    "HOST": "localhost",
    "PORT": "1521",
    "SERVICE_NAME": "orclpdb1"  
}

app.config['SQL_ALCHEMY_DATABASE_URI'] = f"oracle+cx_oracle://{DATABASE_CONFIG['USERNAME']}:{DATABASE_CONFIG['PASSWORD']}@{DATABASE_CONFIG['HOST']}:{DATABASE_CONFIG['PORT']}/?service_name={DATABASE_CONFIG['SERVICE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)