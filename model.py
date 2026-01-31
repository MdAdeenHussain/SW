from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

db = SQLAlchemy()

class Admin(UserMixin, db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100),nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    gender = db.Column(db.String(20))

    password_hash = db.Column(db.String(200), nullable=False)

    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)

    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)

    def check_password(self, raw_password):
        return check_password_hash(self.password_hash, raw_password)

class User(UserMixin, db.Model):
    __tablename__="project_inquiries"
    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    company = db.Column(db.String(120))
    country_timezone = db.Column(db.String(100))

    # Project Details
    project_type = db.Column(db.Text)          # comma-separated
    project_goals = db.Column(db.Text)

    features = db.Column(db.Text)              # comma-separated

    timeline = db.Column(db.String(50))
    budget = db.Column(db.String(50))
    references = db.Column(db.Text)

    is_contacted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())