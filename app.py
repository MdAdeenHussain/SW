from flask import Flask, render_template, redirect, flash, request, url_for, session, current_app
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, case
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from model import db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"

db.init_app(app)

# ---------- LOGIN MANAGER SETUP ----------
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()



# ---------------- RUN THE APP ----------------
if __name__ == "__main__":    #---------------- Always be at the end of the file ----------------
    with app.app_context():
        db.create_all()
        # create_admin()
    app.run(debug=True)