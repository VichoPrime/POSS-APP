'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import ChangeDetailsModal from '@/components/ChangeDetailsModal'
import HelpButton from '@/components/HelpButton'

interface ProductHistory {
  id: number
  article_id: number
  article_title: string
  user_id: number
  username: string
  action: string
  description: string
  old_values?: any
  new_values?: any
  timestamp: string
}

interface PhysicalCountHistory {
  id: number
  article_id: number
  article_title: string
  user_id: number
  username: string
  old_stock: number
  new_stock: number
  difference: number
  observation?: string
  timestamp: string
  unit_type: string
}

interface FilterType {
  article_id: string
  username: string  // Cambiar de user_id a username
  action: string
}

export default function HistorialesPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'products' | 'counts'>('products')
  const [productHistory, setProductHistory] = useState<ProductHistory[]>([])
  const [countHistory, setCountHistory] = useState<PhysicalCountHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    article_id: '',
    username: '',  // Cambiar de user_id a username
    action: ''
  })
  const [appliedFilters, setAppliedFilters] = useState({
    article_id: '',
    username: '',  // Cambiar de user_id a username
    action: ''
  })
  const [selectedChange, setSelectedChange] = useState<ProductHistory | null>(null)
  const [showChangeModal, setShowChangeModal] = useState(false)

  const fetchProductHistory = async (page = 1, filtersToUse: FilterType | null = null) => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const currentFilters = filtersToUse || appliedFilters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        ...(currentFilters.article_id && { article_id: currentFilters.article_id }),
        ...(currentFilters.username && { username: currentFilters.username }),  // Cambiar user_id por username
        ...(currentFilters.action && { action: currentFilters.action })
      })

      const response = await api.get(`/history/products?${params}`)
      
      if (response.data) {
        setProductHistory(response.data.history)
        setTotalPages(response.data.total_pages)
        setCurrentPage(response.data.current_page)
      }
    } catch (error) {
      console.error('Error fetching product history:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCountHistory = async (page = 1, filtersToUse: FilterType | null = null) => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const currentFilters = filtersToUse || appliedFilters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        ...(currentFilters.article_id && { article_id: currentFilters.article_id }),
        ...(currentFilters.username && { username: currentFilters.username })  // Cambiar user_id por username
      })

      const response = await api.get(`/history/physical-counts?${params}`)

      if (response.data) {
        setCountHistory(response.data.history)
        setTotalPages(response.data.total_pages)
        setCurrentPage(response.data.current_page)
      }
    } catch (error) {
      console.error('Error fetching count history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    
    if (activeTab === 'products') {
      fetchProductHistory(1)
    } else {
      fetchCountHistory(1)
    }
  }, [activeTab, isAuthenticated])

  const handlePageChange = (page: number) => {
    if (activeTab === 'products') {
      fetchProductHistory(page)
    } else {
      fetchCountHistory(page)
    }
  }

  const handleViewChanges = (entry: ProductHistory) => {
    setSelectedChange(entry)
    setShowChangeModal(true)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    setCurrentPage(1)
    
    // Aplicar filtros inmediatamente
    if (activeTab === 'products') {
      fetchProductHistory(1, filters)
    } else {
      fetchCountHistory(1, filters)
    }
  }

  const clearFilters = () => {
    const emptyFilters = { article_id: '', username: '', action: '' }  // Cambiar user_id a username
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setCurrentPage(1)
    
    // Aplicar filtros vacíos inmediatamente
    if (activeTab === 'products') {
      fetchProductHistory(1, emptyFilters)
    } else {
      fetchCountHistory(1, emptyFilters)
    }
  }

  const renderProductHistory = () => (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Producto</th>
            <th>Acción</th>
            <th>Descripción</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {productHistory.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.timestamp).toLocaleString()}</td>
              <td>
                <span className="badge bg-info">{entry.username}</span>
              </td>
              <td>{entry.article_title}</td>
              <td>
                <span className={`badge ${
                  entry.action === 'created' ? 'bg-success' :
                  entry.action === 'updated' ? 'bg-warning' :
                  entry.action === 'deleted' ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {entry.action}
                </span>
              </td>
              <td>{entry.description}</td>
              <td>
                {(entry.old_values || entry.new_values) && (
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleViewChanges(entry)}
                  >
                    Ver cambios
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCountHistory = () => (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Producto</th>
            <th>Stock Anterior</th>
            <th>Stock Nuevo</th>
            <th>Diferencia</th>
            <th>Observación</th>
          </tr>
        </thead>
        <tbody>
          {countHistory.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.timestamp).toLocaleString()}</td>
              <td>
                <span className="badge bg-info">{entry.username}</span>
              </td>
              <td>{entry.article_title}</td>
              <td>{entry.old_stock} {entry.unit_type}</td>
              <td>{entry.new_stock} {entry.unit_type}</td>
              <td>
                <span className={`badge ${
                  entry.difference > 0 ? 'bg-success' : 
                  entry.difference < 0 ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {entry.difference > 0 ? '+' : ''}{entry.difference} {entry.unit_type}
                </span>
              </td>
              <td>{entry.observation || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderPagination = () => (
    <nav aria-label="Navegación de historiales">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
        </li>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum = Math.max(1, currentPage - 2) + i
          if (pageNum > totalPages) return null
          
          return (
            <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            </li>
          )
        })}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  )

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Debes iniciar sesión para ver los historiales.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h2>Historiales de Auditoría</h2>
              <p className="text-muted mb-0">
                Registro de todas las modificaciones realizadas en el sistema
              </p>
            </div>
            <div className="card-body">
              {/* Tabs */}
              <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                  >
                    Cambios en Productos
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'counts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('counts')}
                  >
                    Conteos Físicos
                  </button>
                </li>
              </ul>

              {/* Filtros */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID Producto"
                    value={filters.article_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, article_id: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre de Usuario"
                    value={filters.username}
                    onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
                {activeTab === 'products' && (
                  <div className="col-md-2">
                    <select
                      className="form-control"
                      value={filters.action}
                      onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                    >
                      <option value="">Todas las acciones</option>
                      <option value="created">Creado</option>
                      <option value="updated">Actualizado</option>
                      <option value="deleted">Eliminado</option>
                    </select>
                  </div>
                )}
                <div className={`col-md-${activeTab === 'products' ? '2' : '3'}`}>
                  <button 
                    className="btn btn-primary me-2"
                    onClick={applyFilters}
                  >
                    Aplicar Filtros
                  </button>
                </div>
                <div className={`col-md-${activeTab === 'products' ? '2' : '3'}`}>
                  <button 
                    className="btn btn-secondary"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Content */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'products' ? renderProductHistory() : renderCountHistory()}
                  {(productHistory.length > 0 || countHistory.length > 0) && renderPagination()}
                </>
              )}

              {!loading && activeTab === 'products' && productHistory.length === 0 && (
                <div className="alert alert-info text-center">
                  No se encontraron registros de cambios en productos.
                </div>
              )}

              {!loading && activeTab === 'counts' && countHistory.length === 0 && (
                <div className="alert alert-info text-center">
                  No se encontraron registros de conteos físicos.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles de cambios */}
      <ChangeDetailsModal
        show={showChangeModal}
        onHide={() => setShowChangeModal(false)}
        oldValues={selectedChange?.old_values}
        newValues={selectedChange?.new_values}
        action={selectedChange?.action || ''}
        productTitle={selectedChange?.article_title || ''}
        username={selectedChange?.username || ''}
        timestamp={selectedChange?.timestamp || ''}
      />
      
      {/* Botón de Ayuda Flotante */}
      <HelpButton />
    </div>
  )
}