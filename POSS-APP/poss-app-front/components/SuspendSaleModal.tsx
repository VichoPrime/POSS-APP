// components/SuspendSaleModal.tsx
'use client';

import React, { useState } from 'react';
import api from '@/services/api';
import { CartItem } from '@/types';

interface SuspendSaleModalProps {
  cart: CartItem[];
  onSuspended: () => void;
  onClose: () => void;
}

export default function SuspendSaleModal({ cart, onSuspended, onClose }: SuspendSaleModalProps) {
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

  const handleSuspend = async () => {
    try {
      setLoading(true);
      
      const response = await api.post('/sales/suspend', {
        cart_items: cart,
        nota: nota.trim()
      });

      if (response.data.success) {
        alert(`Venta suspendida: ${response.data.ticket_number}`);
        onSuspended();
        onClose();
      }
    } catch (error: any) {
      console.error('Error suspendiendo venta:', error);
      alert(error.response?.data?.error || 'Error al suspender venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-warning text-dark">
            <h5 className="modal-title">⏸️ Suspender Venta</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="mb-3">
              <h6>Resumen de la venta:</h6>
              <div className="bg-light p-2 rounded">
                <div className="d-flex justify-content-between">
                  <span>Items: {cart.length}</span>
                  <span><strong>Total: ${total.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>

            <div className="mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {cart.map((item, index) => (
                <div key={index} className="d-flex justify-content-between small mb-1">
                  <span>{item.title}</span>
                  <span>{item.quantity}x ${item.precio} = ${(item.quantity * item.precio).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label className="form-label">Nota (opcional):</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ej: Cliente fue a buscar más dinero..."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                maxLength={200}
              />
              <small className="text-muted">
                {nota.length}/200 caracteres
              </small>
            </div>

            <div className="alert alert-info">
              <small>
                💡 La venta será guardada y podrás retomar donde la dejaste.
                El stock no será afectado hasta completar la venta.
              </small>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-warning" 
              onClick={handleSuspend}
              disabled={loading}
            >
              {loading ? '⏳ Suspendiendo...' : '⏸️ Suspender Venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}