'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { useAuth } from '@/hooks/useAuth';
import PermissionGuard from '@/components/PermissionGuard';
import HelpButton from '@/components/HelpButton';

interface Product {
  id?: number;
  title: string;
  content: string;
  precio: number;
  stock: number;
  stock_minimo?: number;
  is_low_stock?: boolean;
  codigo_barra?: string;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  activo: boolean;
  unit_type: 'unidades' | 'peso'; // Nuevo campo para tipo de medida
  peso_unitario?: number; // Para productos por peso
  margen_ganancia?: number; // Margen de ganancia en pesos chilenos (para todos los productos)
}

interface Category {
  id: number;
  name: string;
}

export default function ProductManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Protección de autenticación y permisos
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);
  
  // Estados para gestión de categorías
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState<Product>({
    title: '',
    content: '',
    precio: 0,
    stock: 0,
    stock_minimo: 5,
    codigo_barra: '',
    category_id: undefined,
    image_url: '',
    activo: true,
    unit_type: 'unidades',
    peso_unitario: undefined,
    margen_ganancia: 0
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/articles');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor ingrese el nombre de la categoría');
      return;
    }

    try {
      const response = await api.post('/categories', {
        name: newCategoryName.trim()
      });
      
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setShowCategoryForm(false);
      alert('Categoría creada exitosamente');
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al crear la categoría');
      }
    }
  };

  const updateFrequentCategory = async () => {
    try {
      const response = await api.post('/categories/update-frequent');
      
      if (response.data.message) {
        alert('Categoría de productos frecuentes actualizada exitosamente');
        // Recargar productos y categorías para mostrar los cambios
        loadProducts();
        loadCategories();
      }
    } catch (error: any) {
      console.error('Error updating frequent category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error al actualizar la categoría de productos frecuentes');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;
      
      // Subir imagen si hay una nueva
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = {
        ...formData,
        image_url: imageUrl || '',
        // Convertir campos numéricos
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        peso_unitario: formData.unit_type === 'peso' ? Number(formData.peso_unitario) : undefined,
        category_id: formData.category_id || null
      };

      if (editingProduct) {
        // Actualizar producto existente
        await api.put(`/articles/${editingProduct.id}`, productData);
        alert('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        await api.post('/articles', productData);
        alert('Producto creado exitosamente');
      }

      // Resetear formulario
      setFormData({
        title: '',
        content: '',
        precio: 0,
        stock: 0,
        codigo_barra: '',
        category_id: undefined,
        image_url: '',
        activo: true,
        unit_type: 'unidades',
        peso_unitario: undefined
      });
      setEditingProduct(null);
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
      
      // Recargar productos
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setImagePreview(product.image_url || null);
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const response = await api.delete(`/articles/${productId}`);
      
      // Manejar diferentes tipos de respuesta del backend
      if (response.data.type === 'deactivated') {
        alert(response.data.message);
      } else if (response.data.type === 'deleted') {
        alert(response.data.message);
      } else {
        alert(response.data.message || 'Producto procesado exitosamente');
      }
      
      await loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      // Manejar errores específicos
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error.response?.status === 403) {
        alert('No tienes permisos para eliminar productos');
      } else if (error.response?.status === 404) {
        alert('Producto no encontrado');
      } else {
        alert('Error al procesar la eliminación del producto');
      }
    }
  };

  const handleReactivate = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres reactivar este producto?')) return;

    try {
      await api.put(`/articles/${productId}`, { activo: true });
      alert('Producto reactivado exitosamente');
      await loadProducts();
    } catch (error: any) {
      console.error('Error reactivating product:', error);
      
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error.response?.status === 403) {
        alert('No tienes permisos para reactivar productos');
      } else {
        alert('Error al reactivar el producto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      precio: 0,
      stock: 0,
      codigo_barra: '',
      category_id: undefined,
      image_url: '',
      activo: true,
      unit_type: 'unidades',
      peso_unitario: undefined
    });
    setEditingProduct(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="can_manage_products">
      <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-primary me-3"
                onClick={() => window.location.href = '/'}
              >
                ← Volver a Caja
              </button>
              <h1>Gestión de Productos</h1>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-warning"
                onClick={updateFrequentCategory}
                title="Actualizar categoría de productos frecuentes"
              >
                <i className="fas fa-star me-2"></i>
                Actualizar Frecuentes
              </button>
              <PermissionGuard permission="can_manage_products">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  + Agregar Producto
                </button>
              </PermissionGuard>
            </div>
          </div>

          {/* Formulario de Producto */}
          <PermissionGuard permission="can_manage_products">
            {showForm && (
              <div className="card mb-4">
                <div className="card-header">
                  <h5>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nombre del Producto *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Precio ($) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.precio}
                          onChange={(e) => setFormData({...formData, precio: parseInt(e.target.value) || 0})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tipo de Medida</label>
                        <select
                          className="form-control"
                          value={formData.unit_type}
                          onChange={(e) => setFormData({...formData, unit_type: e.target.value as 'unidades' | 'peso'})}
                        >
                          <option value="unidades">Por Unidades</option>
                          <option value="peso">Por Peso (kg)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          {formData.unit_type === 'peso' ? 'Stock Total (kg)' : 'Stock (unidades)'}
                        </label>
                        <input
                          type="number"
                          step={formData.unit_type === 'peso' ? '0.001' : '1'}
                          className="form-control"
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          {formData.unit_type === 'peso' ? 'Stock Mínimo (kg)' : 'Stock Mínimo (unidades)'}
                        </label>
                        <input
                          type="number"
                          step={formData.unit_type === 'peso' ? '0.001' : '1'}
                          className="form-control"
                          value={formData.stock_minimo || 5}
                          onChange={(e) => setFormData({...formData, stock_minimo: Number(e.target.value)})}
                          required
                        />
                        <small className="text-muted">Cantidad mínima antes de mostrar alerta de bajo stock</small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Margen de Ganancia ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.margen_ganancia || ''}
                          onChange={(e) => setFormData({...formData, margen_ganancia: parseInt(e.target.value) || 0})}
                          placeholder="Ej: 500"
                        />
                        <small className="text-muted">
                          Ganancia en pesos chilenos {formData.unit_type === 'peso' ? 'por kilogramo' : 'por unidad'}
                        </small>
                        {formData.margen_ganancia && formData.precio && (
                          <div className="mt-1">
                            <small className="text-info">
                              Precio costo: ${(formData.precio - formData.margen_ganancia)}{formData.unit_type === 'peso' ? '/kg' : '/unidad'}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {formData.unit_type === 'peso' && (
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Peso por Unidad (kg)</label>
                          <input
                            type="number"
                            step="0.001"
                            className="form-control"
                            value={formData.peso_unitario || ''}
                            onChange={(e) => setFormData({...formData, peso_unitario: Number(e.target.value)})}
                            placeholder="Ej: 0.5 para 500g"
                          />
                          <small className="text-muted">Opcional: peso promedio por unidad</small>
                        </div>
                      </div>
                      <div className="col-md-6">
                        {/* Campo vacío para mantener la estructura */}
                      </div>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Código de Barras (Opcional)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.codigo_barra}
                          onChange={(e) => setFormData({...formData, codigo_barra: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Categoría</label>
                        <div className="d-flex gap-2">
                          <select
                            className="form-control"
                            value={formData.category_id || ''}
                            onChange={(e) => setFormData({...formData, category_id: Number(e.target.value) || undefined})}
                          >
                            <option value="">Sin categoría</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => setShowCategoryForm(true)}
                            title="Crear nueva categoría"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Imagen del Producto (Opcional)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{maxWidth: '200px', maxHeight: '200px'}} 
                          className="img-thumbnail"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.activo}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                    />
                    <label className="form-check-label">Producto Activo</label>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')} Producto
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          </PermissionGuard>

          {/* Lista de Productos */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Productos Registrados ({products.filter(p => showInactiveProducts ? true : p.activo).length})</h5>
              <div className="form-check">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="showInactive"
                  checked={showInactiveProducts}
                  onChange={(e) => setShowInactiveProducts(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showInactive">
                  Mostrar productos inactivos
                </label>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Tipo</th>
                      <th>Código</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(product => showInactiveProducts ? true : product.activo)
                      .map(product => (
                      <tr key={product.id} className={!product.activo ? 'table-secondary text-muted' : ''}>
                        <td>
                          <div className="position-relative">
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                alt={product.title}
                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                className={`rounded ${!product.activo ? 'opacity-50' : ''}`}
                              />
                            ) : (
                              <div 
                                className={`bg-light d-flex align-items-center justify-content-center rounded ${!product.activo ? 'opacity-50' : ''}`}
                                style={{width: '50px', height: '50px'}}
                              >
                                📦
                              </div>
                            )}
                            {!product.activo && (
                              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">
                                Inactivo
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong className={!product.activo ? 'text-muted' : ''}>{product.title}</strong>
                            {!product.activo && (
                              <span className="badge bg-secondary ms-2">Inactivo</span>
                            )}
                            {product.content && <br />}
                            <small className="text-muted">{product.content}</small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>${product.precio}</strong>
                            {product.margen_ganancia && (
                              <>
                                <br />
                                <small className="text-success">
                                  Margen: ${product.margen_ganancia}{product.unit_type === 'peso' ? '/kg' : '/unidad'}
                                </small>
                                <br />
                                <small className="text-muted">
                                  Costo: ${(product.precio - product.margen_ganancia)}{product.unit_type === 'peso' ? '/kg' : '/unidad'}
                                </small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            {product.stock} {product.unit_type === 'peso' ? 'kg' : 'unidades'}
                            {product.stock_minimo && (
                              <>
                                <br />
                                <small className="text-muted">Mín: {product.stock_minimo}</small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${product.unit_type === 'peso' ? 'bg-info' : 'bg-secondary'}`}>
                            {product.unit_type === 'peso' ? 'Peso' : 'Unidades'}
                          </span>
                        </td>
                        <td>{product.codigo_barra || '-'}</td>
                        <td>
                          {product.is_low_stock || (product.stock_minimo && product.stock <= product.stock_minimo) ? (
                            <span className="badge bg-danger">
                              Bajo Stock
                            </span>
                          ) : (
                            <span className={`badge ${product.activo ? 'bg-success' : 'bg-secondary'}`}>
                              {product.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          )}
                        </td>
                        <td>
                          <PermissionGuard permission="can_manage_products">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => handleEdit(product)}
                              >
                                Editar
                              </button>
                              <button 
                                className={`btn ${product.activo ? 'btn-outline-danger' : 'btn-outline-warning'}`}
                                onClick={() => product.activo ? handleDelete(product.id!) : handleReactivate(product.id!)}
                              >
                                {product.activo ? 'Eliminar' : 'Reactivar'}
                              </button>
                            </div>
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {products.filter(product => showInactiveProducts ? true : product.activo).length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      {showInactiveProducts 
                        ? 'No hay productos registrados' 
                        : 'No hay productos activos. Activa la opción "Mostrar productos inactivos" para ver todos los productos.'
                      }
                    </p>
                    <PermissionGuard permission="can_manage_products">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                      >
                        Agregar {products.length === 0 ? 'primer' : 'nuevo'} producto
                      </button>
                    </PermissionGuard>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal para crear categoría */}
      {showCategoryForm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Crear Nueva Categoría</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setNewCategoryName('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nombre de la Categoría</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ej: Bebidas, Comidas, etc."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        createCategory();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setNewCategoryName('');
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={createCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Crear Categoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botón de Ayuda Flotante */}
      <HelpButton />
    </div>
    </PermissionGuard>
  );
}