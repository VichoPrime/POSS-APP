'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ConteoItem {
  id: number;
  article_id: number;
  article_title: string;
  article_unit_type: string;
  cantidad_sistema: number;
  cantidad_fisica: number | null;
  diferencia: number | null;
  estado: string;
  notas: string;
  tiene_diferencia: boolean;
}

interface SessionStats {
  total_productos: number;
  contados: number;
  pendientes: number;
  con_diferencias: number;
  progreso: number;
}

interface InventorySession {
  session_id: string;
  fecha_conteo: string;
  usuario_conteo: string;
  total_productos: number;
  contados: number;
  ajustados: number;
  con_diferencias: number;
  estado: string;
}

export default function PhysicalInventoryPage() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [conteos, setConteos] = useState<ConteoItem[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [sessions, setSessions] = useState<InventorySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/physical-inventory/sessions', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrar sesiones duplicadas por session_id para evitar claves duplicadas
        const uniqueSessions = data.sessions?.filter((session: InventorySession, index: number, self: InventorySession[]) => 
          self.findIndex(s => s.session_id === session.session_id) === index
        ) || [];
        setSessions(uniqueSessions);
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    }
  };

  const startNewSession = async () => {
    if (!confirm('¿Estás seguro de iniciar un nuevo conteo físico? Esto creará una nueva sesión para todos los productos activos.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/physical-inventory/start', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session_id);
        loadSessionData(data.session_id);
        loadSessions(); // Recargar historial
        alert(`Sesión iniciada exitosamente. ${data.total_products} productos listos para contar.`);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/physical-inventory/${sessionId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConteos(data.conteos || []);
        setStats(data.estadisticas || null);
      }
    } catch (error) {
      console.error('Error al cargar datos de sesión:', error);
    }
  };

  const updatePhysicalCount = async (conteoId: number, cantidad: number, notas: string = '') => {
    try {
      const response = await fetch(`http://localhost:5000/physical-inventory/${conteoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          cantidad_fisica: cantidad,
          notas: notas,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Actualizar el item en la lista
        setConteos(prev => prev.map(item => 
          item.id === conteoId ? data.conteo : item
        ));
        // Recargar estadísticas
        if (currentSession) {
          loadSessionData(currentSession);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al actualizar conteo');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const applyAdjustments = async (adjustAll: boolean = false) => {
    if (!currentSession) return;

    const itemsToAdjust = adjustAll 
      ? conteos.filter(c => c.tiene_diferencia)
      : conteos.filter(c => selectedItems.includes(c.id) && c.tiene_diferencia);

    if (itemsToAdjust.length === 0) {
      alert('No hay items con diferencias para ajustar');
      return;
    }

    const message = adjustAll 
      ? `¿Estás seguro de aplicar ajustes a TODOS los ${itemsToAdjust.length} productos con diferencias?`
      : `¿Estás seguro de aplicar ajustes a los ${itemsToAdjust.length} productos seleccionados?`;

    if (!confirm(message)) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/physical-inventory/${currentSession}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adjust_all: adjustAll,
          selected_ids: adjustAll ? [] : selectedItems,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setSelectedItems([]);
        loadSessionData(currentSession);
        loadSessions();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al aplicar ajustes');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const filteredConteos = conteos.filter(conteo => {
    const matchesSearch = conteo.article_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifference = !showOnlyDifferences || conteo.tiene_diferencia;
    return matchesSearch && matchesDifference;
  });

  const toggleSelectItem = (conteoId: number) => {
    setSelectedItems(prev => 
      prev.includes(conteoId) 
        ? prev.filter(id => id !== conteoId)
        : [...prev, conteoId]
    );
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
              <h2>Conteo Físico de Inventario</h2>
            </div>
            <button
              className="btn btn-success"
              onClick={startNewSession}
              disabled={loading}
            >
              {loading ? 'Iniciando...' : '📊 Nuevo Conteo'}
            </button>
          </div>

          {/* Estadísticas de sesión actual */}
          {currentSession && stats && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5>Sesión Actual: {currentSession.substring(0, 8)}...</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="text-center">
                      <h3 className="text-primary">{stats.total_productos}</h3>
                      <small>Total Productos</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h3 className="text-success">{stats.contados}</h3>
                      <small>Contados</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h3 className="text-warning">{stats.pendientes}</h3>
                      <small>Pendientes</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h3 className="text-danger">{stats.con_diferencias}</h3>
                      <small>Con Diferencias</small>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${stats.progreso}%` }}
                    >
                      {stats.progreso.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controles y filtros */}
          {currentSession && (
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={showOnlyDifferences}
                        onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                      />
                      <label className="form-check-label">
                        Solo mostrar diferencias
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => applyAdjustments(false)}
                      disabled={selectedItems.length === 0 || loading}
                    >
                      Ajustar Seleccionados ({selectedItems.length})
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => applyAdjustments(true)}
                      disabled={!stats || stats.con_diferencias === 0 || loading}
                    >
                      Ajustar Todas las Diferencias
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de conteo */}
          {currentSession && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Productos para Contar</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(filteredConteos.filter(c => c.tiene_diferencia).map(c => c.id));
                              } else {
                                setSelectedItems([]);
                              }
                            }}
                          />
                        </th>
                        <th>Producto</th>
                        <th>Stock Sistema</th>
                        <th>Stock Físico</th>
                        <th>Diferencia</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConteos.map((conteo, index) => (
                        <tr key={`conteo-${conteo.id}-${index}`} className={conteo.tiene_diferencia ? 'table-warning' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(conteo.id)}
                              onChange={() => toggleSelectItem(conteo.id)}
                              disabled={!conteo.tiene_diferencia}
                            />
                          </td>
                          <td>
                            <strong>{conteo.article_title}</strong>
                            <br />
                            <small className="text-muted">ID: {conteo.article_id}</small>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {conteo.cantidad_sistema} {conteo.article_unit_type === 'peso' ? 'kg' : 'unidades'}
                            </span>
                          </td>
                          <td>
                            {conteo.estado === 'pendiente' ? (
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                step={conteo.article_unit_type === 'peso' ? '0.01' : '1'}
                                min="0"
                                placeholder="Cantidad física"
                                onBlur={(e) => {
                                  const valor = parseFloat(e.target.value);
                                  if (!isNaN(valor) && valor >= 0) {
                                    updatePhysicalCount(conteo.id, valor);
                                  }
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const valor = parseFloat(e.currentTarget.value);
                                    if (!isNaN(valor) && valor >= 0) {
                                      updatePhysicalCount(conteo.id, valor);
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <span className="badge bg-success">
                                {conteo.cantidad_fisica} {conteo.article_unit_type === 'peso' ? 'kg' : 'unidades'}
                              </span>
                            )}
                          </td>
                          <td>
                            {conteo.diferencia !== null ? (
                              <span className={`badge ${conteo.diferencia > 0 ? 'bg-success' : conteo.diferencia < 0 ? 'bg-danger' : 'bg-secondary'}`}>
                                {conteo.diferencia > 0 ? '+' : ''}{conteo.diferencia}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${
                              conteo.estado === 'pendiente' ? 'bg-warning' : 
                              conteo.estado === 'contado' ? 'bg-primary' : 'bg-success'
                            }`}>
                              {conteo.estado}
                            </span>
                          </td>
                          <td>
                            {conteo.estado === 'contado' && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  const newValue = prompt('Nueva cantidad física:', conteo.cantidad_fisica?.toString());
                                  if (newValue !== null) {
                                    const valor = parseFloat(newValue);
                                    if (!isNaN(valor) && valor >= 0) {
                                      updatePhysicalCount(conteo.id, valor);
                                    }
                                  }
                                }}
                              >
                                Editar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredConteos.length === 0 && (
                    <div className="text-center mt-3">
                      <p className="text-muted">No hay productos que mostrar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Historial de sesiones */}
          <div className="card">
            <div className="card-header">
              <h5>Historial de Conteos</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Productos</th>
                      <th>Contados</th>
                      <th>Ajustados</th>
                      <th>Con Diferencias</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, index) => (
                      <tr key={`session-${session.session_id}-${index}`}>
                        <td>{new Date(session.fecha_conteo).toLocaleString()}</td>
                        <td>{session.usuario_conteo}</td>
                        <td>{session.total_productos}</td>
                        <td>{session.contados}</td>
                        <td>{session.ajustados}</td>
                        <td>
                          {session.con_diferencias > 0 && (
                            <span className="badge bg-warning">{session.con_diferencias}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${session.estado === 'Completado' ? 'bg-success' : 'bg-warning'}`}>
                            {session.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setCurrentSession(session.session_id);
                              loadSessionData(session.session_id);
                            }}
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sessions.length === 0 && (
                  <div className="text-center mt-3">
                    <p className="text-muted">No hay sesiones de conteo registradas</p>
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