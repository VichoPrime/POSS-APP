from . import db
from datetime import datetime

class InventoryLoss(db.Model):
    __tablename__ = 'inventory_losses'
    
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    cantidad_perdida = db.Column(db.Float, nullable=False)  # Float para manejar kg y unidades
    tipo_perdida = db.Column(db.String(20), nullable=False)  # 'vencido' o 'dañado'
    motivo = db.Column(db.Text, nullable=True)  # Descripción opcional del motivo
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    usuario_registro = db.Column(db.String(50), nullable=True)  # Usuario que registró la pérdida
    
    # Relación con Article
    article = db.relationship('Article', backref=db.backref('inventory_losses', lazy=True))
    
    def __repr__(self):
        return f'<InventoryLoss {self.id}: {self.cantidad_perdida} {self.article.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'article_id': self.article_id,
            'article_title': self.article.title if self.article else None,
            'article_unit_type': self.article.unit_type if self.article else None,
            'cantidad_perdida': self.cantidad_perdida,
            'tipo_perdida': self.tipo_perdida,
            'motivo': self.motivo,
            'fecha_registro': self.fecha_registro.strftime('%Y-%m-%d %H:%M:%S'),
            'usuario_registro': self.usuario_registro
        }