'use client';

import React, { useState } from 'react';
import api from '@/services/api';

interface NotesModalProps {
  saleId: number | null;
  currentNote?: string;
  onNoteSaved: (note: string) => void;
  onClose: () => void;
}

export default function NotesModal({ saleId, currentNote = '', onNoteSaved, onClose }: NotesModalProps) {
  const [note, setNote] = useState(currentNote);
  const [loading, setLoading] = useState(false);

  const handleSaveNote = async () => {
    if (saleId) {
      // Guardando nota para venta ya completada
      try {
        setLoading(true);
        const response = await api.put(`/sales/${saleId}/note`, {
          nota: note.trim()
        });
        
        if (response.data.success) {
          onNoteSaved(note.trim());
          onClose();
          alert('Nota guardada exitosamente');
        }
      } catch (error: any) {
        console.error('Error guardando nota:', error);
        if (error.response?.data?.error) {
          alert(error.response.data.error);
        } else {
          alert('Error al guardar la nota');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Guardando nota para venta futura
      onNoteSaved(note.trim());
      onClose();
      alert('Nota guardada. Se aplicará a la próxima venta.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveNote();
    }
  };

  return (
    <div 
      className="modal d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-sticky-note me-2 text-warning"></i>
              {saleId 
                ? (currentNote ? 'Editar Nota' : 'Agregar Nota a la Venta')
                : 'Nota para Próxima Venta'
              }
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">
                <strong>Nota de la venta:</strong>
              </label>
              <textarea
                className="form-control"
                rows={6}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe aquí cualquier información adicional sobre esta venta...&#10;&#10;Ejemplos:&#10;- Cliente pidió bolsa adicional&#10;- Descuento especial autorizado por gerencia&#10;- Producto entregado en domicilio&#10;- Observaciones especiales"
                maxLength={1000}
              />
              <div className="form-text">
                <small className="text-muted">
                  {note.length}/1000 caracteres
                  {note.length > 0 && (
                    <span className="ms-3">
                      <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para guardar rápido
                    </span>
                  )}
                </small>
              </div>
            </div>

            {currentNote && (
              <div className="alert alert-info">
                <small>
                  <i className="fas fa-info-circle me-1"></i>
                  Esta venta ya tiene una nota. Puedes editarla o dejarla en blanco para eliminarla.
                </small>
              </div>
            )}
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
              onClick={handleSaveNote}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  {currentNote ? 'Actualizar Nota' : 'Guardar Nota'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}