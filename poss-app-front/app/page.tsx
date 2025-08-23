'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import api from '@/services/api';
import { Product, TurnoResumen, CartItem } from '@/types'; 
import SuspendedSalesManager from '@/components/SuspendedSalesManager';
import LoginForm from '@/components/LoginForm';
import SuspendSaleModal from '@/components/SuspendSaleModal';
import ReturnModal from '@/components/ReturnModal';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, restoreCart } = useCart();
  
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTurnoSummary, setShowTurnoSummary] = useState(false);
  const [turnoSummaryData, setTurnoSummaryData] = useState<TurnoResumen | null>(null);
  const [showSuspendedSales, setShowSuspendedSales] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [currentSuspendedSaleId, setCurrentSuspendedSaleId] = useState<number | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isAuthenticated]);

  // Verificar producto seleccionado desde búsqueda manual
  useEffect(() => {
    if (isAuthenticated) {
      checkSelectedProduct();
    }
  }, [isAuthenticated]);

  const checkSelectedProduct = () => {
    const selectedProduct = localStorage.getItem('selectedProduct');
    if (selectedProduct) {
      try {
        const product = JSON.parse(selectedProduct);
        setCurrentProduct(product);
        localStorage.removeItem('selectedProduct');
      } catch (error) {
        console.error('Error al parsear producto seleccionado:', error);
        localStorage.removeItem('selectedProduct');
      }
    }
  };

  const searchByBarcode = async (barcode: string) => {
    if (!barcode.trim() || !isAuthenticated) return;

    try {
      const response = await api.get(`/articles/barcode/${barcode}`);
      setCurrentProduct(response.data);
    } catch (error) {
      alert('Producto no encontrado');
      setCurrentProduct(null);
    }
  };

  const handleAddToCart = () => {
    if (currentProduct) {
      try {
        addToCart(currentProduct);
        setCurrentProduct(null);
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al agregar al carrito');
      }
    }
  };

  const goToBuscarProductos = () => {
    router.push('/buscar-productos');
  };

  const processSale = async (metodoPago: 'efectivo' | 'tarjeta') => {
    if (cart.length === 0) return;

    try {
      const response = await api.post('/sales', {
        cart_items: cart.map(item => ({
          id: item.id,
          title: item.title,
          precio: item.precio,
          quantity: item.quantity
        })),
        metodo_pago: metodoPago,
        suspended_sale_id: currentSuspendedSaleId
      });

      if (response.data.success) {
        alert(`Venta procesada: Ticket ${response.data.ticket_number} - Total: $${response.data.total}`);
        clearCart();
        setCurrentProduct(null);
        setCurrentSuspendedSaleId(null);
        setShowPaymentModal(false);
        
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }
    } catch (error: any) {
      console.error('Error procesando venta:', error);
      alert(error.response?.data?.error || 'Error al procesar la venta');
    }
  };

  const closeTurno = async () => {
    if (!confirm('¿Está seguro de que desea cerrar el turno?')) return;

    try {
      const response = await api.post('/close-turno');
      setTurnoSummaryData(response.data.resumen);
      setShowTurnoSummary(true);
    } catch (error) {
      alert('Error al cerrar turno');
    }
  };

  const finalizarTurno = async () => {
    clearCart();
    localStorage.removeItem('cart');
    await logout();
    setShowTurnoSummary(false);
    alert('Turno cerrado correctamente. ¡Hasta la próxima!');
  };

  const handleSuspendSale = () => {
    if (cart.length === 0) {
      alert('No hay productos en el carrito para suspender');
      return;
    }
    setShowSuspendModal(true);
  };

  const handleSuspended = () => {
    clearCart();
    setCurrentSuspendedSaleId(null);
  };

  const handleResumeCart = (items: CartItem[], suspendedSaleId: number) => {
    clearCart();
    restoreCart(items);
    setCurrentSuspendedSaleId(suspendedSaleId);
  };

  const handleCompleteSale = async (metodo_pago: 'efectivo' | 'tarjeta') => {
    try {
      const response = await api.post('/sales', {
        cart_items: cart.map(item => ({  // ← CAMBIAR aquí también
          id: item.id,
          title: item.title,
          precio: item.precio,
          quantity: item.quantity
        })),
        metodo_pago: metodo_pago,
        suspended_sale_id: currentSuspendedSaleId
      });

      if (response.data.success) {
        alert(`Venta completada: ${response.data.ticket_number}`);
        clearCart();
        setCurrentSuspendedSaleId(null);
      }
    } catch (error: any) {
      console.error('Error procesando venta:', error);
      alert(error.response?.data?.error || 'Error al procesar la venta');
    }
  };

  const handleReturnProduct = () => {
    setShowReturnModal(true);
  };

  const handleReturned = () => {
    // Refrescar datos del turno si es necesario
    console.log('Devolución procesada exitosamente');
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {!isAuthenticated ? (
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header text-center">
                <h4>Sistema POS</h4>
              </div>
              <div className="card-body">
                <LoginForm onLogin={login} />
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Usuario de prueba: admin@pos.com / 123456
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row bg-primary text-white p-3 mb-4">
            <div className="col-md-6">
              <h4>Sistema POS - Caja de Ventas</h4>
              <span>Usuario: {user?.username}</span>
              {currentSuspendedSaleId && (
                <div className="mt-1">
                  <span className="badge bg-warning text-dark">
                    ⏸️ Venta Retomada
                  </span>
                </div>
              )}
            </div>
            <div className="col-md-6 text-end">
              <button 
                className="btn btn-warning me-2" 
                onClick={() => setShowSuspendedSales(true)}
              >
                ⏸️ Ventas Suspendidas
              </button>
              <button 
                className="btn btn-danger me-2" 
                onClick={handleReturnProduct}
              >
                ↩️ Devoluciones
              </button>
              <button 
                className="btn btn-info me-2" 
                onClick={() => router.push('/historial-turnos')}
              >
                📊 Historial Turnos
              </button>
              <button className="btn btn-danger me-2" onClick={closeTurno}>
                Cerrar Turno
              </button>
              <button className="btn btn-outline-light" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h4>Caja de Ventas</h4>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        className="form-control"
                        placeholder="Escanear o escribir código de barras..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            searchByBarcode(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        style={{ fontSize: '1.2em', padding: '10px' }}
                      />
                    </div>
                    <div className="col-md-4">
                      <button 
                        className="btn btn-primary w-100"
                        onClick={goToBuscarProductos}
                      >
                        Buscar Productos Manualmente
                      </button>
                    </div>
                  </div>

                  {currentProduct && (
                    <div className="alert alert-info">
                      <h6>Producto Seleccionado:</h6>
                      <div>
                        <strong>{currentProduct.title}</strong><br />
                        <span className="text-muted">{currentProduct.content}</span><br />
                        <strong>Precio: ${currentProduct.precio}</strong><br />
                        <span className="badge bg-info">Stock: {currentProduct.stock}</span>
                      </div>
                      <button className="btn btn-success btn-sm mt-2 me-2" onClick={handleAddToCart}>
                        Agregar al Carrito
                      </button>
                      <button className="btn btn-secondary btn-sm mt-2" onClick={() => setCurrentProduct(null)}>
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>🛒 Carrito ({cart.length})</h5>
                  {cart.length > 0 && (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={handleSuspendSale}
                    >
                      ⏸️ Suspender
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {cart.length === 0 ? (
                    <p className="text-muted">El carrito está vacío</p>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="border rounded p-2 mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{item.title}</strong><br />
                            <small>${item.precio.toFixed(2)} x {item.quantity}</small>
                          </div>
                          <div className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                              >
                                -
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                +
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => removeFromCart(index)}
                              >
                                ×
                              </button>
                            </div>
                            <div className="mt-1">
                              <strong>${(item.precio * item.quantity).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="bg-light p-3 rounded mt-3">
                    <h5>Total: ${getTotal().toFixed(2)}</h5>
                    <button 
                      className="btn btn-success w-100 mt-2"
                      onClick={() => setShowPaymentModal(true)}
                      disabled={cart.length === 0}
                    >
                      Procesar Venta
                    </button>
                    <button 
                      className="btn btn-warning w-100 mt-2"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      Limpiar Carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de pago */}
      {showPaymentModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Método de Pago</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <h4 className="text-center mb-4">Total a pagar: ${getTotal().toFixed(2)}</h4>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success btn-lg"
                    onClick={() => processSale('efectivo')}
                  >
                    💵 Efectivo
                  </button>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={() => processSale('tarjeta')}
                  >
                    💳 Tarjeta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de resumen de turno */}
      {showTurnoSummary && turnoSummaryData && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">✅ Turno Cerrado Exitosamente</h5>
              </div>
              <div className="modal-body text-center">
                <h4>Resumen del Turno</h4>
                <p><strong>Cajero:</strong> {turnoSummaryData.usuario}</p>
                <p><strong>Total de Ventas:</strong> {turnoSummaryData.cantidad_ventas}</p>
                <p><strong>💵 Efectivo:</strong> ${turnoSummaryData.total_efectivo.toFixed(2)}</p>
                <p><strong>💳 Tarjeta:</strong> ${turnoSummaryData.total_tarjeta.toFixed(2)}</p>
                <h5 className="text-success"><strong>Total: ${turnoSummaryData.total_ventas.toFixed(2)}</strong></h5>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-success" onClick={finalizarTurno}>
                  🚪 Finalizar y Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componentes de ventas suspendidas */}
      {showSuspendedSales && (
        <SuspendedSalesManager
          onResumeCart={handleResumeCart}
          onClose={() => setShowSuspendedSales(false)}
        />
      )}

      {showSuspendModal && (
        <SuspendSaleModal
          cart={cart}
          onSuspended={handleSuspended}
          onClose={() => setShowSuspendModal(false)}
        />
      )}

      {showReturnModal && (
        <ReturnModal
          onReturned={handleReturned}
          onClose={() => setShowReturnModal(false)}
        />
      )}
    </div>
  );
}
