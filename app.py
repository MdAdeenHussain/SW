from flask import Flask, render_template, request, redirect, flash, request, url_for, session, current_app, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, case
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask.cli import with_appcontext
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import click

from model import db, Admin, User

app = Flask(__name__)
# 🔐 Secret key (required for sessions & login)
app.config["SECRET_KEY"] = "dev-secret-key"

# 🗄 Database config
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


db.init_app(app)

# ---------- LOGIN MANAGER SETUP ----------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "admin_login"

@login_manager.user_loader
def load_user(admin_id):
    return Admin.query.get(int(admin_id))

# ✅ Create tables
with app.app_context():
    db.create_all()

# ---------- HOME ROUTE ----------
@app.route("/")
def home():
    return render_template("home.html")

# ---------- INQUIRY FORM ROUTE ----------
@app.route("/inquiry", methods=["GET", "POST"])
def inquiry():
    if request.method == "POST":
        user = User(
            full_name=request.form.get("full_name"),
            email=request.form.get("email"),
            phone=request.form.get("phone"),
            company=request.form.get("company"),
            country_timezone=request.form.get("country_timezone"),

            project_type=", ".join(request.form.getlist("project_type")),
            project_goals=request.form.get("project_goals"),
            features=", ".join(request.form.getlist("features")),

            timeline=request.form.get("timeline"),
            budget=request.form.get("budget"),
            references=request.form.get("references")
        )

        db.session.add(user)
        db.session.commit()

        return redirect(url_for("inquiry"))

    return render_template("user/inquiry.html")

# ================================
#   ADMIN ROUTES
# ================================

def create_admin():
    with app.app_context():
        # check if admin already exists
        admin = Admin.query.filter_by(email=ADMIN_EMAIL).first()

        if not admin:
            admin = Admin(
                name="Md. Adeen Hussain",
                email=ADMIN_EMAIL,
                phone="9674667587",
                gender="Male",
                password_hash=generate_password_hash(ADMIN_PASSWORD),
                email_verified=True,
                phone_verified=True,
                is_admin=True
            )

            db.session.add(admin)
            db.session.commit()

            print("✅ Admin user created")
        else:
             # sync password from env (safe)
            admin.password_hash = generate_password_hash(ADMIN_PASSWORD)
            db.session.commit()
            print("ℹ️ Admin already exists")

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect("/admin/login")
        if not current_user.is_admin:
            return redirect("/")
        return f(*args, **kwargs)
    return decorated

# ---------- ADMIN LOGIN ----------
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        admin = Admin.query.filter_by(email=email).first()

        if admin and admin.check_password(password):
            login_user(admin)
            return redirect(url_for("admin_dashboard"))
        else:
            flash("Invalid email or password", "error")

    return render_template("admin/login.html")

# ---------- ADMIN CHANGE CREDENTIAL ----------
@app.route("/admin/change-credentials", methods=["GET", "POST"])
@login_required
def change_admin_credentials():
    if not current_user.is_admin:
        return redirect("/")

    if request.method == "POST":
        new_email = request.form.get("email")
        new_password = request.form.get("password")

        if new_email:
            current_user.email = new_email

        if new_password:
            current_user.password_hash = generate_password_hash(new_password)

        db.session.commit()
        logout_user()
        flash("Credentials updated. Please login again.", "success")
        return redirect(url_for("admin_login"))

    return render_template("admin/change_credentials.html")

# ---------- ADMIN DASHBOARD ----------
@app.route("/admin/dashboard")
@login_required
def admin_dashboard():
    inquiries_count = User.query.count()
    return render_template(
        "admin/dashboard.html",
        inquiries_count=inquiries_count
    )

# ---------- ADMIN INQUIRY ----------
@app.route("/admin/inquiries")
@login_required
def admin_inquiries():
    inquiries = User.query.order_by(User.created_at.desc()).all()
    return render_template(
        "admin/inquiries.html",
        inquiries=inquiries
    )

@app.route("/admin/inquiry")
@login_required
def admin_inquiry_detail(id):
    inquiry = User.query.get_or_404(id)

    return render_template(
        "admin/inquir_detail.html",
        inquiry=inquiry
    )

@app.route("/admin/inquiry/<int:id>/toggle", methods=["POST"])
@login_required
def toggle_inquiry_status(id):
    inquiry = User.query.get_or_404(id)
    inquiry.is_contacted = not inquiry.is_contacted
    db.session.commit()
    return jsonify({"success": True})


# ---------- ADMIN LOGOUT ----------
@app.route("/admin/logout")
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for("admin_login"))

# ---------------- RUN THE APP ----------------
if __name__ == "__main__":    #---------------- Always be at the end of the file ----------------
    with app.app_context():
        db.create_all()
        # create_admin()
    app.run(debug=True)