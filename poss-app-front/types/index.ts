// types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
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
  barcode?: string;
  codigo_barra?: string;
  category_id?: number;
  category_name?: string;
  image_url?: string | null;
  activo?: boolean;
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