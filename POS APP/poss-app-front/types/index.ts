// types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin?: boolean;
  permissions?: {
    can_manage_products?: boolean;
    can_view_suspended_sales?: boolean;
    can_process_returns?: boolean;
    can_add_notes?: boolean;
    can_manage_inventory_losses?: boolean;
    can_perform_physical_count?: boolean;
    can_view_shift_history?: boolean;
    can_view_audit_logs?: boolean;
    can_manage_promotions?: boolean;
    can_manage_users?: boolean;
    is_admin?: boolean;
  };
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  content: string;
  precio: number;
  stock: number;
  stock_minimo?: number;
  is_low_stock?: boolean;
  barcode?: string;
  codigo_barra?: string;
  category_id?: number;
  category_name?: string;
  image_url?: string | null;
  activo?: boolean;
  unit_type?: 'unidades' | 'peso';
  peso_unitario?: number;
  margen_ganancia?: number;
  precio_costo?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SuspendedSale {
  id: number;
  ticket_number: string;
  total: number;
  items_count: number;
  items: CartItem[];
  fecha_suspension: string;
  nota?: string;
  usuario: string;
}

export interface Sale {
  id: number;
  ticket_number: string;
  total: number;
  metodo_pago: string;
  fecha_venta: string;
  user: string;
  items_count: number;
  nota?: string;  // Campo para notas de la venta
  items: Array<{
    article_title: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export interface Devolucion {
  id: number;
  ticket_number: string;
  article_title: string;
  quantity: number;
  unit_price: number;
  total: number;
  motivo: string;
  fecha_devolucion: string;
  usuario: string;
}

export interface TurnoResumen {
  turno_id: number;
  fecha_inicio: string;
  fecha_cierre: string | null;  // Puede ser null si el turno está activo
  usuario: string;
  total_ventas: number;
  total_efectivo: number;
  total_tarjeta: number;
  cantidad_ventas: number;
  total_devoluciones: number;
  cantidad_devoluciones: number;
}