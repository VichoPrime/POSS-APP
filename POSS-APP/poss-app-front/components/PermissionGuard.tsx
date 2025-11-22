import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface PermissionGuardProps {
  permission: keyof NonNullable<NonNullable<ReturnType<typeof useAuth>['user']>['permissions']>
  children: React.ReactNode
  fallback?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { user, loading } = useAuth()

  console.log(`[PermissionGuard] Verificando permiso: ${permission}`);
  console.log(`[PermissionGuard] Usuario:`, user);
  console.log(`[PermissionGuard] Loading:`, loading);

  // Si estamos cargando, mostrar spinner
  if (loading) {
    console.log(`[PermissionGuard] ⏳ Cargando autenticación...`);
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de cargar, mostrar fallback
  if (!user) {
    console.log(`[PermissionGuard] ❌ No hay usuario autenticado`);
    return <>{fallback}</>;
  }

  // Los administradores tienen todos los permisos
  if (user?.is_admin) {
    console.log(`[PermissionGuard] ✅ Admin tiene acceso a ${permission}`);
    return <>{children}</>
  }

  // Verificar si el usuario tiene el permiso específico
  const hasPermission = user?.permissions?.[permission]
  console.log(`[PermissionGuard] ¿Usuario tiene ${permission}?:`, hasPermission);

  if (!hasPermission) {
    console.log(`[PermissionGuard] ❌ Acceso denegado para ${permission}`);
    console.log(`[PermissionGuard] Mostrando fallback`);
    return <>{fallback}</>
  }

  console.log(`[PermissionGuard] ✅ Acceso permitido para ${permission}`);
  return <>{children}</>
}

export default PermissionGuard

// Hook personalizado para verificar permisos
export const usePermissions = () => {
  const { user, loading } = useAuth()

  const hasPermission = (permission: keyof NonNullable<NonNullable<ReturnType<typeof useAuth>['user']>['permissions']>) => {
    console.log(`[usePermissions] Verificando permiso: ${permission}`);
    console.log(`[usePermissions] Usuario:`, user);
    console.log(`[usePermissions] Loading:`, loading);
    console.log(`[usePermissions] user.is_admin:`, user?.is_admin);
    console.log(`[usePermissions] user.permissions:`, user?.permissions);
    
    // Si estamos cargando, retornar false para ser conservador
    if (loading) {
      console.log(`[usePermissions] ⏳ Cargando, retornando false`);
      return false;
    }
    
    if (user?.is_admin) {
      console.log(`[usePermissions] ✅ Admin tiene todos los permisos`);
      return true;
    }
    
    const hasSpecificPermission = user?.permissions?.[permission] || false;
    console.log(`[usePermissions] ¿Tiene ${permission}?:`, hasSpecificPermission);
    
    return hasSpecificPermission;
  }

  const isAdmin = () => user?.is_admin || false

  return {
    hasPermission,
    isAdmin,
    permissions: user?.permissions || {},
    loading
  }
}