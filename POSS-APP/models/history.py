from models import db
from datetime import datetime, timezone

class ProductHistory(db.Model):
    __tablename__ = 'product_history'
    
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # 'created', 'updated', 'stock_changed', 'price_changed', etc.
    description = db.Column(db.Text, nullable=False)  # Descripción detallada del cambio
    old_values = db.Column(db.Text, nullable=True)  # JSON con valores anteriores
    new_values = db.Column(db.Text, nullable=True)  # JSON con valores nuevos
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relaciones
    article = db.relationship('Article', backref='history_entries')
    user = db.relationship('User', backref='product_changes')
    
    def __repr__(self):
        return f'<ProductHistory {self.action} on Article {self.article_id} by User {self.user_id}>'

class PhysicalCountHistory(db.Model):
    __tablename__ = 'physical_count_history'
    
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    old_stock = db.Column(db.Float, nullable=False)  # Stock anterior
    new_stock = db.Column(db.Float, nullable=False)  # Stock después del conteo
    difference = db.Column(db.Float, nullable=False)  # Diferencia (new - old)
    observation = db.Column(db.Text, nullable=True)  # Observaciones del conteo
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relaciones
    article = db.relationship('Article', backref='count_history')
    user = db.relationship('User', backref='physical_counts')
    
    def __repr__(self):
        return f'<PhysicalCountHistory Article {self.article_id}: {self.old_stock} -> {self.new_stock}>'