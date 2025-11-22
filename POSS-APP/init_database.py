"""
Script de inicialización de base de datos para el Sistema POS
Crea la base de datos con lo mínimo indispensable para el funcionamiento del programa.
"""
import os
import sys
from datetime import datetime

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models.article import Article, Category
from models.user import User

def init_database():
    """
    Inicializa la base de datos con datos mínimos indispensables
    """
    print("🚀 Inicializando base de datos del Sistema POS...")
    
    # Crear el directorio instance si no existe
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
    if not os.path.exists(instance_path):
        print("📁 Creando directorio 'instance'...")
        os.makedirs(instance_path)
    
    with app.app_context():
        # Crear todas las tablas
        print("📊 Creando tablas de base de datos...")
        db.create_all()
        
        # Verificar si ya existen datos
        if User.query.first() is not None:
            print("⚠️  La base de datos ya contiene datos. ¿Desea reinicializarla? (s/N)")
            response = input().lower()
            if response != 's':
                print("❌ Operación cancelada.")
                return
            
            # Limpiar datos existentes
            print("🧹 Limpiando datos existentes...")
            db.drop_all()
            db.create_all()
        
        # 1. Crear usuario administrador por defecto
        print("👤 Creando usuario administrador...")
        admin_user = User(
            username='admin',
            email='admin@pos.com',
            is_admin=True,
            is_active=True
        )
        admin_user.set_password('123456')  # Contraseña temporal
        db.session.add(admin_user)
        
        # 2. Crear categorías básicas
        print("📂 Creando categorías básicas...")
        categorias_basicas = [
            'Bebidas',
            'Snacks',
            'Lácteos',
            'Panadería',
            'Frutas y Verduras',
            'Limpieza',
            'Otros'
        ]
        
        categorias_obj = []
        for cat_name in categorias_basicas:
            categoria = Category(name=cat_name)
            db.session.add(categoria)
            categorias_obj.append(categoria)
        
        # Hacer flush para obtener los IDs de las categorías
        db.session.flush()
        
        # 3. Crear productos básicos de ejemplo
        print("🛍️  Creando productos básicos...")
        productos_basicos = [
            {
                'title': 'Coca Cola 500ml',
                'content': 'Bebida gaseosa Coca Cola 500ml',
                'precio': 1000,
                'stock': 50,
                'category_id': categorias_obj[0].id,  # Bebidas
                'unit_type': 'unidades',
                'stock_minimo': 10,
                'margen_ganancia': 300,
                'activo': True
            },
            {
                'title': 'Pan Francés',
                'content': 'Pan francés fresco del día',
                'precio': 200,
                'stock': 100,
                'category_id': categorias_obj[3].id,  # Panadería
                'unit_type': 'unidades',
                'stock_minimo': 20,
                'margen_ganancia': 50,
                'activo': True
            },
            {
                'title': 'Leche Entera 1L',
                'content': 'Leche entera pasteurizada 1 litro',
                'precio': 800,
                'stock': 30,
                'category_id': categorias_obj[2].id,  # Lácteos
                'unit_type': 'unidades',
                'stock_minimo': 5,
                'margen_ganancia': 200,
                'activo': True
            },
            {
                'title': 'Banana',
                'content': 'Banana fresca por kilogramo',
                'precio': 2000,
                'stock': 25.5,
                'category_id': categorias_obj[4].id,  # Frutas y Verduras
                'unit_type': 'peso',
                'peso_unitario': 0.12,  # 120g promedio por banana
                'stock_minimo': 5,
                'margen_ganancia': 500,
                'activo': True
            },
            {
                'title': 'Papas Fritas Lays',
                'content': 'Papas fritas Lays sabor original 150g',
                'precio': 1500,
                'stock': 40,
                'category_id': categorias_obj[1].id,  # Snacks
                'unit_type': 'unidades',
                'stock_minimo': 8,
                'margen_ganancia': 400,
                'activo': True
            }
        ]
        
        for producto_data in productos_basicos:
            producto = Article(**producto_data)
            db.session.add(producto)
        
        # Guardar todos los cambios
        print("💾 Guardando cambios en la base de datos...")
        db.session.commit()
        
        print("\n✅ Base de datos inicializada exitosamente!")
        print("\n📋 RESUMEN DE INICIALIZACIÓN:")
        print("═" * 50)
        print(f"👤 Usuario administrador: admin")
        print(f"🔑 Contraseña temporal: 123456")
        print(f"📧 Email: admin@pos.com")
        print(f"📂 Categorías creadas: {len(categorias_basicas)}")
        print(f"🛍️  Productos creados: {len(productos_basicos)}")
        print("═" * 50)
        print("\n⚠️  IMPORTANTE:")
        print("- Cambie la contraseña del administrador después del primer login")
        print("- Agregue más productos según sus necesidades")
        print("- Configure los permisos de usuarios adicionales")
        print("\n🚀 El sistema está listo para usar!")

def reset_database():
    """
    Resetea completamente la base de datos (solo para desarrollo)
    """
    print("⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos!")
    print("¿Está seguro de que desea continuar? (s/N)")
    response = input().lower()
    if response != 's':
        print("❌ Operación cancelada.")
        return
    
    with app.app_context():
        print("🗑️  Eliminando base de datos...")
        db.drop_all()
        print("✅ Base de datos eliminada.")
        
        # Reinicializar
        init_database()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--reset":
        reset_database()
    else:
        init_database()