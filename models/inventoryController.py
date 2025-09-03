from flask import Blueprint, request, jsonify, redirect, url_for, flash, render_template, session
from app import login_required
from models import db, Article, Category, InventoryMovement, MovementType

inventory_bp = Blueprint('inventory', __name__)  # 👈 sin url_prefix

# =========================
# CRUD DE PRODUCTOS
# =========================

@inventory_bp.route('/articles', methods=['GET'])
@login_required
def get_articles():
    category_id = request.args.get('category_id')
    if category_id:
        articles = Article.query.filter_by(category_id=category_id, activo=True).all()
    else:
        articles = Article.query.filter_by(activo=True).all()
    return jsonify([{
        'id': a.id,
        'title': a.title,
        'precio': float(a.precio),
        'stock': a.stock,
        'min_stock': a.min_stock,
        'unidad_medida': a.unidad_medida,
        'category_id': a.category_id,
        'activo': a.activo
    } for a in articles])

@inventory_bp.route('/articles', methods=['POST'])
@login_required
def create_article():
    data = request.get_json()
    required = ['title','content','stock','codigo_barra','precio','category_id']
    if not all(k in data for k in required):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    article = Article(
        title=data['title'],
        content=data['content'],
        stock=int(data['stock']),
        min_stock=int(data.get('min_stock', 0)),
        unidad_medida=data.get('unidad_medida','unidad'),
        codigo_barra=data['codigo_barra'],
        precio=float(data['precio']),
        category_id=int(data['category_id']),
        activo=data.get('activo', True)
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({'id': article.id, 'title': article.title})

@inventory_bp.route('/articles/<int:id>', methods=['PUT'])
@login_required
def update_article(id):
    article = Article.query.get_or_404(id)
    data = request.get_json()
    if 'title' in data: article.title = data['title']
    if 'stock' in data: article.stock = int(data['stock'])
    if 'min_stock' in data: article.min_stock = int(data['min_stock'])
    if 'unidad_medida' in data: article.unidad_medida = data['unidad_medida']
    if 'precio' in data: article.precio = float(data['precio'])
    if 'activo' in data: article.activo = data['activo']
    db.session.commit()
    return jsonify({'message': 'Artículo actualizado'})

@inventory_bp.route('/articles/<int:id>', methods=['DELETE'])
@login_required
def delete_article(id):
    article = Article.query.get_or_404(id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': f'Artículo {article.title} eliminado'})

@inventory_bp.route('/articles/barcode/<string:barcode>', methods=['GET'])
@login_required
def get_article_by_barcode(barcode):
    article = Article.query.filter_by(codigo_barra=barcode, activo=True).first()
    if not article:
        return jsonify({'error':'Artículo no encontrado'}),404
    return jsonify({'id': article.id,'title':article.title,'stock':article.stock,'unidad_medida':article.unidad_medida})

# =========================
# CATEGORÍAS
# =========================

@inventory_bp.route('/categories', methods=['GET'])
@login_required
def get_categories():
    cats = Category.query.all()
    return jsonify([{'id':c.id,'name':c.name} for c in cats])

@inventory_bp.route('/categories', methods=['POST'])
@login_required
def create_category():
    data = request.get_json()
    name = data['name'].strip().capitalize()
    if Category.query.filter_by(name=name).first():
        return jsonify({'error':'La categoría ya existe'}),400
    cat = Category(name=name)
    db.session.add(cat)
    db.session.commit()
    return jsonify({'id':cat.id,'name':cat.name})

# =========================
# MOVIMIENTOS DE INVENTARIO (CU 14, 16, 18, 19, 20)
# =========================

# CU 14: Ajustar stock manualmente
@inventory_bp.route('/ajustar-stock', methods=['POST'])
@login_required
def ajustar_stock():
    data = request.get_json()
    article_id = data.get('article_id')
    cantidad = data.get('cantidad')
    motivo = data.get('motivo', 'Ajuste manual')

    articulo = Article.query.get(article_id)
    if not articulo:
        return jsonify({'error': 'Artículo no encontrado'}), 404

    try:
        cantidad = int(cantidad)
    except ValueError:
        return jsonify({'error': 'Cantidad inválida'}), 400

    articulo.stock += cantidad
    db.session.commit()

    InventoryMovement.log_movement(
        article_id=article_id,
        type=MovementType.AJUSTE,
        quantity=cantidad,
        user_id=session['user_id'],
        reason=motivo
    )

    return jsonify({'message': f'Stock de {articulo.title} actualizado', 'nuevo_stock': articulo.stock})


# CU 16: Alertas de stock mínimo
@inventory_bp.route('/alertas-stock', methods=['GET'])
@login_required
def alertas_stock():
    productos_alerta = Article.query.filter(
        Article.stock <= Article.min_stock,
        Article.activo == True
    ).all()
    data = [{
        'id': p.id,
        'title': p.title,
        'stock': p.stock,
        'min_stock': p.min_stock,
        'unidad_medida': p.unidad_medida
    } for p in productos_alerta]
    return jsonify(data)


# CU 18: Historial de movimientos
@inventory_bp.route('/movimientos', methods=['GET'])
@login_required
def historial_movimientos():
    movimientos = InventoryMovement.query.order_by(InventoryMovement.created_at.desc()).all()
    data = []
    for m in movimientos:
        data.append({
            'id': m.id,
            'article': m.article.title if m.article else 'Desconocido',
            'unidad_medida': m.article.unidad_medida if m.article else '',
            'type': m.type.value,
            'quantity': m.quantity,
            'reason': m.reason,
            'usuario': m.responsible.username if m.responsible else 'Desconocido',
            'fecha': m.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(data)


# CU 19: Marcar productos dañados o vencidos
@inventory_bp.route('/marcar-danado', methods=['POST'])
@login_required
def marcar_danado():
    data = request.get_json()
    article_id = data.get('article_id')
    cantidad = data.get('cantidad')
    motivo = data.get('motivo', 'Producto dañado/vencido')

    articulo = Article.query.get(article_id)
    if not articulo:
        return jsonify({'error': 'Artículo no encontrado'}), 404

    try:
        cantidad = int(cantidad)
    except ValueError:
        return jsonify({'error': 'Cantidad inválida'}), 400

    if articulo.stock < cantidad:
        return jsonify({'error': 'Cantidad mayor al stock disponible'}), 400

    articulo.stock -= cantidad
    if articulo.stock == 0:
        articulo.activo = False
    db.session.commit()

    InventoryMovement.log_movement(
        article_id=article_id,
        type=MovementType.VENCIDO,
        quantity=-cantidad,
        user_id=session['user_id'],
        reason=motivo
    )

    return jsonify({'message': f'{cantidad} {articulo.unidad_medida} de {articulo.title} marcados como {motivo}', 'nuevo_stock': articulo.stock})


# CU 20: Conteo físico
@inventory_bp.route('/conteo-fisico', methods=['POST'])
@login_required
def conteo_fisico():
    data = request.get_json()
    article_id = data.get('article_id')
    stock_fisico = data.get('stock_fisico')

    articulo = Article.query.get(article_id)
    if not articulo:
        return jsonify({'error': 'Artículo no encontrado'}), 404

    try:
        stock_fisico = int(stock_fisico)
    except ValueError:
        return jsonify({'error': 'Cantidad inválida'}), 400

    diferencia = stock_fisico - articulo.stock
    articulo.stock = stock_fisico
    db.session.commit()

    InventoryMovement.log_movement(
        article_id=article_id,
        type=MovementType.CONTEO_FISICO,
        quantity=diferencia,
        user_id=session['user_id'],
        reason="Ajuste por inventario físico"
    )

    return jsonify({'message': f'Stock de {articulo.title} actualizado según conteo físico. Diferencia: {diferencia}', 'nuevo_stock': articulo.stock})
