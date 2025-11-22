from models import db
from datetime import datetime, timezone
import pytz

class Sale(db.Model):
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    total = db.Column(db.Float, nullable=False)
    fecha_venta = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticket_number = db.Column(db.String(50), unique=True, nullable=False)
    metodo_pago = db.Column(db.String(20), nullable=False, default='efectivo')  # 'efectivo' o 'tarjeta'
    turno_id = db.Column(db.Integer, db.ForeignKey('turnos.id'), nullable=True)  # Relación con turno
    nota = db.Column(db.Text, nullable=True)  # Campo para notas de la venta
    
    # Relaciones - CORREGIDO
    user = db.relationship('User', backref='user_sales')  # ← Cambiar nombre del backref
    items = db.relationship('SaleItem', back_populates='sale', cascade='all, delete-orphan')  # ← Usar back_populates
    turno = db.relationship('Turno', back_populates='sales')  # ← Usar back_populates
    
    def __repr__(self):
        return f'<Sale {self.ticket_number}: ${self.total}>'

class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)  # ← Importante
    article_title = db.Column(db.String(200), nullable=False)  # ← Para casos donde se elimine el artículo
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    
    # Relaciones - CORREGIDO
    sale = db.relationship("Sale", back_populates="items")  # ← Usar back_populates
    article = db.relationship("Article", backref="article_sale_items")  # ← Cambiar nombre del backref
    
    def __repr__(self):
        return f'<SaleItem {self.quantity}x {self.article_title}>'

class Turno(db.Model):
    __tablename__ = 'turnos'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    fecha_inicio = db.Column(db.DateTime, default=lambda: datetime.now(pytz.timezone('America/Santiago')), nullable=False)
    fecha_cierre = db.Column(db.DateTime, nullable=True)
    monto_inicial = db.Column(db.Float, default=0.0, nullable=False)  # Monto con que se abre la caja
    total_efectivo = db.Column(db.Float, default=0.0, nullable=False)  # Total vendido en efectivo
    total_tarjeta = db.Column(db.Float, default=0.0, nullable=False)  # Total vendido con tarjeta
    total_ventas = db.Column(db.Float, default=0.0, nullable=False)  # Total general
    cantidad_ventas = db.Column(db.Integer, default=0, nullable=False)  # Número de ventas
    total_devoluciones = db.Column(db.Float, default=0.0, nullable=False)  # Total de devoluciones
    cantidad_devoluciones = db.Column(db.Integer, default=0, nullable=False)  # Número de devoluciones
    activo = db.Column(db.Boolean, default=True, nullable=False)  # Si el turno está activo
    
    # Relaciones
    # Nota: No es necesario usar backref aquí, ya que las relaciones se manejan en Sale
    user = db.relationship('User', backref='user_turnos')  
    sales = db.relationship('Sale', back_populates='turno')  
    
    def __repr__(self):
        return f'<Turno {self.id}: User {self.user_id}>'

class SuspendedSale(db.Model):
    __tablename__ = 'suspended_sales'
    
    id = db.Column(db.Integer, primary_key=True)
    turno_id = db.Column(db.Integer, db.ForeignKey('turnos.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticket_number = db.Column(db.String(50), unique=True, nullable=False)
    total = db.Column(db.Float, nullable=False)
    items_data = db.Column(db.Text, nullable=False)
    fecha_suspension = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    nota = db.Column(db.String(200))
    
    def __repr__(self):
        return f'<SuspendedSale {self.ticket_number}: ${self.total}>'

class Devolucion(db.Model):
    __tablename__ = 'devoluciones'
    
    id = db.Column(db.Integer, primary_key=True)
    turno_id = db.Column(db.Integer, db.ForeignKey('turnos.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticket_number = db.Column(db.String(50), unique=True, nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey('articles.id'), nullable=False)
    article_title = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    total = db.Column(db.Float, nullable=False)
    motivo = db.Column(db.String(500), nullable=False)  # Motivo de la devolución
    fecha_devolucion = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relaciones
    turno = db.relationship('Turno', backref='devoluciones')
    user = db.relationship('User', backref='user_devoluciones')
    article = db.relationship('Article', backref='article_devoluciones')
    
    def __repr__(self):
        return f'<Devolucion {self.ticket_number}: {self.quantity}x {self.article_title}>'