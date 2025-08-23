// components/SuspendedSalesManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { SuspendedSale, CartItem } from '@/types';

interface SuspendedSalesManagerProps {
  onResumeCart: (items: CartItem[], suspendedSaleId: number) => void;
  onClose: () => void;
}

export default function SuspendedSalesManager({ onResumeCart, onClose }: SuspendedSalesManagerProps) {
  const [suspendedSales, setSuspendedSales] = useState<SuspendedSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuspendedSales();
  }, []);

  const loadSuspendedSales = async () => {
    try {
      const response = await api.get('/sales/suspended');
      setSuspendedSales(response.data);
    } catch (error) {
      console.error('Error cargando ventas suspendidas:', error);
      alert('Error al cargar ventas suspendidas');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSale = async (suspendedSale: SuspendedSale) => {
    try {
      const response = await api.post(`/sales/suspended/${suspendedSale.id}/resume`);
      
      if (response.data.success) {
        onResumeCart(response.data.cart_items, suspendedSale.id);
        onClose();
      }
    } catch (error: any) {
      console.error('Error retomando venta:', error);
      alert(error.response?.data?.error || 'Error al retomar venta');
    }
  };

  const handleDeleteSale = async (suspendedSale: SuspendedSale) => {
    if (!confirm(`¿Eliminar venta suspendida ${suspendedSale.ticket_number}?`)) return;

    try {
      const response = await api.delete(`/sales/suspended/${suspendedSale.id}`);
      
      if (response.data.success) {
        setSuspendedSales(suspendedSales.filter(s => s.id !== suspendedSale.id));
        alert('Venta suspendida eliminada');
      }
    } catch (error: any) {
      console.error('Error eliminando venta:', error);
      alert(error.response?.data?.error || 'Error al eliminar venta');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES');
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" />
        <p>Cargando ventas suspendidas...</p>
      </div>
    );
  }

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">
              ⏸️ Ventas Suspendidas ({suspendedSales.length})
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {suspendedSales.length === 0 ? (
              <div className="text-center text-muted py-4">
                <h5>No hay ventas suspendidas</h5>
                <p>Las ventas que suspendas aparecerán aquí</p>
              </div>
            ) : (
              <div className="row">
                {suspendedSales.map(sale => (
                  <div key={sale.id} className="col-md-6 col-lg-4 mb-3">
                    <div className="card h-100 border-warning">
                      <div className="card-header bg-warning text-dark">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>{sale.ticket_number}</strong>
                          <span className="badge bg-dark">
                            {sale.items_count} items
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Total: ${sale.total.toFixed(2)}</strong>
                        </div>
                        
                        <div className="mb-2">
                          <small className="text-muted">
                            Suspendida: {formatearFecha(sale.fecha_suspension)}
                          </small>
                        </div>
                        
                        {sale.nota && (
                          <div className="mb-2">
                            <small>
                              <strong>Nota:</strong> {sale.nota}
                            </small>
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <strong>Productos:</strong>
                          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {sale.items.map((item, index) => (
                              <div key={index} className="d-flex justify-content-between small">
                                <span>{item.title}</span>
                                <span>{item.quantity}x ${item.precio}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-footer">
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleResumeSale(sale)}
                          >
                            ▶️ Retomar Venta
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteSale(sale)}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}