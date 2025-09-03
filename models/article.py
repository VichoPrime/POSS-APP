from flask_sqlalchemy import SQLAlchemy
from models import db
from datetime import datetime, timezone
# Modelo de categoría
class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    articles = db.relationship('Article', backref='category')
    
    def __repr__(self):
        return f'<Category {self.name}'

#Modelo articulos relacion uno a muchos con category para evitar errores de tipeo
class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.String(500))
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    codigo_barra = db.Column(db.String(100), unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    image_url = db.Column(db.String(500))
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    min_stock = db.Column(db.Integer, default=0)          # Stock mínimo para alertas
    unidad_medida = db.Column(db.String(50), default="unidad") # ej. unidad, kg, litro
    status = db.Column(db.String(50), default='activo')   # activo | vencido | dañado

    
    # Las relaciones ya están definidas con backref en Category y SaleItem
    
    def __repr__(self):
        return f'<Article {self.title}>'