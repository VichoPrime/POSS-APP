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
    unit_type = db.Column(db.String(20), default='unidades')  # 'unidades' o 'peso'
    peso_unitario = db.Column(db.Float, nullable=True)  # Peso promedio por unidad en kg
    stock_minimo = db.Column(db.Integer, default=5)  # Stock mínimo para alertas
    margen_ganancia = db.Column(db.Integer, default=0)  # Margen de ganancia en pesos chilenos (sin decimales)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Método para verificar si está en bajo stock
    def is_low_stock(self):
        return self.stock <= self.stock_minimo
    
    # Método para calcular precio de costo
    def get_precio_costo(self):
        return self.precio - self.margen_ganancia
    
    # Las relaciones ya están definidas con backref en Category y SaleItem
    
    def __repr__(self):
        return f'<Article {self.title}>'