from werkzeug.security import generate_password_hash, check_password_hash
from models import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(50), default="operario")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def is_authorized_for_inventory(self):
        # Solo operarios y administradores pueden acceder
        return self.role in ["operario", "administrador"]
    
    def __repr__(self):
        return f'<User {self.username}>'