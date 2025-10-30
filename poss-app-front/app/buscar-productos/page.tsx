// app/buscar-productos/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import PermissionGuard from '@/components/PermissionGuard';

interface Category {
  id: number;
  name: string;
}

export default function BuscarProductos() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [mostSoldProducts, setMostSoldProducts] = useState<Product[]>([]);

  // Aseguramos que el scroll esté habilitado
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  const [categories, setCategories] = useState<Category[]>([]);

  // Protección de autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Cargar datos iniciales
  useEffect(() => {
    loadCategories();
    loadAllProducts();
    loadMostSoldProducts();
    updateCartIndicator();
  }, []);

  // Actualizar productos filtrados cuando cambian los filtros
  useEffect(() => {
    searchProducts();
  }, [searchTerm, categoryFilter, allProducts]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadAllProducts = async () => {
    try {
      const response = await api.get('/articles');
      setAllProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMostSoldProducts = async () => {
    try {
      console.log('Cargando productos más vendidos...');
      const response = await api.get('/articles/most-sold');
      console.log('Respuesta productos más vendidos:', response.data);
      setMostSoldProducts(response.data.products || []);
      console.log('Productos más vendidos cargados exitosamente');
    } catch (error: any) {
      console.error('Error cargando productos más vendidos:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
        console.error('Status del error:', error.response.status);
      }
      // Si hay error, no mostrar productos más vendidos, pero no fallar
      setMostSoldProducts([]);
    }
  };

  const searchProducts = () => {
    const filtered = allProducts.filter(product => {
      const matchesSearch = !searchTerm || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm));

      const matchesCategory = !categoryFilter || 
        product.category_id?.toString() === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Si no hay filtros aplicados, mostrar primero los más vendidos
    if (!searchTerm && !categoryFilter && mostSoldProducts.length > 0) {
      // Crear array con los más vendidos primero
      const mostSoldIds = mostSoldProducts.map(p => p.id);
      const mostSold = filtered.filter(p => mostSoldIds.includes(p.id));
      const remaining = filtered.filter(p => !mostSoldIds.includes(p.id));
      
      // Ordenar los más vendidos según el orden original
      const sortedMostSold = mostSoldIds.map(id => mostSold.find(p => p.id === id)).filter(Boolean);
      
      setFilteredProducts([...sortedMostSold, ...remaining] as Product[]);
    } else {
      setFilteredProducts(filtered);
    }
  };

  const updateCartIndicator = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } catch (error) {
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  const selectProduct = (product: Product) => {
    console.log('Seleccionando producto:', product);
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    router.push('/');
  };

  const volverACaja = () => {
    router.push('/');
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Sin categoría';
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>Búsqueda Manual de Productos</h4>
              <div>
                <span className={`badge me-2 ${cartCount > 0 ? 'bg-success' : 'bg-secondary'}`}>
                  Carrito: {cartCount} items
                </span>
                <button 
                  className="btn btn-secondary" 
                  onClick={volverACaja}
                >
                  Volver a Caja
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Barra de búsqueda */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Buscar por nombre, código de barras..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-control" 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-primary w-100" 
                    onClick={searchProducts}
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Resultados */}
              <div id="searchResults">
                {mostSoldProducts.length > 0 && !searchTerm && !categoryFilter && (
                  <div className="alert alert-info py-2 mb-3">
                    <small>
                      <i className="fas fa-info-circle me-2"></i>
                      Los productos más vendidos aparecen primero para agilizar el proceso de venta.
                    </small>
                  </div>
                )}
                
                {filteredProducts.length === 0 ? (
                  <p className="text-muted">No se encontraron productos</p>
                ) : (
                  <div className="row">
                    {filteredProducts.map(product => {
                      const isMostSold = mostSoldProducts.some(mp => mp.id === product.id);
                      return (
                        <div key={product.id} className="col-md-4 mb-3">
                          <div className={`card h-100 ${isMostSold ? 'border-warning' : ''}`}>
                            {isMostSold && (
                              <div className="card-header bg-warning text-dark py-1">
                                <small className="fw-bold">⭐ Más Vendido</small>
                              </div>
                            )}
                            {product.image_url ? (
                              <img 
                                src={product.image_url} 
                                className="card-img-top" 
                                style={{ height: '200px', objectFit: 'cover' }} 
                                alt={product.title}
                              />
                            ) : (
                              <div 
                                className="card-img-top bg-light d-flex align-items-center justify-content-center" 
                                style={{ height: '200px' }}
                              >
                                <span className="text-muted">Sin imagen</span>
                              </div>
                            )}
                            <div className="card-body d-flex flex-column">
                              <h5 className="card-title">{product.title}</h5>
                              <p className="card-text">{product.content}</p>
                              <div className="mt-auto">
                                <p className="mb-1"><strong>Precio: ${product.precio}</strong></p>
                                <p className="mb-1">Stock: {product.stock}</p>
                                {product.barcode && (
                                  <p className="mb-1">Código: {product.barcode}</p>
                                )}
                                <p className="mb-3">
                                  <small className="text-muted">
                                    Categoría: {getCategoryName(product.category_id)}
                                  </small>
                                </p>
                                <button 
                                  className="btn btn-success w-100" 
                                  onClick={() => selectProduct(product)}
                                  disabled={product.stock <= 0}
                                >
                                  {product.stock <= 0 ? 'Sin Stock' : 'Seleccionar Producto'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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