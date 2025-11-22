from . import db
from datetime import datetime

class PhysicalInventory(db.Model):
    __tablename__ = 'physical_inventory'
    
    id = db.Column(db.Integer, primary_key=True)
    conteo_session_id = db.Column(db.String(36), nullable=False)  # UUID para agrupar conteos de la misma sesión
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    cantidad_sistema = db.Column(db.Float, nullable=False)  # Stock según el sistema
    cantidad_fisica = db.Column(db.Float, nullable=True)  # Stock contado físicamente
    diferencia = db.Column(db.Float, nullable=True)  # cantidad_fisica - cantidad_sistema
    estado = db.Column(db.String(20), default='pendiente', nullable=False)  # 'pendiente', 'contado', 'ajustado'
    fecha_conteo = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_ajuste = db.Column(db.DateTime, nullable=True)  # Cuándo se aplicó el ajuste
    usuario_conteo = db.Column(db.String(50), nullable=False)  # Usuario que realizó el conteo
    notas = db.Column(db.Text, nullable=True)  # Observaciones adicionales
    
    # Relación con Article
    article = db.relationship('Article', backref=db.backref('physical_inventories', lazy=True))
    
    def __repr__(self):
        return f'<PhysicalInventory {self.id}: {self.article.title if self.article else "N/A"}>'
    
    def calculate_difference(self):
        """Calcula la diferencia entre cantidad física y sistema"""
        if self.cantidad_fisica is not None:
            self.diferencia = self.cantidad_fisica - self.cantidad_sistema
            return self.diferencia
        return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'conteo_session_id': self.conteo_session_id,
            'article_id': self.article_id,
            'article_title': self.article.title if self.article else None,
            'article_unit_type': self.article.unit_type if self.article else None,
            'cantidad_sistema': self.cantidad_sistema,
            'cantidad_fisica': self.cantidad_fisica,
            'diferencia': self.diferencia,
            'estado': self.estado,
            'fecha_conteo': self.fecha_conteo.strftime('%Y-%m-%d %H:%M:%S'),
            'fecha_ajuste': self.fecha_ajuste.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_ajuste else None,
            'usuario_conteo': self.usuario_conteo,
            'notas': self.notas,
            'tiene_diferencia': abs(self.diferencia) > 0.01 if self.diferencia is not None else False
        }