// app/historial-turnos/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { TurnoResumen, Sale, Devolucion } from '@/types';

export default function HistorialTurnos() {
  const router = useRouter();
  const [turnos, setTurnos] = useState<TurnoResumen[]>([]);
  const [selectedTurno, setSelectedTurno] = useState<TurnoResumen | null>(null);
  const [ventasTurno, setVentasTurno] = useState<Sale[]>([]);
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showDevoluciones, setShowDevoluciones] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/turnos-historial');
      setTurnos(response.data);
    } catch (error) {
      console.error('Error cargando historial de turnos:', error);
      alert('Error al cargar el historial de turnos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarTurnos = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/turnos-historial', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      });
      setTurnos(response.data);
    } catch (error) {
      console.error('Error filtrando turnos:', error);
      alert('Error al filtrar turnos');
    } finally {
      setLoading(false);
    }
  };

  const verDetalleTurno = async (turno: TurnoResumen) => {
    try {
      setLoadingVentas(true);
      setSelectedTurno(turno);
      
      const response = await api.get(`/turnos/${turno.turno_id}/ventas`);
      setVentasTurno(response.data);
      setShowDetalle(true);
    } catch (error) {
      console.error('Error cargando ventas del turno:', error);
      alert('Error al cargar las ventas del turno');
    } finally {
      setLoadingVentas(false);
    }
  };

  const verDevoluciones = async (turno: TurnoResumen) => {
    try {
      setLoadingVentas(true);
      const response = await api.get(`/returns/${turno.turno_id}`);
      setDevoluciones(response.data);
      setSelectedTurno(turno);
      setShowDevoluciones(true);
    } catch (error) {
      console.error('Error cargando devoluciones:', error);
      alert('Error al cargar devoluciones');
    } finally {
      setLoadingVentas(false);
    }
  };

  const cerrarDetalle = () => {
    setShowDetalle(false);
    setSelectedTurno(null);
    setVentasTurno([]);
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No cerrado';
    
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatearSoloFecha = (fecha: string | null) => {
    if (!fecha) return 'No disponible';
    
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getTotalGeneral = () => {
    return turnos.reduce((total, turno) => total + turno.total_ventas, 0);
  };

  const volverACaja = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando historial de turnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>📊 Historial de Turnos</h4>
              <button 
                className="btn btn-secondary" 
                onClick={volverACaja}
              >
                Volver a Caja
              </button>
            </div>
            <div className="card-body">
              {/* Filtros de fecha */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <label className="form-label">Fecha Inicio:</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fecha Fin:</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={filtrarTurnos}
                  >
                    Filtrar
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setFechaInicio('');
                      setFechaFin('');
                      loadTurnos();
                    }}
                  >
                    Limpiar
                  </button>
                </div>
                <div className="col-md-3 text-end">
                  <div className="bg-success text-white p-2 rounded">
                    <strong>Total General: ${getTotalGeneral().toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              {/* Tabla de turnos */}
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Cajero</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Cierre</th>
                      <th>Ventas</th>
                      <th>💵 Efectivo</th>
                      <th>💳 Tarjeta</th>
                      <th>↩️ Devoluciones</th>
                      <th>💰 Total Neto</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnos.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted">
                          No se encontraron turnos
                        </td>
                      </tr>
                    ) : (
                      turnos.map(turno => {
                        const totalNeto = turno.total_ventas - turno.total_devoluciones;
                        return (
                          <tr key={turno.turno_id}>
                            <td>
                              <strong>{turno.usuario}</strong>
                            </td>
                            <td>
                              {formatearFecha(turno.fecha_inicio)}
                            </td>
                            <td>
                              {formatearFecha(turno.fecha_cierre)}
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {turno.cantidad_ventas}
                              </span>
                            </td>
                            <td>${turno.total_efectivo.toFixed(2)}</td>
                            <td>${turno.total_tarjeta.toFixed(2)}</td>
                            <td>
                              <span className="badge bg-danger">
                                {turno.cantidad_devoluciones}
                              </span>
                              <br />
                              <small>-${turno.total_devoluciones.toFixed(2)}</small>
                            </td>
                            <td>
                              <strong className={totalNeto >= 0 ? 'text-success' : 'text-danger'}>
                                ${totalNeto.toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <div className="btn-group-vertical btn-group-sm">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => verDetalleTurno(turno)}
                                >
                                  👁️ Ventas
                                </button>
                                {turno.cantidad_devoluciones > 0 && (
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => verDevoluciones(turno)}
                                  >
                                    ↩️ Devoluciones
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Resumen estadístico */}
              {turnos.length > 0 && (
                <div className="row mt-4">
                  <div className="col-md-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body text-center">
                        <h5>Total Turnos</h5>
                        <h3>{turnos.length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-info text-white">
                      <div className="card-body text-center">
                        <h5>Total Ventas</h5>
                        <h3>{turnos.reduce((sum, t) => sum + t.cantidad_ventas, 0)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body text-center">
                        <h5>Promedio/Turno</h5>
                        <h3>${(getTotalGeneral() / turnos.length).toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success text-white">
                      <div className="card-body text-center">
                        <h5>Total General</h5>
                        <h3>${getTotalGeneral().toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle del turno */}
      {showDetalle && selectedTurno && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  📊 Detalle del Turno #{selectedTurno.turno_id} - {selectedTurno.usuario}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={cerrarDetalle}
                ></button>
              </div>
              <div className="modal-body">
                {/* Resumen del turno */}
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-2">
                            <strong>Cajero:</strong><br />
                            {selectedTurno.usuario}
                          </div>
                          <div className="col-md-2">
                            <strong>Inicio:</strong><br />
                            {formatearFecha(selectedTurno.fecha_inicio)}
                          </div>
                          <div className="col-md-2">
                            <strong>Cierre:</strong><br />
                            {formatearFecha(selectedTurno.fecha_cierre)}
                          </div>
                          <div className="col-md-2">
                            <strong>Ventas:</strong><br />
                            <span className="badge bg-info fs-6">{selectedTurno.cantidad_ventas}</span>
                          </div>
                          <div className="col-md-2">
                            <strong>💵 Efectivo:</strong><br />
                            ${selectedTurno.total_efectivo.toFixed(2)}
                          </div>
                          <div className="col-md-2">
                            <strong>💳 Tarjeta:</strong><br />
                            ${selectedTurno.total_tarjeta.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de ventas */}
                <h6>Ventas del Turno:</h6>
                {loadingVentas ? (
                  <div className="text-center">
                    <div className="spinner-border" />
                    <p>Cargando ventas...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-striped">
                      <thead className="table-secondary">
                        <tr>
                          <th>Ticket</th>
                          <th>Hora</th>
                          <th>Items</th>
                          <th>Método Pago</th>
                          <th>Total</th>
                          <th>Productos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasTurno.map(venta => (
                          <tr key={venta.id}>
                            <td>
                              <span className="badge bg-secondary">
                                {venta.ticket_number}
                              </span>
                            </td>
                            <td>
                              <small>{formatearFecha(venta.fecha_venta)}</small>
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {venta.items_count}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${venta.metodo_pago === 'efectivo' ? 'bg-success' : 'bg-primary'}`}>
                                {venta.metodo_pago === 'efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
                              </span>
                            </td>
                            <td>
                              <strong>${venta.total.toFixed(2)}</strong>
                            </td>
                            <td>
                              <small>
                                {venta.items.map((item, index) => (
                                  <div key={index}>
                                    {item.article_title} x{item.quantity} = ${item.subtotal.toFixed(2)}
                                  </div>
                                ))}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light">
                <div className="me-auto">
                  <strong>Total del Turno: ${selectedTurno.total_ventas.toFixed(2)}</strong>
                </div>
                <button type="button" className="btn btn-secondary" onClick={cerrarDetalle}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de devoluciones */}
      {showDevoluciones && selectedTurno && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  ↩️ Devoluciones del Turno #{selectedTurno.turno_id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDevoluciones(false)}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-sm table-striped">
                    <thead className="table-secondary">
                      <tr>
                        <th>Ticket</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                        <th>Motivo</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devoluciones.map(devolucion => (
                        <tr key={devolucion.id}>
                          <td><code>{devolucion.ticket_number}</code></td>
                          <td>{devolucion.article_title}</td>
                          <td><span className="badge bg-warning">{devolucion.quantity}</span></td>
                          <td>${devolucion.unit_price.toFixed(2)}</td>
                          <td><strong>${devolucion.total.toFixed(2)}</strong></td>
                          <td>
                            <small>{devolucion.motivo}</small>
                          </td>
                          <td>{formatearFecha(devolucion.fecha_devolucion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3">
                  <strong>Total en Devoluciones: -${selectedTurno.total_devoluciones.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}