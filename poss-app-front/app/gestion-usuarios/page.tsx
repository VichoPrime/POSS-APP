'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import PermissionGuard from '@/components/PermissionGuard'

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  permissions: {
    can_manage_products: boolean
    can_view_suspended_sales: boolean
    can_process_returns: boolean
    can_add_notes: boolean
    can_manage_inventory_losses: boolean
    can_perform_physical_count: boolean
    can_view_shift_history: boolean
    can_view_audit_logs: boolean
    can_manage_promotions: boolean
    can_manage_users: boolean
    is_admin: boolean
  }
}

interface UserFormData {
  username: string
  email: string
  password: string
  is_admin: boolean
  is_active: boolean
  permissions: {
    can_manage_products: boolean
    can_view_suspended_sales: boolean
    can_process_returns: boolean
    can_add_notes: boolean
    can_manage_inventory_losses: boolean
    can_perform_physical_count: boolean
    can_view_shift_history: boolean
    can_view_audit_logs: boolean
    can_manage_promotions: boolean
    can_manage_users: boolean
  }
}

export default function GestionUsuariosPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Eliminamos la redirección automática - PermissionGuard se encarga de todo

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    is_admin: false,
    is_active: true,
    permissions: {
      can_manage_products: false,
      can_view_suspended_sales: false,
      can_process_returns: false,
      can_add_notes: false,
      can_manage_inventory_losses: false,
      can_perform_physical_count: false,
      can_view_shift_history: false,
      can_view_audit_logs: false,
      can_manage_promotions: false,
      can_manage_users: false
    }
  })

  const permissionLabels = {
    can_manage_products: 'Gestión de Productos',
    can_view_suspended_sales: 'Ventas Suspendidas',
    can_process_returns: 'Devoluciones',
    can_add_notes: 'Agregar Notas',
    can_manage_inventory_losses: 'Pérdidas de Inventario',
    can_perform_physical_count: 'Conteo Físico',
    can_view_shift_history: 'Historial de Turnos',
    can_view_audit_logs: 'Historiales de Auditoría',
    can_manage_promotions: 'Promociones',
    can_manage_users: 'Gestión de Usuarios'
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data.users)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      if (error.response?.status === 403) {
        alert('No tienes permisos para gestionar usuarios')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      is_admin: false,
      is_active: true,
      permissions: {
        can_manage_products: false,
        can_view_suspended_sales: false,
        can_process_returns: false,
        can_add_notes: false,
        can_manage_inventory_losses: false,
        can_perform_physical_count: false,
        can_view_shift_history: false,
        can_view_audit_logs: false,
        can_manage_promotions: false,
        can_manage_users: false
      }
    })
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await api.post('/users', formData)
      alert('Usuario creado exitosamente')
      setShowCreateModal(false)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      alert(error.response?.data?.error || 'Error al crear usuario')
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // No pre-cargar la contraseña
      is_admin: user.is_admin,
      is_active: user.is_active,
      permissions: { ...user.permissions }
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return
    
    try {
      const updateData: any = { ...formData }
      // Solo enviar la contraseña si se proporcionó una nueva
      if (!updateData.password) {
        delete updateData.password
      }
      
      await api.put(`/users/${editingUser.id}`, updateData)
      alert('Usuario actualizado exitosamente')
      setShowEditModal(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(error.response?.data?.error || 'Error al actualizar usuario')
    }
  }

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${username}"?`)) {
      return
    }
    
    try {
      await api.delete(`/users/${userId}`)
      alert('Usuario eliminado exitosamente')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.response?.data?.error || 'Error al eliminar usuario')
    }
  }

  const handlePermissionChange = (permission: keyof typeof formData.permissions, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }))
  }

  const renderUserModal = (isEdit: boolean = false) => {
    const isShow = isEdit ? showEditModal : showCreateModal
    const handleSubmit = isEdit ? handleUpdateUser : handleCreateUser
    const title = isEdit ? 'Editar Usuario' : 'Crear Nuevo Usuario'
    
    if (!isShow) return null

    return (
      <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  if (isEdit) {
                    setShowEditModal(false)
                    setEditingUser(null)
                  } else {
                    setShowCreateModal(false)
                  }
                  resetForm()
                }}
              ></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Información básica */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre de Usuario *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Contraseña {isEdit ? '(dejar vacío para no cambiar)' : '*'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!isEdit}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.is_admin}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_admin: e.target.checked }))}
                      />
                      <label className="form-check-label">
                        Administrador (acceso total)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      />
                      <label className="form-check-label">
                        Usuario Activo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Permisos específicos */}
                {!formData.is_admin && (
                  <div className="border rounded p-3">
                    <h6 className="mb-3">Permisos Específicos</h6>
                    <div className="row">
                      {Object.entries(permissionLabels).map(([permission, label]) => (
                        <div key={permission} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.permissions[permission as keyof typeof formData.permissions]}
                              onChange={(e) => handlePermissionChange(
                                permission as keyof typeof formData.permissions, 
                                e.target.checked
                              )}
                            />
                            <label className="form-check-label">
                              {label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="alert alert-info mt-3">
                      <small>
                        <strong>Nota:</strong> Todos los usuarios pueden usar la caja y buscar productos para realizar ventas.
                        Los permisos adicionales controlan el acceso a funciones administrativas.
                      </small>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    if (isEdit) {
                      setShowEditModal(false)
                      setEditingUser(null)
                    } else {
                      setShowCreateModal(false)
                    }
                    resetForm()
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Debes iniciar sesión para acceder a la gestión de usuarios.
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard permission="can_manage_users">
      <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h2>👥 Gestión de Usuarios</h2>
                <p className="text-muted mb-0">
                  Administrar usuarios y sus permisos en el sistema
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                ➕ Crear Usuario
              </button>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Permisos</th>
                        <th>Fecha Creación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td>
                            <strong>{userData.username}</strong>
                            {userData.id === user?.id && (
                              <span className="badge bg-info ms-2">Tú</span>
                            )}
                          </td>
                          <td>{userData.email}</td>
                          <td>
                            <span className={`badge ${userData.is_admin ? 'bg-danger' : 'bg-primary'}`}>
                              {userData.is_admin ? 'Administrador' : 'Usuario'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${userData.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {userData.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            {userData.is_admin ? (
                              <span className="text-success">Todos los permisos</span>
                            ) : (
                              <div className="d-flex flex-wrap gap-1">
                                {Object.entries(userData.permissions)
                                  .filter(([key, value]) => value && key !== 'is_admin')
                                  .map(([key]) => (
                                    <span key={key} className="badge bg-light text-dark">
                                      {permissionLabels[key as keyof typeof permissionLabels]}
                                    </span>
                                  ))}
                                {Object.values(userData.permissions).filter(v => v).length === 1 && (
                                  <span className="text-muted">Solo ventas</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td>{new Date(userData.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditUser(userData)}
                              >
                                ✏️ Editar
                              </button>
                              {userData.id !== user?.id && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteUser(userData.id, userData.username)}
                                >
                                  🗑️ Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && users.length === 0 && (
                <div className="alert alert-info text-center">
                  No hay usuarios registrados en el sistema.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {renderUserModal(false)} {/* Modal crear */}
      {renderUserModal(true)}  {/* Modal editar */}
    </div>
    </PermissionGuard>
  )
}