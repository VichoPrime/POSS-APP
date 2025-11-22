from . import db
from datetime import datetime
import json

class Discount(db.Model):
    __tablename__ = 'discounts'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'porcentaje', 'cantidad_fija', 'manual'
    valor = db.Column(db.Float, nullable=False)  # Porcentaje (0-100) o cantidad en dinero
    activo = db.Column(db.Boolean, default=True)
    fecha_inicio = db.Column(db.DateTime, nullable=True)
    fecha_fin = db.Column(db.DateTime, nullable=True)
    productos_aplicables = db.Column(db.Text, nullable=True)  # JSON con IDs de productos (null = todos)
    minimo_compra = db.Column(db.Float, default=0)  # Mínimo de compra para aplicar
    maximo_descuento = db.Column(db.Float, nullable=True)  # Máximo descuento aplicable
    usos_maximos = db.Column(db.Integer, nullable=True)  # Máximo número de usos
    usos_actuales = db.Column(db.Integer, default=0)  # Usos actuales
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Discount {self.nombre}>'
    
    def is_active(self):
        """Verifica si el descuento está activo y dentro del rango de fechas"""
        if not self.activo:
            return False
        
        now = datetime.utcnow()
        
        if self.fecha_inicio and now < self.fecha_inicio:
            return False
            
        if self.fecha_fin and now > self.fecha_fin:
            return False
            
        if self.usos_maximos and self.usos_actuales >= self.usos_maximos:
            return False
            
        return True
    
    def get_productos_aplicables(self):
        """Retorna la lista de IDs de productos aplicables"""
        if not self.productos_aplicables:
            return None  # Aplica a todos los productos
        try:
            return json.loads(self.productos_aplicables)
        except:
            return None
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'tipo': self.tipo,
            'valor': self.valor,
            'activo': self.activo,
            'fecha_inicio': self.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.strftime('%Y-%m-%d %H:%M:%S') if self.fecha_fin else None,
            'productos_aplicables': self.get_productos_aplicables(),
            'minimo_compra': self.minimo_compra,
            'maximo_descuento': self.maximo_descuento,
            'usos_maximos': self.usos_maximos,
            'usos_actuales': self.usos_actuales,
            'is_active': self.is_active()
        }

class Promotion(db.Model):
    __tablename__ = 'promotions'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    tipo = db.Column(db.String(30), nullable=False)  # 'combo', 'descuento_cantidad', 'segundo_gratis', etc.
    condiciones = db.Column(db.Text, nullable=False)  # JSON con condiciones de la promoción
    descuento_tipo = db.Column(db.String(20), nullable=False)  # 'porcentaje', 'cantidad_fija', 'producto_gratis'
    descuento_valor = db.Column(db.Float, nullable=False)
    activo = db.Column(db.Boolean, default=True)
    fecha_inicio = db.Column(db.DateTime, nullable=True)
    fecha_fin = db.Column(db.DateTime, nullable=True)
    dias_semana = db.Column(db.String(20), nullable=True)  # JSON con días aplicables [1,2,3,4,5,6,7]
    hora_inicio = db.Column(db.Time, nullable=True)
    hora_fin = db.Column(db.Time, nullable=True)
    usos_maximos_dia = db.Column(db.Integer, nullable=True)
    prioridad = db.Column(db.Integer, default=1)  # Prioridad de aplicación (mayor número = mayor prioridad)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Promotion {self.nombre}>'
    
    def is_active(self, check_time=True):
        """Verifica si la promoción está activa considerando fecha, día y hora"""
        if not self.activo:
            return False
        
        now = datetime.utcnow()
        
        # Verificar rango de fechas
        if self.fecha_inicio and now.date() < self.fecha_inicio.date():
            return False
            
        if self.fecha_fin and now.date() > self.fecha_fin.date():
            return False
        
        if check_time:
            # Verificar días de la semana (1=Lunes, 7=Domingo)
            if self.dias_semana:
                try:
                    dias_validos = json.loads(self.dias_semana)
                    dia_actual = now.isoweekday()  # 1=Lunes, 7=Domingo
                    if dia_actual not in dias_validos:
                        return False
                except:
                    pass
            
            # Verificar horario
            if self.hora_inicio and self.hora_fin:
                hora_actual = now.time()
                if not (self.hora_inicio <= hora_actual <= self.hora_fin):
                    return False
        
        return True
    
    def get_condiciones(self):
        """Retorna las condiciones de la promoción como objeto Python"""
        try:
            return json.loads(self.condiciones)
        except:
            return {}
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'tipo': self.tipo,
            'condiciones': self.get_condiciones(),
            'descuento_tipo': self.descuento_tipo,
            'descuento_valor': self.descuento_valor,
            'activo': self.activo,
            'fecha_inicio': self.fecha_inicio.strftime('%Y-%m-%d') if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.strftime('%Y-%m-%d') if self.fecha_fin else None,
            'dias_semana': json.loads(self.dias_semana) if self.dias_semana else None,
            'hora_inicio': self.hora_inicio.strftime('%H:%M') if self.hora_inicio else None,
            'hora_fin': self.hora_fin.strftime('%H:%M') if self.hora_fin else None,
            'usos_maximos_dia': self.usos_maximos_dia,
            'prioridad': self.prioridad,
            'is_active': self.is_active()
        }

class SaleDiscount(db.Model):
    __tablename__ = 'sale_discounts'
    
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    discount_id = db.Column(db.Integer, db.ForeignKey('discounts.id'), nullable=True)  # null si es manual
    promotion_id = db.Column(db.Integer, db.ForeignKey('promotions.id'), nullable=True)
    tipo_descuento = db.Column(db.String(20), nullable=False)  # 'manual', 'promocion', 'descuento'
    descripcion = db.Column(db.String(200), nullable=False)
    monto_descuento = db.Column(db.Float, nullable=False)
    porcentaje_aplicado = db.Column(db.Float, nullable=True)
    aplicado_por = db.Column(db.String(50), nullable=False)  # Usuario que aplicó el descuento
    fecha_aplicacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    sale = db.relationship('Sale', backref=db.backref('sale_discounts', lazy=True))
    discount = db.relationship('Discount', backref=db.backref('applied_sales', lazy=True))
    promotion = db.relationship('Promotion', backref=db.backref('applied_sales', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'sale_id': self.sale_id,
            'discount_id': self.discount_id,
            'promotion_id': self.promotion_id,
            'tipo_descuento': self.tipo_descuento,
            'descripcion': self.descripcion,
            'monto_descuento': self.monto_descuento,
            'porcentaje_aplicado': self.porcentaje_aplicado,
            'aplicado_por': self.aplicado_por,
            'fecha_aplicacion': self.fecha_aplicacion.strftime('%Y-%m-%d %H:%M:%S')
        }