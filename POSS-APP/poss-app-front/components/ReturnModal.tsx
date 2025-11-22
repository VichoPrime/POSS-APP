// components/ReturnModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Product } from '@/types';

interface ReturnModalProps {
  onReturned: () => void;
  onClose: () => void;
}

export default function ReturnModal({ onReturned, onClose }: ReturnModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchProducts();
    } else {
      setProducts([]);
    }
  }, [searchTerm]);

  const searchProducts = async () => {
    try {
      setSearchLoading(true);
      const response = await api.get('/articles');
      const filteredProducts = response.data.filter((product: Product) => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)
      );
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error buscando productos:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProducts([]);
    setSearchTerm('');
  };

  const handleReturn = async () => {
    if (!selectedProduct || !motivo.trim()) {
      alert('Por favor selecciona un producto y especifica el motivo');
      return;
    }

    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post('/returns', {
        article_id: selectedProduct.id,
        quantity: quantity,
        motivo: motivo.trim()
      });

      if (response.data.success) {
        alert(`Devolución procesada: ${response.data.ticket_number}\nNuevo stock: ${response.data.nuevo_stock}`);
        onReturned();
        onClose();
      }
    } catch (error: any) {
      console.error('Error procesando devolución:', error);
      alert(error.response?.data?.error || 'Error al procesar devolución');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">
              ↩️ Procesar Devolución
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Buscar producto */}
            <div className="mb-3">
              <label className="form-label">
                <strong>Buscar Producto:</strong>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              {searchLoading && (
                <div className="text-center mt-2">
                  <div className="spinner-border spinner-border-sm" />
                </div>
              )}
              
              {products.length > 0 && (
                <div className="list-group mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {products.map(product => (
                    <button
                      key={product.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{product.title}</strong>
                          <br />
                          <small className="text-muted">
                            Código: {product.barcode} | Stock: {product.stock}
                          </small>
                        </div>
                        <span className="badge bg-primary">${product.precio}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Producto seleccionado */}
            {selectedProduct && (
              <div className="mb-3">
                <label className="form-label">
                  <strong>Producto Seleccionado:</strong>
                </label>
                <div className="card">
                  <div className="card-body">
                    <h6>{selectedProduct.title}</h6>
                    <p className="mb-1">
                      <strong>Precio:</strong> ${selectedProduct.precio}
                    </p>
                    <p className="mb-0">
                      <strong>Stock actual:</strong> {selectedProduct.stock}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cantidad */}
            <div className="mb-3">
              <label className="form-label">
                <strong>Cantidad a devolver:</strong>
              </label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={!selectedProduct}
              />
            </div>

            {/* Motivo */}
            <div className="mb-3">
              <label className="form-label">
                <strong>Motivo de la devolución:</strong> <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Especifica el motivo de la devolución..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={500}
              />
              <div className="form-text">
                {motivo.length}/500 caracteres
              </div>
            </div>

            {/* Total de la devolución */}
            {selectedProduct && (
              <div className="mb-3">
                <div className="alert alert-info">
                  <strong>Total a devolver:</strong> ${(selectedProduct.precio * quantity).toFixed(2)}
                </div>
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
              className="btn btn-danger" 
              onClick={handleReturn}
              disabled={loading || !selectedProduct || !motivo.trim()}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" />
                  Procesando...
                </>
              ) : (
                '↩️ Procesar Devolución'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}