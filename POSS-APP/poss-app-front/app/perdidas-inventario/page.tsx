'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface Product {
  id: number;
  title: string;
  content: string;
  precio: number;
  stock: number;
  unit_type: string;
  codigo_barra?: string;
}

interface InventoryLoss {
  id: number;
  article_id: number;
  article_title: string;
  article_unit_type: string;
  cantidad_perdida: number;
  tipo_perdida: string;
  motivo: string;
  fecha_registro: string;
  usuario_registro: string;
}

interface StockAlert {
  id: number;
  title: string;
  stock_actual: number;
  stock_minimo: number;
  unit_type: string;
  category_name: string;
  total_losses: number;
  losses_detail: {
    vencido: number;
    dañado: number;
  };
  stock_status: string;
}

export default function InventoryLossesPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [losses, setLosses] = useState<InventoryLoss[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [quantity, setQuantity] = useState<number>(0);
  const [lossType, setLossType] = useState<'vencido' | 'dañado'>('vencido');
  const [reason, setReason] = useState('');

  // Filtros
  const [filterProduct, setFilterProduct] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchLosses();
      fetchStockAlerts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/articles', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const fetchLosses = async () => {
    try {
      const response = await fetch('http://localhost:5000/inventory-losses', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLosses(data.losses || []);
      }
    } catch (error) {
      console.error('Error al cargar pérdidas:', error);
    }
  };

  const fetchStockAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/articles/stock-report', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStockAlerts(data.low_stock_articles || []);
      }
    } catch (error) {
      console.error('Error al cargar alertas de stock:', error);
    }
  };

  const handleSubmitLoss = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity <= 0) {
      alert('Por favor selecciona un producto y cantidad válida');
      return;
    }

    if (quantity > selectedProduct.stock) {
      alert(`Stock insuficiente. Stock actual: ${selectedProduct.stock}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/inventory-losses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          article_id: selectedProduct.id,
          cantidad_perdida: quantity,
          tipo_perdida: lossType,
          motivo: reason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Pérdida registrada exitosamente. Nuevo stock: ${data.new_stock}`);
        
        // Resetear form
        setSelectedProduct(null);
        setQuantity(0);
        setReason('');
        setShowAddForm(false);
        
        // Recargar datos
        fetchProducts();
        fetchLosses();
        fetchStockAlerts();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al registrar pérdida');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.codigo_barra && product.codigo_barra.includes(searchTerm))
  );

  const filteredLosses = losses.filter(loss => {
    const matchesProduct = !filterProduct || loss.article_title.toLowerCase().includes(filterProduct.toLowerCase());
    const matchesType = !filterType || loss.tipo_perdida === filterType;
    return matchesProduct && matchesType;
  });

  const totalLosses = {
    vencido: losses.filter(l => l.tipo_perdida === 'vencido').reduce((sum, l) => sum + l.cantidad_perdida, 0),
    dañado: losses.filter(l => l.tipo_perdida === 'dañado').reduce((sum, l) => sum + l.cantidad_perdida, 0),
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Debes iniciar sesión para acceder a esta página.
        </div>
      </div>
    );
  }

  return (
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
              <h2>Gestión de Pérdidas de Inventario</h2>
            </div>
            <button
              className="btn btn-warning"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancelar' : '+ Registrar Pérdida'}
            </button>
          </div>

          {/* Tarjetas de resumen */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-danger text-white">
                <div className="card-body">
                  <h5>Productos Vencidos</h5>
                  <h3>{totalLosses.vencido.toFixed(2)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h5>Productos Dañados</h5>
                  <h3>{totalLosses.dañado.toFixed(2)}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-dark text-white">
                <div className="card-body">
                  <h5>Total Pérdidas</h5>
                  <h3>{(totalLosses.vencido + totalLosses.dañado).toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas de Stock Bajo */}
          {stockAlerts.length > 0 && (
            <div className="card mb-4">
              <div className="card-header bg-warning text-dark">
                <h5>⚠️ Alertas de Stock Bajo ({stockAlerts.length} productos)</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Pérdidas Totales</th>
                        <th>Vencidos</th>
                        <th>Dañados</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockAlerts.map(alert => (
                        <tr key={alert.id} className={alert.stock_status === 'critico' ? 'table-danger' : 'table-warning'}>
                          <td>
                            <strong>{alert.title}</strong>
                            <br />
                            <small className="text-muted">{alert.category_name}</small>
                          </td>
                          <td>
                            <span className={`badge ${alert.stock_actual === 0 ? 'bg-danger' : 'bg-warning'}`}>
                              {alert.stock_actual} {alert.unit_type === 'peso' ? 'kg' : 'unidades'}
                            </span>
                          </td>
                          <td>{alert.stock_minimo} {alert.unit_type === 'peso' ? 'kg' : 'unidades'}</td>
                          <td>
                            {alert.total_losses > 0 ? (
                              <span className="text-danger">
                                {alert.total_losses} {alert.unit_type === 'peso' ? 'kg' : 'unidades'}
                              </span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td>
                            {alert.losses_detail.vencido > 0 ? (
                              <span className="text-danger">{alert.losses_detail.vencido}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td>
                            {alert.losses_detail.dañado > 0 ? (
                              <span className="text-warning">{alert.losses_detail.dañado}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${alert.stock_status === 'critico' ? 'bg-danger' : 'bg-warning'}`}>
                              {alert.stock_status === 'critico' ? 'CRÍTICO' : 'BAJO'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2">
                  <small className="text-muted">
                    💡 Los productos con stock crítico (0) necesitan reposición inmediata.
                    Las pérdidas por vencimiento y daños se descuentan automáticamente del stock.
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Formulario para registrar pérdida */}
          {showAddForm && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Registrar Nueva Pérdida</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitLoss}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Buscar Producto</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre o código de barras..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Producto Seleccionado</label>
                      <input
                        type="text"
                        className="form-control"
                        readOnly
                        value={selectedProduct ? `${selectedProduct.title} (Stock: ${selectedProduct.stock})` : 'Ninguno'}
                      />
                    </div>
                  </div>

                  {searchTerm && (
                    <div className="mb-3">
                      <label className="form-label">Resultados de búsqueda</label>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className={`d-flex justify-content-between align-items-center p-2 border-bottom cursor-pointer ${
                              selectedProduct?.id === product.id ? 'bg-primary text-white' : ''
                            }`}
                            onClick={() => setSelectedProduct(product)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div>
                              <strong>{product.title}</strong>
                              <br />
                              <small>{product.content}</small>
                              {product.codigo_barra && (
                                <><br /><small>Código: {product.codigo_barra}</small></>
                              )}
                            </div>
                            <div className="text-end">
                              <span className="badge bg-info">
                                Stock: {product.stock} {product.unit_type === 'peso' ? 'kg' : 'unidades'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">
                        Cantidad Perdida {selectedProduct?.unit_type === 'peso' ? '(kg)' : '(unidades)'}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                        step={selectedProduct?.unit_type === 'peso' ? '0.01' : '1'}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Tipo de Pérdida</label>
                      <select
                        className="form-control"
                        value={lossType}
                        onChange={(e) => setLossType(e.target.value as 'vencido' | 'dañado')}
                        required
                      >
                        <option value="vencido">Vencido</option>
                        <option value="dañado">Dañado</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Motivo (opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Descripción del motivo..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={loading || !selectedProduct || quantity <= 0}
                  >
                    {loading ? 'Registrando...' : 'Registrar Pérdida'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Historial de pérdidas */}
          <div className="card">
            <div className="card-header">
              <h5>Historial de Pérdidas</h5>
              <div className="row mt-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filtrar por producto..."
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <select
                    className="form-control"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="vencido">Vencido</option>
                    <option value="dañado">Dañado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Tipo</th>
                      <th>Motivo</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLosses.map(loss => (
                      <tr key={loss.id}>
                        <td>{new Date(loss.fecha_registro).toLocaleString()}</td>
                        <td>{loss.article_title}</td>
                        <td>
                          {loss.cantidad_perdida} {loss.article_unit_type === 'peso' ? 'kg' : 'unidades'}
                        </td>
                        <td>
                          <span className={`badge ${loss.tipo_perdida === 'vencido' ? 'bg-danger' : 'bg-warning'}`}>
                            {loss.tipo_perdida}
                          </span>
                        </td>
                        <td>{loss.motivo || '-'}</td>
                        <td>{loss.usuario_registro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLosses.length === 0 && (
                  <div className="text-center mt-3">
                    <p className="text-muted">No hay pérdidas registradas</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}