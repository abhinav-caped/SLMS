from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import oracledb

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'verysecretkey'
app.config['SQLALCHEMY_DATABASE_URI'] = 'oracle+cx_oracle://system:Abhinav123@localhost:1521/xe'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
