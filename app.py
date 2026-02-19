from flask import Flask, render_template, request, redirect, flash, request, url_for, session, current_app, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, case
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask.cli import with_appcontext
from flask_wtf.csrf import CSRFProtect, generate_csrf
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import click

from model import db, Admin, AuditLog, User, Blog, Category, Tag

app = Flask(__name__)
# 🔐 Secret key (required for sessions & login)
app.config["SECRET_KEY"] = "dev-secret-key"

# 🗄 Database config
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://mohammadadeenhussain:password@localhost/spydraweb_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

csrf = CSRFProtect()
csrf.init_app(app)
db.init_app(app)

# ================================
#   HOME ROUTES
# ================================

# ---------- LOGIN MANAGER SETUP ----------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "admin_login"

@login_manager.user_loader
def load_user(admin_id):
    return Admin.query.get(int(admin_id))

@app.context_processor
def inject_csrf_token():
    return dict(csrf_token=generate_csrf)

# ✅ Create tables
with app.app_context():
    db.create_all()

# ---------- HOME ROUTE ----------
@app.route("/")
def home():
    return render_template("home.html")

# ---------- PLANS ROUTE ---------
@app.route("/plans")
def plans():
    return render_template("plans.html")

# ---------- INQUIRY FORM ROUTE ----------
@app.route("/inquiry", methods=["GET", "POST"])
def inquiry():
    selected_plan = request.args.get("plan", "")

    if request.method == "POST":
        addons = request.form.getlist("addons")

        user = User(
            full_name=request.form.get("full_name"),
            email=request.form.get("email"),
            phone=request.form.get("phone"),
            company=request.form.get("company"),
            country_timezone=request.form.get("country_timezone"),

            project_type=", ".join(request.form.getlist("project_type")),
            project_goals=request.form.get("project_goals"),
            features=", ".join(request.form.getlist("features")),

            selected_plan=request.form.get("selected_plan"),
            addons=", ".join(addons),

            timeline=request.form.get("timeline"),
            budget=request.form.get("budget"),
            references=request.form.get("references")
        )

        db.session.add(user)
        db.session.commit()

        return redirect(url_for("inquiry"))

    return render_template("user/inquiry.html", selected_plan=selected_plan)

# ---------- BLOG ROUTES ----------

@app.route("/blogs")
def blogs():

    page = request.args.get("page", 1, type=int)
    search = request.args.get("search", "")
    category = request.args.get("category")

    query = Blog.query.order_by(Blog.created_at.desc())

    if search:
        query = query.filter(
            Blog.title.ilike(f"%{search}%")
        )

    if category:
        query = query.join(Category).filter(
            Category.name == category
        )

    pagination = query.paginate(page=page, per_page=6)

    return render_template(
        "blogs.html",
        blogs=pagination.items,
        pagination=pagination,
        search=search
    )

@app.route("/blogs/<slug>")
def blog_detail(slug):

    blog = Blog.query.filter_by(slug=slug).first_or_404()

    related = Blog.query.filter(
        Blog.category_id == blog.category_id,
        Blog.id != blog.id
    ).limit(3).all()

    return render_template(
        "blog_detail.html",
        blog=blog,
        related=related
    )

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

def log_action(action):
    if current_user.is_authenticated:
        log = AuditLog(
            admin_email=current_user.email,
            action=action,
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()

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
            log_action("Admin logged in")
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
    # 🔍 Search & filter inputs
    search = request.args.get("search", "")
    status = request.args.get("status", "")

    # 📄 Pagination inputs
    page = request.args.get("page", 1, type=int)
    per_page = 10

    query = User.query

    # 🔍 Search by name or email
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )

    # 🟢 Filter by contacted status
    if status == "contacted":
        query = query.filter(User.is_contacted == True)
    elif status == "pending":
        query = query.filter(User.is_contacted == False)

    # 📑 Order newest first
    query = query.order_by(User.created_at.desc())

    # 📄 Apply pagination
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    # 🎯 Render page
    return render_template(
        "admin/inquiries.html",
        inquiries=pagination.items,
        pagination=pagination,
        search=search,
        status=status
    )

@app.route("/admin/inquiry/<int:id>")
@login_required
def admin_inquiry_detail(id):
    inquiry = User.query.get_or_404(id)
    log_action(f"Viewed inquiry #{id}")
    return render_template(
        "admin/inquiry_detail.html",
        inquiry=inquiry
    )

@app.route("/admin/inquiry/<int:id>/toggle", methods=["POST"])
@login_required
def toggle_inquiry_status(id):
    inquiry = User.query.get_or_404(id)
    inquiry.is_contacted = not inquiry.is_contacted
    db.session.commit()

    status = "Contacted" if inquiry.is_contacted else "Pending"
    log_action(f"Marked inquiry #{id} as {status}")
    return redirect(request.referrer or url_for("admin_inquiries"))
    # return jsonify({"success": True})

@app.route("/admin/inquiry/<int:id>/delete", methods=["POST"])
@login_required
def delete_inquiry(id):
    inquiry = User.query.get_or_404(id)
    db.session.delete(inquiry)
    db.session.commit()
    log_action(f"Deleted inquiry #{id}")
    return redirect(url_for("admin_inquiries"))

# ---------- ADMIN AUDIT LOG ROUTE ----------
@app.route("/admin/audit-logs")
@login_required
def admin_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(200).all()
    return render_template("admin/audit_logs.html", logs=logs)

# --------- ADMIN BLOG MANAGEMENT ROUTE ----------
@app.route("/admin/blogs")
@admin_required   # or your login_required decorator
def admin_blogs():
    blogs = Blog.query.order_by(Blog.created_at.desc()).all()
    return render_template("admin/blogs.html", blogs=blogs)


@app.route("/admin/blog/create", methods=["GET", "POST"])
@admin_required
def create_blog():
    if request.method == "POST":

        blog = Blog(
            title=request.form.get("title"),
            short_description=request.form.get("short_description"),
            content=request.form.get("content"),
            image_url=request.form.get("image_url")
        )

        blog.generate_slug()

        db.session.add(blog)
        db.session.commit()

        return redirect(url_for("admin_blogs"))

    return render_template("admin/create_blog.html")

@app.route("/admin/blog/edit/<int:blog_id>", methods=["GET", "POST"])
@admin_required  # or your login decorator
def edit_blog(blog_id):

    blog = Blog.query.get_or_404(blog_id)

    if request.method == "POST":
        blog.title = request.form.get("title")
        blog.short_description = request.form.get("short_description")
        blog.content = request.form.get("content")
        blog.image_url = request.form.get("image_url")

        blog.generate_slug()

        db.session.commit()

        return redirect(url_for("admin_blogs"))

    return render_template("admin/edit_blog.html", blog=blog)

@app.route("/admin/blog/delete/<int:blog_id>", methods=["POST"])
@admin_required
def delete_blog(blog_id):

    blog = Blog.query.get_or_404(blog_id)

    db.session.delete(blog)
    db.session.commit()

    return redirect(url_for("admin_blogs"))

# ---------- ADMIN LOGOUT ----------
@app.route("/admin/logout")
@login_required
def admin_logout():
    log_action("Admin logged out")
    logout_user()
    return redirect(url_for("admin_login"))

# ---------------- RUN THE APP ----------------
if __name__ == "__main__":    #---------------- Always be at the end of the file ----------------
    with app.app_context():
        db.create_all()
        # create_admin()
    app.run(debug=True)