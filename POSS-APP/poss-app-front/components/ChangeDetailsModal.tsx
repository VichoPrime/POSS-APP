import React from 'react'

interface ChangeDetailsModalProps {
  show: boolean
  onHide: () => void
  oldValues?: any
  newValues?: any
  action: string
  productTitle: string
  username: string
  timestamp: string
}

const ChangeDetailsModal: React.FC<ChangeDetailsModalProps> = ({
  show,
  onHide,
  oldValues,
  newValues,
  action,
  productTitle,
  username,
  timestamp
}) => {
  if (!show) return null

  const getFieldDisplayName = (field: string): string => {
    const fieldNames: { [key: string]: string } = {
      'title': 'Título',
      'precio': 'Precio',
      'stock': 'Stock',
      'content': 'Descripción',
      'codigo_barra': 'Código de Barra',
      'category_id': 'Categoría',
      'unit_type': 'Tipo de Unidad',
      'peso_unitario': 'Peso Unitario',
      'activo': 'Estado Activo'
    }
    return fieldNames[field] || field
  }

  const formatValue = (field: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (field) {
      case 'precio':
        return `$${Number(value).toFixed(2)}`
      case 'stock':
        return value.toString()
      case 'activo':
        return value ? 'Activo' : 'Inactivo'
      case 'peso_unitario':
        return `${value} kg`
      default:
        return value.toString()
    }
  }

  const getChangedFields = (): Array<{field: string, oldValue: any, newValue: any}> => {
    if (!oldValues || !newValues) return []
    
    const changes: Array<{field: string, oldValue: any, newValue: any}> = []
    const allFields = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
    
    Array.from(allFields).forEach(field => {
      const oldVal = oldValues[field]
      const newVal = newValues[field]
      
      if (oldVal !== newVal) {
        changes.push({
          field,
          oldValue: oldVal,
          newValue: newVal
        })
      }
    })
    
    return changes
  }

  const getChangeTypeColor = (field: string, oldVal: any, newVal: any) => {
    if (field === 'stock') {
      if (newVal > oldVal) return 'text-success' // Aumento
      if (newVal < oldVal) return 'text-danger'  // Disminución
    }
    if (field === 'precio') {
      if (newVal > oldVal) return 'text-warning' // Aumento de precio
      if (newVal < oldVal) return 'text-info'    // Disminución de precio
    }
    return 'text-primary' // Cambio general
  }

  const changes = getChangedFields()

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              📋 Detalles del Cambio
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {/* Información general */}
            <div className="row mb-4">
              <div className="col-md-6">
                <strong>Producto:</strong> {productTitle}
              </div>
              <div className="col-md-6">
                <strong>Usuario:</strong> <span className="badge bg-info">{username}</span>
              </div>
              <div className="col-md-6">
                <strong>Acción:</strong> {' '}
                <span className={`badge ${
                  action === 'created' ? 'bg-success' :
                  action === 'updated' ? 'bg-warning' :
                  action === 'deleted' ? 'bg-danger' : 'bg-secondary'
                }`}>
                  {action === 'created' ? 'Creado' :
                   action === 'updated' ? 'Actualizado' :
                   action === 'deleted' ? 'Eliminado' : action}
                </span>
              </div>
              <div className="col-md-6">
                <strong>Fecha:</strong> {new Date(timestamp).toLocaleString()}
              </div>
            </div>

            {/* Cambios detectados */}
            {action === 'created' ? (
              <div className="alert alert-success">
                <h6>✨ Producto Creado</h6>
                <p>Se creó un nuevo producto con los siguientes valores:</p>
                {newValues && (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <tbody>
                        {Object.entries(newValues).map(([field, value]) => (
                          <tr key={field}>
                            <td><strong>{getFieldDisplayName(field)}:</strong></td>
                            <td>{formatValue(field, value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : changes.length > 0 ? (
              <div>
                <h6>🔄 Cambios Realizados ({changes.length})</h6>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Campo</th>
                        <th>Valor Anterior</th>
                        <th></th>
                        <th>Valor Nuevo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changes.map(({ field, oldValue, newValue }) => (
                        <tr key={field}>
                          <td><strong>{getFieldDisplayName(field)}</strong></td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {formatValue(field, oldValue)}
                            </span>
                          </td>
                          <td className="text-center">
                            <i className={`fas fa-arrow-right ${getChangeTypeColor(field, oldValue, newValue)}`}></i>
                          </td>
                          <td>
                            <span className={`badge bg-light ${getChangeTypeColor(field, oldValue, newValue)}`}>
                              {formatValue(field, newValue)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <p>No se detectaron cambios específicos en los campos.</p>
              </div>
            )}

            {/* Resumen de cambios importantes */}
            {changes.some(c => c.field === 'stock' || c.field === 'precio') && (
              <div className="mt-3">
                <h6>📊 Resumen de Cambios Importantes</h6>
                <div className="row">
                  {changes.filter(c => c.field === 'stock').map(({ oldValue, newValue }) => (
                    <div key="stock" className="col-md-6">
                      <div className={`alert ${newValue > oldValue ? 'alert-success' : 'alert-warning'} py-2`}>
                        <small>
                          <strong>Stock:</strong> {oldValue} → {newValue} {' '}
                          <span className={newValue > oldValue ? 'text-success' : 'text-danger'}>
                            ({newValue > oldValue ? '+' : ''}{newValue - oldValue})
                          </span>
                        </small>
                      </div>
                    </div>
                  ))}
                  {changes.filter(c => c.field === 'precio').map(({ oldValue, newValue }) => (
                    <div key="precio" className="col-md-6">
                      <div className={`alert ${newValue > oldValue ? 'alert-warning' : 'alert-info'} py-2`}>
                        <small>
                          <strong>Precio:</strong> ${oldValue} → ${newValue} {' '}
                          <span className={newValue > oldValue ? 'text-warning' : 'text-info'}>
                            ({newValue > oldValue ? '+' : ''}${(newValue - oldValue).toFixed(2)})
                          </span>
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangeDetailsModal