from flask import Flask, request, jsonify, session, render_template
from models.article import Article, Category
from models.user import User
from models.sale import Sale, SaleItem, Turno, SuspendedSale, Devolucion
from models import db
from flask_cors import CORS
from functools import wraps
import os
from datetime import datetime, timezone
import uuid
from sqlalchemy import create_engine, func, case  
from sqlalchemy.orm import sessionmaker
import json
from models.inventoryController import inventory_bp


app = Flask(__name__)
app.register_blueprint(inventory_bp)

# CONFIGURACIÓN CRÍTICA PARA SESIONES
app.config['SECRET_KEY'] = 'tu-clave-secreta-aqui-cambiala-en-produccion'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # True solo para HTTPS

# Configurar CORS si es necesario
CORS(app, supports_credentials=True)

app.secret_key = os.environ.get('SECRET_KEY', 'brian123')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Asegurar que el import incluya Devolucion
with app.app_context():
    try:
        db.create_all()  # Esto creará solo las tablas/columnas faltantes
        print("✅ Base de datos actualizada")
    except Exception as e:
        print(f"⚠️ Error actualizando BD: {e}")

# Definir el decorador login_required
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Autenticación requerida'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Nueva función para obtener o crear turno activo
def get_or_create_active_turno(user_id):
    turno_activo = Turno.query.filter_by(user_id=user_id, activo=True).first()
    if not turno_activo:
        # Crear nuevo turno
        turno_activo = Turno(user_id=user_id)
        db.session.add(turno_activo)
        db.session.flush()
    return turno_activo

# =====================
# RUTAS DE PÁGINAS
# =====================

@app.route('/')
def home(): 
    return render_template('caja.html')

@app.route('/buscar-productos')
def buscar_productos():
    return render_template('articles.html')

@app.route('/historial-ventas')
def historial_ventas():
    return render_template('ventas.html')

@app.route('/turnos')
@login_required
def turnos():
    return render_template('turnos.html')

# =====================
# AUTENTICACIÓN
# =====================

@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No se proporcionaron datos'}), 400
    
    required_fields = ['username', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    if User.query.filter_by(email=data['email']).first() is not None:
        return jsonify({'error': 'El email ya esta registrado'}), 400
    
    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        'message': f'usuario {new_user.username} registrado con exito'
    }), 201

@app.route('/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No se proporcionaron datos'}), 400
        
        required_fields = ['email', 'password']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Faltan campos requeridos: email y password'}), 400
        
        # Buscar usuario
        user = User.query.filter_by(email=data['email']).first()
        if user is None:
            return jsonify({'error': 'Usuario no encontrado'}), 401
        
        # Verificar contraseña
        if not user.check_password(data['password']):
            return jsonify({'error': 'Contraseña incorrecta'}), 401

        # Crear sesión
        session['user_id'] = user.id
        
        # Crear o obtener turno activo
        turno_activo = get_or_create_active_turno(user.id)
        db.session.commit()
        
        return jsonify({
            'message': f'Bienvenido {user.username}',
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'turno_id': turno_activo.id,
            'turno_inicio': turno_activo.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"Error en login: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@app.route('/check-auth', methods=['GET'])
def check_auth():
    try:
        if 'user_id' in session:
            user = User.query.get(session['user_id'])
            if user:
                return jsonify({
                    'logged_in': True,
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email
                })
        
        return jsonify({'logged_in': False})
        
    except Exception as e:
        print(f"Error en check_auth: {str(e)}")
        return jsonify({'logged_in': False})

@app.route('/logout', methods=['POST'])
def logout_user():
    try:
        # Verificar si hay turno activo y cerrarlo
        if 'user_id' in session:
            turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
            if turno_activo:
                turno_activo.fecha_cierre = datetime.utcnow()
                turno_activo.activo = False
                db.session.commit()
        
        session.pop('user_id', None)
        return jsonify({'message': 'Sesión cerrada con éxito'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Sesión cerrada con éxito'})

# =====================
# VENTAS
# =====================

@app.route('/sales', methods=['POST'])
@login_required
def create_sale():
    try:
        data = request.get_json()
        
        # Imprimir datos recibidos para debug
        print(f"Datos recibidos: {data}")
        
        cart_items = data.get('cart_items', [])
        metodo_pago = data.get('metodo_pago', 'efectivo')
        suspended_sale_id = data.get('suspended_sale_id')
        
        if not cart_items:
            return jsonify({'error': 'No hay items en el carrito'}), 400
        
        # Verificar estructura de cart_items
        for item in cart_items:
            required_fields = ['id', 'title', 'precio', 'quantity']
            missing_fields = [field for field in required_fields if field not in item]
            if missing_fields:
                return jsonify({'error': f'Faltan campos en item: {missing_fields}'}), 400
        
        # Obtener turno activo
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo:
            return jsonify({'error': 'No hay turno activo'}), 400
        
        # Validar stock
        for item in cart_items:
            article = Article.query.get(item['id'])
            if not article:
                return jsonify({'error': f'Producto {item["title"]} no encontrado'}), 404
            if article.stock < item['quantity']:
                return jsonify({'error': f'Stock insuficiente para {article.title}. Stock disponible: {article.stock}'}), 400
        
        # Calcular totales
        total = sum(item['precio'] * item['quantity'] for item in cart_items)
        
        # Generar número de ticket
        ticket_number = f"T{turno_activo.id}-{uuid.uuid4().hex[:6].upper()}"
        
        # Crear venta
        nueva_venta = Sale(
            ticket_number=ticket_number,
            total=total,
            metodo_pago=metodo_pago,
            turno_id=turno_activo.id,
            user_id=session['user_id']
        )
        db.session.add(nueva_venta)
        db.session.flush()  # Para obtener el ID
        
        # Crear items de venta y actualizar stock
        for item in cart_items:
            # Crear item de venta
            sale_item = SaleItem(
                sale_id=nueva_venta.id,
                article_id=item['id'],
                article_title=item['title'],  # Guardar título
                quantity=item['quantity'],
                unit_price=item['precio'],
                subtotal=item['precio'] * item['quantity']
            )
            db.session.add(sale_item)
            
            # Actualizar stock
            article = Article.query.get(item['id'])
            if article:
                article.stock -= item['quantity']
        
        # Si es una venta retomada, eliminar la venta suspendida
        if suspended_sale_id:
            suspended_sale = SuspendedSale.query.get(suspended_sale_id)
            if suspended_sale:
                db.session.delete(suspended_sale)
        
        # Actualizar estadísticas del turno
        turno_activo.cantidad_ventas = (turno_activo.cantidad_ventas or 0) + 1
        turno_activo.total_ventas = (turno_activo.total_ventas or 0) + total
        
        if metodo_pago == 'efectivo':
            turno_activo.total_efectivo = (turno_activo.total_efectivo or 0) + total
        else:
            turno_activo.total_tarjeta = (turno_activo.total_tarjeta or 0) + total
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Venta procesada exitosamente',
            'ticket_number': ticket_number,
            'sale_id': nueva_venta.id,
            'total': total
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error detallado en venta: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error al procesar la venta: {str(e)}'}), 500

@app.route('/sales', methods=['GET'])
@login_required
def get_sales():
    try:
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        
        if not turno_activo:
            return jsonify({
                'sales': [],
                'total_pages': 0,
                'current_page': 1,
                'total_sales': 0,
                'message': 'No hay turno activo'
            })
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        sales = Sale.query.filter_by(turno_id=turno_activo.id).order_by(Sale.fecha_venta.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        sales_data = []
        for sale in sales.items:
            sale_data = {
                'id': sale.id,
                'ticket_number': sale.ticket_number,
                'total': sale.total,
                'metodo_pago': sale.metodo_pago,
                'fecha_venta': sale.fecha_venta.strftime('%Y-%m-%d %H:%M:%S'),
                'user': sale.user.username if sale.user else 'Unknown',
                'items_count': len(sale.items),
                'items': [
                    {
                        'article_title': item.article_title,
                        'quantity': item.quantity,
                        'unit_price': item.unit_price,
                        'subtotal': item.subtotal
                    }
                    for item in sale.items
                ]
            }
            sales_data.append(sale_data)
        
        return jsonify({
            'sales': sales_data,
            'total_pages': sales.pages,
            'current_page': sales.page,
            'total_sales': sales.total,
            'turno_info': {
                'id': turno_activo.id,
                'fecha_inicio': turno_activo.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'),
                'total_efectivo': turno_activo.total_efectivo or 0,
                'total_tarjeta': turno_activo.total_tarjeta or 0,
                'total_ventas': turno_activo.total_ventas or 0,
                'cantidad_ventas': turno_activo.cantidad_ventas or 0
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'Error al obtener ventas'}), 500

# =====================
# VENTAS SUSPENDIDAS
# =====================

@app.route('/sales/suspend', methods=['POST'])
@login_required
def suspend_sale():
    try:
        data = request.get_json()
        cart_items = data.get('cart_items', [])
        nota = data.get('nota', '')
        
        if not cart_items:
            return jsonify({'error': 'No hay items para suspender'}), 400
        
        # Obtener turno activo
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo:
            return jsonify({'error': 'No hay turno activo'}), 400
        
        # Calcular total
        total = sum(item['precio'] * item['quantity'] for item in cart_items)
        
        # Generar número de ticket único
        ticket_number = f"SUSP-{uuid.uuid4().hex[:8].upper()}"
        
        # Crear venta suspendida
        suspended_sale = SuspendedSale(
            turno_id=turno_activo.id,
            user_id=session['user_id'],
            ticket_number=ticket_number,
            total=total,
            items_data=json.dumps(cart_items),
            nota=nota
        )
        
        db.session.add(suspended_sale)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Venta suspendida exitosamente',
            'ticket_number': ticket_number,
            'suspended_sale_id': suspended_sale.id
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error suspendiendo venta: {str(e)}")
        return jsonify({'error': 'Error al suspender venta'}), 500

@app.route('/sales/suspended', methods=['GET'])
@login_required
def get_suspended_sales():
    try:
        # Obtener turno activo
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo:
            return jsonify([])
        
        # Obtener ventas suspendidas
        suspended_sales = SuspendedSale.query.filter_by(turno_id=turno_activo.id)\
                                           .order_by(SuspendedSale.fecha_suspension.desc())\
                                           .all()
        
        sales_data = []
        for sale in suspended_sales:
            items = json.loads(sale.items_data)
            user = User.query.get(sale.user_id)
            
            sales_data.append({
                'id': sale.id,
                'ticket_number': sale.ticket_number,
                'total': sale.total,
                'items_count': len(items),
                'items': items,
                'fecha_suspension': sale.fecha_suspension.isoformat(),
                'nota': sale.nota,
                'usuario': user.username if user else 'Desconocido'
            })
        
        return jsonify(sales_data)
        
    except Exception as e:
        print(f"Error obteniendo ventas suspendidas: {str(e)}")
        return jsonify({'error': 'Error al obtener ventas suspendidas'}), 500

@app.route('/sales/suspended/<int:suspended_id>/resume', methods=['POST'])
@login_required
def resume_suspended_sale(suspended_id):
    try:
        # Obtener venta suspendida
        suspended_sale = SuspendedSale.query.get_or_404(suspended_id)
        
        # Verificar que pertenece al turno activo del usuario
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo or suspended_sale.turno_id != turno_activo.id:
            return jsonify({'error': 'Venta suspendida no válida'}), 400
        
        # Obtener items de la venta suspendida
        items = json.loads(suspended_sale.items_data)
        
        return jsonify({
            'success': True,
            'message': 'Venta lista para retomar',
            'cart_items': items,
            'ticket_number': suspended_sale.ticket_number,
            'suspended_sale_id': suspended_sale.id
        })
        
    except Exception as e:
        print(f"Error retomando venta: {str(e)}")
        return jsonify({'error': 'Error al retomar venta'}), 500

@app.route('/sales/suspended/<int:suspended_id>', methods=['DELETE'])
@login_required
def delete_suspended_sale(suspended_id):
    try:
        # Obtener y eliminar
        suspended_sale = SuspendedSale.query.get_or_404(suspended_id)
        
        # Verificar que pertenece al usuario actual
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo or suspended_sale.turno_id != turno_activo.id:
            return jsonify({'error': 'No autorizado'}), 403
        
        db.session.delete(suspended_sale)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Venta suspendida eliminada exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error eliminando venta suspendida: {str(e)}")
        return jsonify({'error': 'Error al eliminar venta suspendida'}), 500

# =====================
# DEVOLUCIONES
# =====================

@app.route('/returns', methods=['POST'])
@login_required
def create_return():
    try:
        data = request.get_json()
        article_id = data.get('article_id')
        quantity = data.get('quantity')
        motivo = data.get('motivo', '').strip()
        
        if not article_id or not quantity or not motivo:
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        if quantity <= 0:
            return jsonify({'error': 'La cantidad debe ser mayor a 0'}), 400
        
        # Obtener turno activo
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo:
            return jsonify({'error': 'No hay turno activo'}), 400
        
        # Obtener artículo
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'error': 'Artículo no encontrado'}), 404
        
        # Calcular total de la devolución
        total = article.precio * quantity
        
        # Generar número de ticket único para devolución
        ticket_number = f"DEV-{uuid.uuid4().hex[:8].upper()}"
        
        # Crear devolución
        nueva_devolucion = Devolucion(
            turno_id=turno_activo.id,
            user_id=session['user_id'],
            ticket_number=ticket_number,
            article_id=article.id,
            article_title=article.title,
            quantity=quantity,
            unit_price=article.precio,
            total=total,
            motivo=motivo
        )
        db.session.add(nueva_devolucion)
        
        # Actualizar stock del artículo (devolver al inventario)
        article.stock += quantity
        
        # Actualizar estadísticas del turno
        turno_activo.total_devoluciones = (turno_activo.total_devoluciones or 0) + total
        turno_activo.cantidad_devoluciones = (turno_activo.cantidad_devoluciones or 0) + 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Devolución procesada exitosamente',
            'ticket_number': ticket_number,
            'devolucion_id': nueva_devolucion.id,
            'total': total,
            'nuevo_stock': article.stock
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error en devolución: {str(e)}")
        return jsonify({'error': f'Error al procesar la devolución: {str(e)}'}), 500

@app.route('/returns', methods=['GET'])
@login_required
def get_returns():
    try:
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        if not turno_activo:
            return jsonify([])
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        devoluciones = Devolucion.query.filter_by(turno_id=turno_activo.id)\
                                     .order_by(Devolucion.fecha_devolucion.desc())\
                                     .paginate(page=page, per_page=per_page, error_out=False)
        
        devoluciones_data = []
        for devolucion in devoluciones.items:
            devolucion_data = {
                'id': devolucion.id,
                'ticket_number': devolucion.ticket_number,
                'article_title': devolucion.article_title,
                'quantity': devolucion.quantity,
                'unit_price': devolucion.unit_price,
                'total': devolucion.total,
                'motivo': devolucion.motivo,
                'fecha_devolucion': devolucion.fecha_devolucion.strftime('%Y-%m-%d %H:%M:%S'),
                'usuario': devolucion.user.username if devolucion.user else 'Desconocido'
            }
            devoluciones_data.append(devolucion_data)
        
        return jsonify({
            'returns': devoluciones_data,
            'total_pages': devoluciones.pages,
            'current_page': devoluciones.page,
            'total_returns': devoluciones.total
        })
        
    except Exception as e:
        print(f"Error obteniendo devoluciones: {str(e)}")
        return jsonify({'error': 'Error al obtener devoluciones'}), 500

@app.route('/returns/<int:turno_id>', methods=['GET'])
@login_required
def get_returns_by_turno(turno_id):
    try:
        # Verificar que el turno existe
        turno = Turno.query.get(turno_id)
        if not turno:
            return jsonify({'error': 'Turno no encontrado'}), 404
        
        # Obtener devoluciones del turno
        devoluciones = Devolucion.query.filter_by(turno_id=turno_id)\
                                     .order_by(Devolucion.fecha_devolucion.desc())\
                                     .all()
        
        devoluciones_data = []
        for devolucion in devoluciones:
            devolucion_data = {
                'id': devolucion.id,
                'ticket_number': devolucion.ticket_number,
                'article_title': devolucion.article_title,
                'quantity': devolucion.quantity,
                'unit_price': devolucion.unit_price,
                'total': devolucion.total,
                'motivo': devolucion.motivo,
                'fecha_devolucion': devolucion.fecha_devolucion.isoformat(),
                'usuario': devolucion.user.username if devolucion.user else 'Desconocido'
            }
            devoluciones_data.append(devolucion_data)
        
        return jsonify(devoluciones_data)
        
    except Exception as e:
        print(f"Error obteniendo devoluciones del turno: {str(e)}")
        return jsonify({'error': 'Error al obtener devoluciones del turno'}), 500

# =====================
# TURNOS
# =====================

@app.route('/close-turno', methods=['POST'])
@login_required
def close_turno():
    try:
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        
        if not turno_activo:
            return jsonify({'error': 'No hay turno activo'}), 400
        
        # Cerrar turno
        turno_activo.fecha_cierre = datetime.now(timezone.utc)  # ← CAMBIAR
        turno_activo.activo = False
        
        db.session.commit()
        
        # Preparar resumen del turno
        resumen = {
            'turno_id': turno_activo.id,
            'fecha_inicio': turno_activo.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'),
            'fecha_cierre': turno_activo.fecha_cierre.strftime('%Y-%m-%d %H:%M:%S'),
            'total_ventas': float(turno_activo.total_ventas or 0),
            'total_efectivo': float(turno_activo.total_efectivo or 0),
            'total_tarjeta': float(turno_activo.total_tarjeta or 0),
            'cantidad_ventas': turno_activo.cantidad_ventas or 0,
            'usuario': turno_activo.user.username if turno_activo.user else 'Desconocido'
        }
        
        return jsonify({
            'message': 'Turno cerrado exitosamente',
            'resumen': resumen
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al cerrar turno: {str(e)}")
        return jsonify({'error': 'Error interno al cerrar turno'}), 500

@app.route('/turno-actual', methods=['GET'])
@login_required
def get_turno_actual():
    try:
        turno_activo = Turno.query.filter_by(user_id=session['user_id'], activo=True).first()
        
        if not turno_activo:
            return jsonify({'turno_activo': False})
        
        return jsonify({
            'turno_activo': True,
            'turno_id': turno_activo.id,
            'fecha_inicio': turno_activo.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'),
            'total_ventas': turno_activo.total_ventas or 0,
            'total_efectivo': turno_activo.total_efectivo or 0,
            'total_tarjeta': turno_activo.total_tarjeta or 0,
            'cantidad_ventas': turno_activo.cantidad_ventas or 0,
            'total_devoluciones': turno_activo.total_devoluciones or 0,  # ← AGREGAR
            'cantidad_devoluciones': turno_activo.cantidad_devoluciones or 0  # ← AGREGAR
        })
        
    except Exception as e:
        return jsonify({'error': 'Error al obtener turno'}), 500

@app.route('/historial-turnos', methods=['GET'])
@login_required
def get_historial_turnos():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        turnos = Turno.query.filter_by(activo=False).order_by(Turno.fecha_cierre.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        turnos_data = []
        for turno in turnos.items:
            turno_data = {
                'id': turno.id,
                'usuario': turno.user.username,
                'fecha_inicio': turno.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S'),
                'fecha_cierre': turno.fecha_cierre.strftime('%Y-%m-%d %H:%M:%S') if turno.fecha_cierre else None,
                'total_ventas': turno.total_ventas or 0,
                'total_efectivo': turno.total_efectivo or 0,
                'total_tarjeta': turno.total_tarjeta or 0,
                'cantidad_ventas': turno.cantidad_ventas or 0
            }
            turnos_data.append(turno_data)
        
        return jsonify({
            'turnos': turnos_data,
            'total_pages': turnos.pages,
            'current_page': turnos.page,
            'total_turnos': turnos.total
        })
        
    except Exception as e:
        return jsonify({'error': 'Error al obtener historial de turnos'}), 500

@app.route('/turnos-historial', methods=['GET'])
@login_required
def get_turnos_historial():
    try:
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        
        query = db.session.query(
            Turno.id.label('turno_id'),
            Turno.fecha_inicio,
            Turno.fecha_cierre,
            User.username.label('usuario'),
            func.coalesce(func.sum(Sale.total), 0).label('total_ventas'),
            func.coalesce(func.sum(case((Sale.metodo_pago == 'efectivo', Sale.total), else_=0)), 0).label('total_efectivo'),
            func.coalesce(func.sum(case((Sale.metodo_pago == 'tarjeta', Sale.total), else_=0)), 0).label('total_tarjeta'),
            func.coalesce(func.count(Sale.id), 0).label('cantidad_ventas'),
            # Campos de devoluciones
            func.coalesce(Turno.total_devoluciones, 0).label('total_devoluciones'),
            func.coalesce(Turno.cantidad_devoluciones, 0).label('cantidad_devoluciones')
        ).join(User, Turno.user_id == User.id)\
         .outerjoin(Sale, Turno.id == Sale.turno_id)\
         .filter(Turno.activo == False)
        
        if fecha_inicio and fecha_fin:
            query = query.filter(
                func.date(Turno.fecha_inicio) >= fecha_inicio,
                func.date(Turno.fecha_inicio) <= fecha_fin
            )
        
        turnos = query.group_by(Turno.id)\
                      .order_by(Turno.fecha_inicio.desc())\
                      .all()
        
        return jsonify([{
            'turno_id': turno.turno_id,
            'fecha_inicio': turno.fecha_inicio.isoformat(),
            'fecha_cierre': turno.fecha_cierre.isoformat() if turno.fecha_cierre else None,
            'usuario': turno.usuario,
            'total_ventas': float(turno.total_ventas),
            'total_efectivo': float(turno.total_efectivo),
            'total_tarjeta': float(turno.total_tarjeta),
            'cantidad_ventas': turno.cantidad_ventas,
            'total_devoluciones': float(turno.total_devoluciones),  
            'cantidad_devoluciones': turno.cantidad_devoluciones  
        } for turno in turnos])
        
    except Exception as e:
        print(f"Error en turnos-historial: {str(e)}")
        return jsonify({'error': 'Error al obtener historial de turnos'}), 500

@app.route('/turnos/<int:turno_id>/ventas', methods=['GET'])
@login_required
def get_ventas_turno(turno_id):
    try:
        # Verificar que el turno existe
        turno = Turno.query.get(turno_id)
        if not turno:
            return jsonify({'error': 'Turno no encontrado'}), 404
        
        # Obtener ventas del turno
        ventas = Sale.query.filter_by(turno_id=turno_id)\
                          .order_by(Sale.fecha_venta.desc())\
                          .all()
        
        result = []
        for venta in ventas:
            # Obtener items de la venta
            items = SaleItem.query.filter_by(sale_id=venta.id).all()
            
            venta_data = {
                'id': venta.id,
                'ticket_number': venta.ticket_number,
                'total': float(venta.total),
                'metodo_pago': venta.metodo_pago,
                'fecha_venta': venta.fecha_venta.isoformat(),
                'user': venta.user.username if venta.user else 'Desconocido',
                'items_count': len(items),
                'items': []
            }
            
            # Agregar items de la venta
            for item in items:
                item_data = {
                    'article_title': item.article_title,
                    'quantity': item.quantity,
                    'unit_price': float(item.unit_price),
                    'subtotal': float(item.subtotal)
                }
                venta_data['items'].append(item_data)
            
            result.append(venta_data)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error al obtener ventas del turno: {str(e)}")
        return jsonify({'error': 'Error al obtener ventas del turno'}), 500

if __name__ == '__main__':
    app.run(debug=True)
