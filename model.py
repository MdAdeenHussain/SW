from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from slugify import slugify
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

    selected_plan = db.Column(db.String(100))
    addons = db.Column(db.Text)
    
    timeline = db.Column(db.String(50))
    budget = db.Column(db.String(50))
    references = db.Column(db.Text)

    is_contacted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)

    admin_email = db.Column(db.String(120), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    ip_address = db.Column(db.String(45))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

blog_tags = db.Table('blog_tags',
    db.Column('blog_id', db.Integer, db.ForeignKey('blogs.id')),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'))
    )

class Blog(db.Model):
    __tablename__ = "blogs"

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)

    short_description = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)

    image_url = db.Column(db.String(500), nullable=True)
    # 🔥 FOREIGN KEY MUST MATCH TABLENAME
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id"),
        nullable=True
    )

    # 🔥 RELATIONSHIP (DEFINE HERE)
    category = db.relationship(
        "Category",
        backref=db.backref("blogs", lazy=True)
    )

    # 🔥 MANY TO MANY TAGS
    tags = db.relationship(
        "Tag",
        secondary=blog_tags,
        backref=db.backref("blogs", lazy="dynamic")
    )
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def generate_slug(self):
        self.slug = slugify(self.title)

    def reading_time(self):
        words = len(self.content.split())
        return max(1, words // 200)

class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
