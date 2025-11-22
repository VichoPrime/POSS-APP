from werkzeug.security import generate_password_hash, check_password_hash
from models import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Roles y permisos
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Permisos específicos por módulo
    can_manage_products = db.Column(db.Boolean, default=False)  # Gestión de productos
    can_view_suspended_sales = db.Column(db.Boolean, default=False)  # Ventas suspendidas
    can_process_returns = db.Column(db.Boolean, default=False)  # Devoluciones
    can_add_notes = db.Column(db.Boolean, default=False)  # Agregar notas
    can_manage_inventory_losses = db.Column(db.Boolean, default=False)  # Pérdidas de inventario
    can_perform_physical_count = db.Column(db.Boolean, default=False)  # Conteo físico
    can_view_shift_history = db.Column(db.Boolean, default=False)  # Historial de turnos
    can_view_audit_logs = db.Column(db.Boolean, default=False)  # Historiales de auditoría
    can_manage_promotions = db.Column(db.Boolean, default=False)  # Promociones
    can_manage_users = db.Column(db.Boolean, default=False)  # Gestión de usuarios
    
    # Relaciones
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def has_permission(self, permission):
        """Verificar si el usuario tiene un permiso específico"""
        if self.is_admin:
            return True  # Los administradores tienen todos los permisos
        return getattr(self, permission, False)
    
    def get_permissions(self):
        """Obtener lista de permisos del usuario"""
        permissions = {
            'can_manage_products': self.can_manage_products,
            'can_view_suspended_sales': self.can_view_suspended_sales,
            'can_process_returns': self.can_process_returns,
            'can_add_notes': self.can_add_notes,
            'can_manage_inventory_losses': self.can_manage_inventory_losses,
            'can_perform_physical_count': self.can_perform_physical_count,
            'can_view_shift_history': self.can_view_shift_history,
            'can_view_audit_logs': self.can_view_audit_logs,
            'can_manage_promotions': self.can_manage_promotions,
            'can_manage_users': self.can_manage_users,
            'is_admin': self.is_admin
        }
        return permissions
    
    def update_permissions(self, permissions_dict):
        """Actualizar permisos del usuario"""
        for permission, value in permissions_dict.items():
            if hasattr(self, permission):
                setattr(self, permission, value)
    
    def __repr__(self):
        return f'<User {self.username}>'