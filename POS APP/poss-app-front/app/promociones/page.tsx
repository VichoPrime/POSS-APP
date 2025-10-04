'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface Promotion {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  condiciones: any;
  descuento_tipo: string;
  descuento_valor: number;
  activo: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  dias_semana: number[] | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  usos_maximos_dia: number | null;
  prioridad: number;
  is_active: boolean;
}

interface Product {
  id: number;
  title: string;
  precio: number;
  stock: number;
  unit_type: string;
}

export default function PromocionesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'descuento_general',
    descuento_tipo: 'porcentaje',
    descuento_valor: 0,
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    usos_maximos_dia: '',
    prioridad: 1,
    activo: true,
    // Condiciones específicas
    minimo_compra: '',
    cantidad_minima: '',
    producto_especifico: '',
    productos_combo: [] as Array<{id: number, cantidad: number}>
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPromotions();
      loadProducts();
    }
  }, [isAuthenticated]);

  const loadPromotions = async () => {
    try {
      const response = await api.get('/promotions');
      setPromotions(response.data.promotions || []);
    } catch (error) {
      console.error('Error cargando promociones:', error);
      alert('Error al cargar promociones');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products/simple');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    try {
      // Construir condiciones según el tipo de promoción
      let condiciones: any = {};
      
      if (formData.tipo === 'descuento_general' && formData.minimo_compra) {
        condiciones.minimo_compra = parseFloat(formData.minimo_compra);
      }
      
      if (formData.tipo === 'combo' && formData.productos_combo.length > 0) {
        condiciones.productos = formData.productos_combo;
      }
      
      if (formData.tipo === 'descuento_cantidad') {
        if (formData.cantidad_minima) {
          condiciones.cantidad_minima = parseInt(formData.cantidad_minima);
        }
        if (formData.producto_especifico) {
          condiciones.product_id = parseInt(formData.producto_especifico);
        }
      }

      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        condiciones: JSON.stringify(condiciones),
        descuento_tipo: formData.descuento_tipo,
        descuento_valor: formData.descuento_valor,
        usos_maximos_dia: formData.usos_maximos_dia ? parseInt(formData.usos_maximos_dia) : null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        prioridad: formData.prioridad,
        activo: formData.activo
      };

      if (editingPromotion) {
        await api.put(`/promotions/${editingPromotion.id}`, dataToSend);
        alert('Promoción actualizada exitosamente');
      } else {
        await api.post('/promotions', dataToSend);
        alert('Promoción creada exitosamente');
      }

      setShowCreateModal(false);
      setEditingPromotion(null);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      console.error('Error guardando promoción:', error);
      alert(error.response?.data?.error || 'Error al guardar promoción');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    const condiciones = promotion.condiciones || {};
    setFormData({
      nombre: promotion.nombre,
      descripcion: promotion.descripcion,
      tipo: promotion.tipo,
      descuento_tipo: promotion.descuento_tipo,
      descuento_valor: promotion.descuento_valor,
      fecha_inicio: promotion.fecha_inicio || '',
      fecha_fin: promotion.fecha_fin || '',
      hora_inicio: promotion.hora_inicio || '',
      hora_fin: promotion.hora_fin || '',
      usos_maximos_dia: promotion.usos_maximos_dia?.toString() || '',
      prioridad: promotion.prioridad,
      activo: promotion.activo,
      minimo_compra: condiciones.minimo_compra?.toString() || '',
      cantidad_minima: condiciones.cantidad_minima?.toString() || '',
      producto_especifico: condiciones.product_id?.toString() || '',
      productos_combo: condiciones.productos || []
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (promotionId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta promoción?')) return;

    try {
      await api.delete(`/promotions/${promotionId}`);
      alert('Promoción eliminada exitosamente');
      loadPromotions();
    } catch (error) {
      console.error('Error eliminando promoción:', error);
      alert('Error al eliminar promoción');
    }
  };

  const handleToggleActive = async (promotionId: number) => {
    try {
      await api.post(`/promotions/${promotionId}/toggle`);
      loadPromotions();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('Error al cambiar estado de la promoción');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'descuento_general',
      descuento_tipo: 'porcentaje',
      descuento_valor: 0,
      fecha_inicio: '',
      fecha_fin: '',
      hora_inicio: '',
      hora_fin: '',
      usos_maximos_dia: '',
      prioridad: 1,
      activo: true,
      minimo_compra: '',
      cantidad_minima: '',
      producto_especifico: '',
      productos_combo: []
    });
  };

  const addProductToCombo = () => {
    setFormData({
      ...formData,
      productos_combo: [...formData.productos_combo, { id: 0, cantidad: 1 }]
    });
  };

  const removeProductFromCombo = (index: number) => {
    const newProductos = formData.productos_combo.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      productos_combo: newProductos
    });
  };

  const updateProductCombo = (index: number, field: 'id' | 'cantidad', value: number) => {
    const newProductos = [...formData.productos_combo];
    newProductos[index][field] = value;
    setFormData({
      ...formData,
      productos_combo: newProductos
    });
  };

  if (loading) {
    return <div className="container mt-5"><div className="text-center">Cargando...</div></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Gestión de Promociones</h2>
            <div>
              <button 
                className="btn btn-primary me-2"
                onClick={() => {
                  resetForm();
                  setEditingPromotion(null);
                  setShowCreateModal(true);
                }}
              >
                + Nueva Promoción
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => router.push('/')}
              >
                Volver al POS
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Descuento</th>
                      <th>Vigencia</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map(promotion => (
                      <tr key={promotion.id}>
                        <td>
                          <strong>{promotion.nombre}</strong>
                          {promotion.descripcion && (
                            <div className="text-muted small">{promotion.descripcion}</div>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info">{promotion.tipo}</span>
                        </td>
                        <td>
                          {promotion.descuento_tipo === 'porcentaje' 
                            ? `${promotion.descuento_valor}%` 
                            : `$${promotion.descuento_valor}`
                          }
                        </td>
                        <td>
                          {promotion.fecha_inicio && promotion.fecha_fin ? (
                            <div>
                              <div>{promotion.fecha_inicio} al {promotion.fecha_fin}</div>
                              {promotion.hora_inicio && promotion.hora_fin && (
                                <div className="text-muted small">
                                  {promotion.hora_inicio} - {promotion.hora_fin}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">Sin restricción</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className={`badge ${promotion.activo ? 'bg-success' : 'bg-secondary'} me-2`}>
                              {promotion.activo ? 'Activa' : 'Inactiva'}
                            </span>
                            {promotion.is_active && (
                              <span className="badge bg-primary">En vigencia</span>
                            )}
                          </div>
                        </td>
                        <td>{promotion.prioridad}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(promotion)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              className={`btn ${promotion.activo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => handleToggleActive(promotion.id)}
                              title={promotion.activo ? 'Desactivar' : 'Activar'}
                            >
                              {promotion.activo ? '⏸️' : '▶️'}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(promotion.id)}
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {promotions.length === 0 && (
                  <div className="text-center text-muted py-4">
                    No hay promociones creadas. ¡Crea tu primera promoción!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de crear/editar promoción */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nombre *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tipo</label>
                        <select
                          className="form-select"
                          value={formData.tipo}
                          onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                        >
                          <option value="descuento_general">Descuento General</option>
                          <option value="combo">Combo</option>
                          <option value="descuento_cantidad">Descuento por Cantidad</option>
                          <option value="segundo_gratis">Segundo Gratis</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    />
                  </div>

                  {/* Condiciones específicas según el tipo */}
                  {formData.tipo === 'descuento_general' && (
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">Condiciones del Descuento General</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label className="form-label">Monto Mínimo de Compra ($)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.minimo_compra}
                            onChange={(e) => setFormData({...formData, minimo_compra: e.target.value})}
                            placeholder="Ej: 50 (para aplicar descuento en compras superiores a $50)"
                            min="0"
                            step="0.01"
                          />
                          <div className="form-text">
                            Si no se especifica, el descuento se aplica a cualquier compra
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.tipo === 'combo' && (
                    <div className="card mb-3">
                      <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Productos del Combo</h6>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={addProductToCombo}
                          >
                            + Agregar Producto
                          </button>
                        </div>
                      </div>
                      <div className="card-body">
                        {formData.productos_combo.length === 0 ? (
                          <div className="text-muted text-center py-3">
                            No hay productos en el combo. Agrega productos para crear la promoción.
                          </div>
                        ) : (
                          formData.productos_combo.map((producto, index) => (
                            <div key={index} className="row mb-2 align-items-end">
                              <div className="col-md-6">
                                <label className="form-label">Producto</label>
                                <select
                                  className="form-select"
                                  value={producto.id}
                                  onChange={(e) => updateProductCombo(index, 'id', parseInt(e.target.value))}
                                >
                                  <option value={0}>Seleccionar producto...</option>
                                  {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                      {product.title} - ${product.precio}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Cantidad</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={producto.cantidad}
                                  onChange={(e) => updateProductCombo(index, 'cantidad', parseInt(e.target.value) || 1)}
                                  min="1"
                                />
                              </div>
                              <div className="col-md-2">
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm w-100"
                                  onClick={() => removeProductFromCombo(index)}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {formData.tipo === 'descuento_cantidad' && (
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">Condiciones de Cantidad</h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Cantidad Mínima</label>
                              <input
                                type="number"
                                className="form-control"
                                value={formData.cantidad_minima}
                                onChange={(e) => setFormData({...formData, cantidad_minima: e.target.value})}
                                placeholder="Ej: 3"
                                min="1"
                              />
                              <div className="form-text">
                                Cantidad mínima de productos para aplicar descuento
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Producto Específico (Opcional)</label>
                              <select
                                className="form-select"
                                value={formData.producto_especifico}
                                onChange={(e) => setFormData({...formData, producto_especifico: e.target.value})}
                              >
                                <option value="">Todos los productos</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.id}>
                                    {product.title} - ${product.precio}
                                  </option>
                                ))}
                              </select>
                              <div className="form-text">
                                Si no se especifica, aplica a cualquier producto
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tipo de Descuento</label>
                        <select
                          className="form-select"
                          value={formData.descuento_tipo}
                          onChange={(e) => setFormData({...formData, descuento_tipo: e.target.value})}
                        >
                          <option value="porcentaje">Porcentaje</option>
                          <option value="cantidad_fija">Cantidad Fija</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Valor del Descuento</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.descuento_valor}
                          onChange={(e) => setFormData({...formData, descuento_valor: parseFloat(e.target.value) || 0})}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha Inicio</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.fecha_inicio}
                          onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha Fin</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.fecha_fin}
                          onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Hora Inicio</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.hora_inicio}
                          onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Hora Fin</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.hora_fin}
                          onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Prioridad</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.prioridad}
                          onChange={(e) => setFormData({...formData, prioridad: parseInt(e.target.value) || 1})}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Usos Máximos por Día</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.usos_maximos_dia}
                      onChange={(e) => setFormData({...formData, usos_maximos_dia: e.target.value})}
                      min="1"
                      placeholder="Sin límite"
                    />
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    />
                    <label className="form-check-label">
                      Promoción activa
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPromotion ? 'Actualizar' : 'Crear'} Promoción
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}