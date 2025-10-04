'use client'

import { useState } from 'react'

interface UserManualModalProps {
  show: boolean
  onHide: () => void
}

export default function UserManualModal({ show, onHide }: UserManualModalProps) {
  const [activeSection, setActiveSection] = useState('inicio')

  const sections = [
    { id: 'inicio', title: '🏠 Inicio', icon: '🏠' },
    { id: 'pos', title: '🛒 Punto de Venta', icon: '🛒' },
    { id: 'productos', title: '📦 Gestión de Productos', icon: '📦' },
    { id: 'usuarios', title: '👥 Gestión de Usuarios', icon: '👥' },
    { id: 'historiales', title: '📊 Historiales', icon: '📊' },
    { id: 'tips', title: '💡 Tips y Trucos', icon: '💡' }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div>
            <h4>🏠 Bienvenido al Sistema POS</h4>
            <p>Este sistema de punto de venta te ayuda a gestionar tu negocio de manera eficiente.</p>
            
            <h5>🚀 Primeros Pasos:</h5>
            <ol>
              <li><strong>Inicio de Sesión:</strong> Usa tus credenciales para acceder</li>
              <li><strong>Navegación:</strong> Usa el menú lateral para moverte entre secciones</li>
              <li><strong>Ayuda:</strong> Haz clic en el botón de ayuda (?) en cualquier momento</li>
            </ol>

            <h5>🎯 Funciones Principales:</h5>
            <ul>
              <li>📱 <strong>Punto de Venta:</strong> Procesa ventas rápidamente</li>
              <li>📦 <strong>Inventario:</strong> Gestiona productos y stock</li>
              <li>👥 <strong>Usuarios:</strong> Administra permisos y accesos</li>
              <li>📊 <strong>Reportes:</strong> Analiza ventas e historial</li>
            </ul>

            <div className="alert alert-info">
              <strong>💡 Tip:</strong> El sistema maneja precios sin decimales para mayor agilidad
            </div>
          </div>
        )

      case 'pos':
        return (
          <div>
            <h4>🛒 Punto de Venta - Manual Completo</h4>
            
            <h5>📱 Cómo Realizar una Venta:</h5>
            <ol>
              <li><strong>Buscar Producto:</strong>
                <ul>
                  <li>Haz clic en "Buscar Productos" o usa la barra de búsqueda</li>
                  <li>Filtra por categorías para encontrar rápidamente</li>
                  <li>Escanea código de barras (si disponible)</li>
                </ul>
              </li>
              
              <li><strong>Agregar al Carrito:</strong>
                <ul>
                  <li><strong>Por unidad:</strong> Haz clic en "Agregar" y especifica cantidad</li>
                  <li><strong>Por peso:</strong> Ingresa el peso exacto en kilogramos</li>
                  <li>El sistema calculará automáticamente el precio con márgenes</li>
                </ul>
              </li>
              
              <li><strong>Gestionar Carrito:</strong>
                <ul>
                  <li>Modifica cantidades directamente en el carrito</li>
                  <li>Elimina productos con el botón "🗑️"</li>
                  <li>Revisa el total antes de procesar</li>
                </ul>
              </li>
              
              <li><strong>Procesar Pago:</strong>
                <ul>
                  <li><strong>Efectivo:</strong> Ingresa monto recibido para calcular vuelto</li>
                  <li><strong>Débito/Crédito:</strong> Selecciona tipo de tarjeta</li>
                  <li><strong>Mixto:</strong> Combina métodos de pago</li>
                </ul>
              </li>
            </ol>

            <h5>🔄 Funciones Especiales:</h5>
            <ul>
              <li><strong>Suspender Venta:</strong> Guarda la venta para completarla después</li>
              <li><strong>Recuperar Venta:</strong> Continúa una venta suspendida</li>
              <li><strong>Devoluciones:</strong> Procesa devoluciones de productos</li>
            </ul>

            <div className="alert alert-warning">
              <strong>⚠️ Importante:</strong> Siempre verifica el total antes de procesar el pago
            </div>
          </div>
        )

      case 'productos':
        return (
          <div>
            <h4>📦 Gestión de Productos</h4>
            
            <h5>➕ Agregar Nuevo Producto:</h5>
            <ol>
              <li>Ve a "Productos" en el menú</li>
              <li>Haz clic en "Agregar Producto"</li>
              <li>Completa los campos requeridos:
                <ul>
                  <li><strong>Título:</strong> Nombre del producto</li>
                  <li><strong>Código de Barras:</strong> Para identificación rápida</li>
                  <li><strong>Categoría:</strong> Selecciona o crea nueva</li>
                  <li><strong>Precio de Costo:</strong> Precio de compra</li>
                  <li><strong>Margen de Ganancia:</strong> Porcentaje de utilidad</li>
                  <li><strong>Stock:</strong> Cantidad disponible</li>
                  <li><strong>Tipo de Unidad:</strong> Por unidad o por peso</li>
                </ul>
              </li>
            </ol>

            <h5>✏️ Editar Productos:</h5>
            <ul>
              <li>Busca el producto en la lista</li>
              <li>Haz clic en "Editar"</li>
              <li>Modifica los campos necesarios</li>
              <li>Guarda los cambios</li>
            </ul>

            <h5>📊 Gestión de Stock:</h5>
            <ul>
              <li><strong>Conteo Físico:</strong> Ajusta stock según conteo real</li>
              <li><strong>Stock Mínimo:</strong> Define alertas de stock bajo</li>
              <li><strong>Movimientos:</strong> Revisa historial de cambios</li>
            </ul>

            <h5>💰 Sistema de Márgenes:</h5>
            <div className="alert alert-info">
              <p><strong>Cálculo Automático:</strong></p>
              <p>Precio Final = Precio de Costo + (Precio de Costo × Margen%)</p>
              <p>Ejemplo: Costo $1000 + Margen 50% = Precio Final $1500</p>
            </div>
          </div>
        )

      case 'usuarios':
        return (
          <div>
            <h4>👥 Gestión de Usuarios</h4>
            
            <h5>👤 Crear Nuevo Usuario:</h5>
            <ol>
              <li>Ve a "Gestionar Usuarios" (solo administradores)</li>
              <li>Haz clic en "Agregar Usuario"</li>
              <li>Completa la información:
                <ul>
                  <li><strong>Nombre de Usuario:</strong> Identificador único</li>
                  <li><strong>Email:</strong> Para inicio de sesión</li>
                  <li><strong>Contraseña:</strong> Mínimo 6 caracteres</li>
                  <li><strong>Tipo de Usuario:</strong> Admin o Empleado</li>
                </ul>
              </li>
            </ol>

            <h5>🔐 Permisos del Sistema:</h5>
            <div className="row">
              <div className="col-md-6">
                <h6>👑 Administrador:</h6>
                <ul>
                  <li>✅ Acceso completo al sistema</li>
                  <li>✅ Gestión de usuarios</li>
                  <li>✅ Gestión de productos</li>
                  <li>✅ Configuración del sistema</li>
                  <li>✅ Todos los reportes</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>👨‍💼 Empleado:</h6>
                <ul>
                  <li>✅ Punto de venta</li>
                  <li>✅ Consulta de productos</li>
                  <li>✅ Ventas suspendidas</li>
                  <li>❌ Gestión de usuarios</li>
                  <li>❌ Configuración avanzada</li>
                </ul>
              </div>
            </div>

            <h5>🔄 Gestión de Turnos:</h5>
            <ul>
              <li>Cada usuario tiene un turno activo automático</li>
              <li>Se registran todas las ventas por turno</li>
              <li>Los administradores pueden ver historial completo</li>
            </ul>
          </div>
        )

      case 'historiales':
        return (
          <div>
            <h4>📊 Historiales y Reportes</h4>
            
            <h5>📈 Historial de Ventas:</h5>
            <ul>
              <li><strong>Ver todas las ventas:</strong> Lista completa con fechas y totales</li>
              <li><strong>Filtrar por fecha:</strong> Busca ventas en períodos específicos</li>
              <li><strong>Filtrar por usuario:</strong> Ve ventas de empleados específicos</li>
              <li><strong>Detalles de venta:</strong> Haz clic para ver productos vendidos</li>
            </ul>

            <h5>🕒 Historial de Turnos:</h5>
            <ul>
              <li>Ve todos los turnos de trabajo</li>
              <li>Revisa totales vendidos por turno</li>
              <li>Analiza productividad por empleado</li>
            </ul>

            <h5>🔍 Auditoría del Sistema:</h5>
            <h6>📦 Cambios en Productos:</h6>
            <ul>
              <li><strong>Filtrar por ID de Producto:</strong> Ve cambios de un producto específico</li>
              <li><strong>Filtrar por Usuario:</strong> Escribe nombre de usuario (ej: "AdminTest")</li>
              <li><strong>Filtrar por Acción:</strong> Creado, Actualizado, Eliminado</li>
              <li><strong>Ver Detalles:</strong> Haz clic en "Ver cambios" para detalles completos</li>
            </ul>

            <h6>📊 Conteos Físicos:</h6>
            <ul>
              <li>Historial de ajustes de inventario</li>
              <li>Diferencias entre stock teórico y real</li>
              <li>Observaciones de cada conteo</li>
            </ul>

            <div className="alert alert-success">
              <strong>💡 Tip de Filtros:</strong>
              <p>1. Escribe los filtros que deseas</p>
              <p>2. Haz clic en "Aplicar Filtros"</p>
              <p>3. Usa "Limpiar" para quitar todos los filtros</p>
            </div>
          </div>
        )

      case 'tips':
        return (
          <div>
            <h4>💡 Tips y Trucos</h4>
            
            <h5>⚡ Atajos de Teclado:</h5>
            <ul>
              <li><strong>Enter:</strong> Aplicar filtros en campos de búsqueda</li>
              <li><strong>Escape:</strong> Cerrar modales</li>
              <li><strong>Tab:</strong> Navegar entre campos</li>
            </ul>

            <h5>🚀 Flujo de Trabajo Eficiente:</h5>
            <ol>
              <li><strong>Configura Productos:</strong> Define bien categorías y márgenes</li>
              <li><strong>Entrena Personal:</strong> Asegúrate que conozcan el sistema</li>
              <li><strong>Revisa Diariamente:</strong> Verifica stock y ventas</li>
              <li><strong>Mantén Actualizado:</strong> Ajusta precios según mercado</li>
            </ol>

            <h5>🛡️ Buenas Prácticas:</h5>
            <ul>
              <li><strong>Backup Regular:</strong> Respalda la base de datos</li>
              <li><strong>Contraseñas Seguras:</strong> Cambia las contraseñas por defecto</li>
              <li><strong>Permisos Apropiados:</strong> Solo da acceso necesario a cada usuario</li>
              <li><strong>Verificación:</strong> Siempre verifica totales antes de cobrar</li>
            </ul>

            <h5>🔧 Solución de Problemas:</h5>
            <div className="alert alert-warning">
              <h6>❌ Si algo no funciona:</h6>
              <ol>
                <li>Recarga la página (F5)</li>
                <li>Asegúrate de tener permisos suficientes</li>
                <li>Contacta al administrador si persiste</li>
              </ol>
            </div>
          </div>
        )

      default:
        return <div>Sección no encontrada</div>
    }
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              📖 Manual de Usuario - Sistema POS
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row">
              {/* Navegación lateral */}
              <div className="col-md-3">
                <div className="nav flex-column nav-pills">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className={`nav-link text-start mb-2 ${
                        activeSection === section.id ? 'active' : ''
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.icon} {section.title}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Contenido principal */}
              <div className="col-md-9">
                <div className="manual-content">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide}
            >
              Cerrar Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}