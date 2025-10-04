'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { usePermissions } from '@/components/PermissionGuard';
import api from '@/services/api';
import { Product, TurnoResumen, CartItem } from '@/types'; 
import SuspendedSalesManager from '@/components/SuspendedSalesManager';
import LoginForm from '@/components/LoginForm';
import SuspendSaleModal from '@/components/SuspendSaleModal';
import ReturnModal from '@/components/ReturnModal';
import NotesModal from '@/components/NotesModal';
import HelpButton from '@/components/HelpButton';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, restoreCart } = useCart();
  
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTurnoSummary, setShowTurnoSummary] = useState(false);
  const [turnoSummaryData, setTurnoSummaryData] = useState<TurnoResumen | null>(null);
  const [showSuspendedSales, setShowSuspendedSales] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [currentSuspendedSaleId, setCurrentSuspendedSaleId] = useState<number | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightAmount, setWeightAmount] = useState<number>(1);
  
  // Estados para descuentos
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState<'porcentaje' | 'cantidad_fija'>('porcentaje');
  const [discountValue, setDiscountValue] = useState<number>(0);
  
  // Estados para notas
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [lastSaleNote, setLastSaleNote] = useState<string>('');
  const [pendingNote, setPendingNote] = useState<string>(''); // Para notas de ventas futuras
  
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

  const handleAddToCart = (product: Product) => {
    // Si es un producto por peso, mostrar modal
    if (product.unit_type === 'peso') {
      setShowWeightModal(true);
      return;
    }
    
    // Para productos normales (unidades), usar cantidad 1
    addToCart(product, 1);
    setCurrentProduct(null);
    
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

    const handleAddWeightToCart = (weight: number) => {
    if (currentProduct) {
      console.log(`Agregando ${weight}kg de ${currentProduct.title} al carrito`);
      
      // Usar el segundo parámetro del addToCart para especificar la cantidad
      addToCart(currentProduct, weight);
      setCurrentProduct(null);
      setShowWeightModal(false);
      setWeightAmount(1);
      
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }
  };

  const handleFinalAddToCart = () => {
    console.log('Final add to cart - current weightAmount:', weightAmount);
    handleAddWeightToCart(weightAmount);
  };

  const goToBuscarProductos = () => {
    router.push('/buscar-productos');
  };

  // Funciones para descuentos
  const applyManualDiscount = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (discountValue <= 0) {
      alert('El valor del descuento debe ser mayor a 0');
      return;
    }

    try {
      const response = await api.post('/cart/apply-discount', {
        cart_items: cart.map(item => ({
          id: item.id,
          title: item.title,
          precio: item.precio,
          quantity: item.quantity
        })),
        discount_type: discountType,
        discount_value: discountValue,
        description: `Descuento ${discountType === 'porcentaje' ? `${discountValue}%` : `$${discountValue}`}`
      });

      if (response.data.success) {
        setAppliedDiscount(response.data.discount);
        setShowDiscountModal(false);
        setDiscountValue(0);
        alert(`Descuento aplicado: ${response.data.discount.description}`);
      }
    } catch (error: any) {
      console.error('Error aplicando descuento:', error);
      alert(error.response?.data?.error || 'Error al aplicar descuento');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
  };

  const removeAllPromotions = () => {
    setAppliedPromotions([]);
  };

  const checkPromotions = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Si ya hay promociones aplicadas, mostrar información
    if (appliedPromotions.length > 0) {
      const promoMessages = appliedPromotions.map((promo: any) => {
        let message = `${promo.promotion.nombre}: -$${Math.round(promo.estimated_discount)}`;
        
        if (promo.affected_products && promo.affected_products.length > 0) {
          const productNames = promo.affected_products.map((p: any) => p.title).join(', ');
          message += `\n  (Aplicado a: ${productNames})`;
        }
        
        return message;
      }).join('\n');
      
      alert(`Promociones actualmente aplicadas:\n${promoMessages}`);
      return;
    }

    try {
      const response = await api.post('/cart/check-promotions', {
        cart_items: cart.map(item => ({
          id: item.id,
          title: item.title,
          precio: item.precio,
          quantity: item.quantity
        }))
      });

      const promotions = response.data.applicable_promotions || [];
      
      if (promotions.length === 0) {
        alert('No hay promociones aplicables para los productos en el carrito');
        return;
      }

      // Aplicar automáticamente las promociones encontradas
      setAppliedPromotions(promotions);
      
      // Mostrar mensaje con las promociones aplicadas y productos afectados
      const promoMessages = promotions.map((promo: any) => {
        let message = `${promo.promotion.nombre}: -$${Math.round(promo.estimated_discount)}`;
        
        if (promo.affected_products && promo.affected_products.length > 0) {
          const productNames = promo.affected_products.map((p: any) => p.title).join(', ');
          message += `\n  (Aplicado a: ${productNames})`;
        }
        
        return message;
      }).join('\n');
      
      alert(`Promociones aplicadas:\n${promoMessages}`);
      
    } catch (error) {
      console.error('Error verificando promociones:', error);
      alert('Error al verificar promociones');
    }
  };

  const checkPromotionsSilently = async () => {
    if (cart.length === 0) {
      setAppliedPromotions([]);
      return;
    }

    try {
      const response = await api.post('/cart/check-promotions', {
        cart_items: cart.map(item => ({
          id: item.id,
          title: item.title,
          precio: item.precio,
          quantity: item.quantity
        }))
      });

      const promotions = response.data.applicable_promotions || [];
      
      // Solo aplicar automáticamente si hay promociones, sin mostrar alertas
      if (promotions.length > 0) {
        setAppliedPromotions(promotions);
      } else {
        setAppliedPromotions([]);
      }
      
    } catch (error) {
      console.error('Error verificando promociones silenciosamente:', error);
      setAppliedPromotions([]);
    }
  };

  // Verificar promociones silenciosamente cuando cambie el carrito
  useEffect(() => {
    if (cart.length > 0) {
      checkPromotionsSilently();
    } else {
      setAppliedPromotions([]);
      setAppliedDiscount(null);
    }
  }, [cart]);

  // Funciones para manejo de notas
  const handleNoteSaved = (note: string) => {
    if (lastSaleId && cart.length === 0) {
      // Guardando nota para venta ya completada
      setLastSaleNote(note);
    } else {
      // Guardando nota para venta futura
      setPendingNote(note);
    }
  };

  const calculateTotalWithDiscounts = () => {
    const subtotal = getTotal();
    let totalDiscount = 0;

    // Descuento manual
    if (appliedDiscount) {
      totalDiscount += appliedDiscount.amount;
    }

    // Promociones
    appliedPromotions.forEach(promotion => {
      totalDiscount += promotion.estimated_discount || 0;
    });

    return Math.max(0, subtotal - totalDiscount);
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
        suspended_sale_id: currentSuspendedSaleId,
        applied_discount: appliedDiscount,
        applied_promotions: appliedPromotions,
        nota: pendingNote.trim() || null // Incluir nota pendiente
      });

      if (response.data.success) {
        const subtotal = response.data.subtotal || getTotal();
        const discount = response.data.total_discount || 0;
        const total = response.data.total;
        
        let message = `Venta procesada: Ticket ${response.data.ticket_number}`;
        if (discount > 0) {
          message += `\nSubtotal: $${Math.round(subtotal)}`;
          message += `\nDescuento: $${Math.round(discount)}`;
        }
        message += `\nTotal: $${Math.round(total)}`;
        
        alert(message);
        
        // Guardar ID de la última venta para notas
        setLastSaleId(response.data.sale_id);
        setLastSaleNote(''); // Reset note state
        setPendingNote(''); // Limpiar nota pendiente
        
        clearCart();
        setCurrentProduct(null);
        setCurrentSuspendedSaleId(null);
        setAppliedDiscount(null);
        setAppliedPromotions([]);
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
                type="button"
                className="btn btn-success me-2" 
                onClick={() => router.push('/productos')}
              >
                📦 Gestión de Productos
              </button>
              {hasPermission('can_view_suspended_sales') && (
                <button 
                  type="button"
                  className="btn btn-warning me-2" 
                  onClick={() => setShowSuspendedSales(true)}
                >
                  ⏸️ Ventas Suspendidas
                </button>
              )}
              {hasPermission('can_process_returns') && (
                <button 
                  type="button"
                  className="btn btn-danger me-2" 
                  onClick={handleReturnProduct}
                >
                  ↩️ Devoluciones
                </button>
              )}
              <button 
                type="button"
                className="btn btn-info me-2" 
                onClick={() => setShowNotesModal(true)}
                disabled={cart.length === 0 && !lastSaleId}
                title={
                  cart.length > 0 
                    ? "Agregar nota para la venta actual" 
                    : lastSaleId 
                      ? "Agregar nota a la última venta" 
                      : "Agrega productos al carrito o realiza una venta para agregar notas"
                }
              >
                📝 {cart.length > 0 ? 'Nota de Venta' : 'Agregar Nota'}
              </button>
              {hasPermission('can_manage_inventory_losses') && (
                <button 
                  type="button"
                  className="btn btn-secondary me-2" 
                  onClick={() => router.push('/perdidas-inventario')}
                >
                  🗑️ Pérdidas Inventario
                </button>
              )}
              {hasPermission('can_perform_physical_count') && (
                <button 
                  type="button"
                  className="btn btn-dark me-2" 
                  onClick={() => router.push('/conteo-fisico')}
                >
                  📊 Conteo Físico
                </button>
              )}
              {hasPermission('can_view_shift_history') && (
                <button 
                  type="button"
                  className="btn btn-info me-2" 
                  onClick={() => router.push('/historial-turnos')}
                >
                  📊 Historial Turnos
                </button>
              )}
              {hasPermission('can_view_audit_logs') && (
                <button 
                  type="button"
                  className="btn btn-warning me-2" 
                  onClick={() => router.push('/historiales')}
                >
                  📋 Historiales
                </button>
              )}
              {hasPermission('can_manage_promotions') && (
                <button 
                  type="button"
                  className="btn btn-success me-2" 
                  onClick={() => router.push('/promociones')}
                >
                  🎁 Promociones
                </button>
              )}
              {hasPermission('can_manage_users') && (
                <button 
                  type="button"
                  className="btn btn-secondary me-2" 
                  onClick={() => router.push('/gestion-usuarios')}
                >
                  👥 Gestionar Usuarios
                </button>
              )}
              <button 
                type="button"
                className="btn btn-danger me-2" 
                onClick={closeTurno}
              >
                Cerrar Turno
              </button>
              <button 
                type="button"
                className="btn btn-outline-light" 
                onClick={logout}
              >
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
                        <strong>Precio: ${currentProduct.precio}{currentProduct.unit_type === 'peso' ? '/kg' : ''}</strong><br />
                        <span className="badge bg-info">Stock: {currentProduct.stock} {currentProduct.unit_type === 'peso' ? 'kg' : 'unidades'}</span>
                        {currentProduct.unit_type === 'peso' && (
                          <span className="badge bg-warning ms-2">Venta por Peso</span>
                        )}
                        {currentProduct.margen_ganancia && currentProduct.unit_type === 'peso' && (
                          <div className="mt-1">
                            <small className="text-success">
                              Margen: ${currentProduct.margen_ganancia}/kg | 
                              Costo: ${(currentProduct.precio - currentProduct.margen_ganancia)}/kg
                            </small>
                          </div>
                        )}
                      </div>
                      <button 
                        type="button"
                        className="btn btn-success btn-sm mt-2 me-2" 
                        onClick={() => handleAddToCart(currentProduct)}
                      >
                        {currentProduct.unit_type === 'peso' ? '⚖️ Seleccionar Cantidad' : 'Agregar al Carrito'}
                      </button>
                      <button 
                        type="button"
                        className="btn btn-secondary btn-sm mt-2" 
                        onClick={() => setCurrentProduct(null)}
                      >
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
                  <h5>
                    🛒 Carrito ({cart.length})
                    {pendingNote && (
                      <span className="badge bg-warning ms-2" title={`Nota: ${pendingNote}`}>
                        📝 Con nota
                      </span>
                    )}
                  </h5>
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
                            <strong>{item.title}</strong>
                            {item.unit_type === 'peso' && (
                              <span className="badge bg-warning ms-1">Peso</span>
                            )}
                            <br />
                            <small>
                              ${item.precio}{item.unit_type === 'peso' ? '/kg' : ''} x {item.quantity}{item.unit_type === 'peso' ? 'kg' : ' unidades'}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateQuantity(index, item.quantity - (item.unit_type === 'peso' ? 0.1 : 1))}
                              >
                                -
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateQuantity(index, item.quantity + (item.unit_type === 'peso' ? 0.1 : 1))}
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
                              <strong>${Math.round(item.precio * item.quantity)}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  <div className="bg-light p-3 rounded mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Subtotal:</span>
                      <span>${Math.round(getTotal())}</span>
                    </div>
                    
                    {/* Mostrar descuentos aplicados */}
                    {appliedDiscount && (
                      <div className="d-flex justify-content-between align-items-center mb-2 text-danger">
                        <span>
                          {appliedDiscount.description}
                          <button 
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={removeDiscount}
                            title="Quitar descuento"
                          >
                            ×
                          </button>
                        </span>
                        <span>-${Math.round(appliedDiscount.amount)}</span>
                      </div>
                    )}
                    
                    {/* Mostrar promociones aplicadas */}
                    {appliedPromotions.map((promotion, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center mb-2 text-info">
                        <span>
                          <span 
                            title={
                              promotion.affected_products && promotion.affected_products.length > 0
                                ? `Aplicado a: ${promotion.affected_products.map((p: any) => p.title).join(', ')}`
                                : 'Aplicado a todo el carrito'
                            }
                            style={{ cursor: 'help', borderBottom: '1px dotted' }}
                          >
                            {promotion.promotion.nombre}
                          </span>
                          {appliedPromotions.length > 0 && index === 0 && (
                            <button 
                              className="btn btn-sm btn-outline-info ms-2"
                              onClick={removeAllPromotions}
                              title="Quitar todas las promociones"
                            >
                              × Todo
                            </button>
                          )}
                        </span>
                        <span>-${Math.round(promotion.estimated_discount)}</span>
                      </div>
                    ))}
                    
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Total:</h5>
                      <h5 className="mb-0">${Math.round(calculateTotalWithDiscounts())}</h5>
                    </div>
                    
                    {/* Botones de descuentos */}
                    <div className="row mb-2">
                      <div className="col-6">
                        <button 
                          className="btn btn-info w-100 btn-sm"
                          onClick={() => setShowDiscountModal(true)}
                          disabled={cart.length === 0 || appliedDiscount !== null}
                          title="Aplicar descuento manual"
                        >
                          % Descuento
                        </button>
                      </div>
                      <div className="col-6">
                        <button 
                          className={`btn w-100 btn-sm ${appliedPromotions.length > 0 ? 'btn-success' : 'btn-secondary'}`}
                          onClick={checkPromotions}
                          disabled={cart.length === 0}
                          title={appliedPromotions.length > 0 ? 'Promociones aplicadas automáticamente - Clic para ver detalles' : 'Verificar promociones disponibles'}
                        >
                          🎁 Promociones
                          {appliedPromotions.length > 0 && (
                            <span className="badge bg-light text-dark ms-1">
                              {appliedPromotions.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    
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
                <div className="text-center mb-4">
                  <div className="mb-2">Subtotal: ${Math.round(getTotal())}</div>
                  {(appliedDiscount || appliedPromotions.length > 0) && (
                    <>
                      {appliedDiscount && (
                        <div className="text-danger">
                          {appliedDiscount.description}: -${Math.round(appliedDiscount.amount)}
                        </div>
                      )}
                      {appliedPromotions.map((promotion, index) => (
                        <div key={index} className="text-info">
                          {promotion.promotion.nombre}: -${Math.round(promotion.estimated_discount)}
                        </div>
                      ))}
                      <hr />
                    </>
                  )}
                  <h4>Total a pagar: ${Math.round(calculateTotalWithDiscounts())}</h4>
                </div>
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
                <p><strong>💵 Efectivo:</strong> ${Math.round(turnoSummaryData.total_efectivo)}</p>
                <p><strong>💳 Tarjeta:</strong> ${Math.round(turnoSummaryData.total_tarjeta)}</p>
                <h5 className="text-success"><strong>Total: ${Math.round(turnoSummaryData.total_ventas)}</strong></h5>
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

      {/* Modal para seleccionar cantidad de peso */}
      {showWeightModal && currentProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">⚖️ Seleccionar Cantidad - {currentProduct.title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowWeightModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <img 
                    src={currentProduct.image_url || '/placeholder.png'} 
                    alt={currentProduct.title}
                    className="img-fluid rounded"
                    style={{ maxHeight: '150px', objectFit: 'cover' }}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Cantidad en kilogramos:</strong>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    className="form-control form-control-lg text-center"
                    value={weightAmount}
                    onChange={(e) => setWeightAmount(Number(e.target.value))}
                    placeholder="Ej: 1.5"
                    autoFocus
                  />
                  <small className="text-muted">Ingrese la cantidad en kg (ejemplo: 0.5 para 500g)</small>
                </div>

                <div className="bg-light p-3 rounded">
                  <div className="row">
                    <div className="col-6">
                      <strong>Precio por kg:</strong><br />
                      <span className="text-success">${currentProduct.precio.toFixed(2)}</span>
                    </div>
                    <div className="col-6">
                      <strong>Subtotal:</strong><br />
                      <span className="text-primary">${(currentProduct.precio * weightAmount).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {currentProduct.margen_ganancia && (
                    <div className="mt-2 pt-2 border-top">
                      <small className="text-muted">
                        Margen: ${currentProduct.margen_ganancia.toFixed(2)}/kg | 
                        Costo: ${(currentProduct.precio - currentProduct.margen_ganancia).toFixed(2)}/kg
                      </small>
                    </div>
                  )}
                </div>

                <div className="row mt-3">
                  <div className="col-4">
                    <button 
                      className="btn btn-outline-secondary w-100" 
                      onClick={() => handleAddWeightToCart(0.25)}
                    >
                      250g
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      className="btn btn-outline-secondary w-100" 
                      onClick={() => handleAddWeightToCart(0.5)}
                    >
                      500g
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      className="btn btn-outline-secondary w-100" 
                      onClick={() => handleAddWeightToCart(1)}
                    >
                      1kg
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowWeightModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={handleFinalAddToCart}
                  disabled={weightAmount <= 0}
                >
                  ➕ Agregar {weightAmount}kg al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de descuento */}
      {showDiscountModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Aplicar Descuento</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDiscountModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tipo de descuento:</label>
                  <div className="btn-group w-100" role="group">
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="discountType" 
                      id="percentage" 
                      checked={discountType === 'porcentaje'}
                      onChange={() => setDiscountType('porcentaje')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="percentage">
                      Porcentaje (%)
                    </label>
                    
                    <input 
                      type="radio" 
                      className="btn-check" 
                      name="discountType" 
                      id="fixed" 
                      checked={discountType === 'cantidad_fija'}
                      onChange={() => setDiscountType('cantidad_fija')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="fixed">
                      Monto Fijo ($)
                    </label>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    Valor del descuento:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder={discountType === 'porcentaje' ? 'Ej: 10 (para 10%)' : 'Ej: 50 (para $50)'}
                    min="0"
                    max={discountType === 'porcentaje' ? '100' : getTotal().toString()}
                    step={discountType === 'porcentaje' ? '1' : '0.01'}
                  />
                  {discountType === 'porcentaje' && discountValue > 0 && (
                    <div className="form-text">
                      Descuento de {discountValue}% = ${(getTotal() * (discountValue / 100)).toFixed(2)}
                    </div>
                  )}
                  {discountType === 'cantidad_fija' && discountValue > 0 && (
                    <div className="form-text">
                      Total después del descuento: ${Math.max(0, getTotal() - discountValue).toFixed(2)}
                    </div>
                  )}
                </div>
                
                <div className="alert alert-info">
                  <strong>Subtotal actual:</strong> ${getTotal().toFixed(2)}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDiscountModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={applyManualDiscount}
                  disabled={discountValue <= 0 || (discountType === 'cantidad_fija' && discountValue > getTotal())}
                >
                  Aplicar Descuento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notas */}
      {showNotesModal && (
        <NotesModal
          saleId={cart.length === 0 ? lastSaleId : null}
          currentNote={cart.length === 0 ? lastSaleNote : pendingNote}
          onNoteSaved={handleNoteSaved}
          onClose={() => setShowNotesModal(false)}
        />
      )}

      {/* Botón de Ayuda Flotante */}
      <HelpButton />
    </div>
  );
}
