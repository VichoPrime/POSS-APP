import api from "./api";

// Inventario completo
export const getInventario = () => api.get("/articles");

// Crear producto (CU 13)
export const createProducto = (data: {
  title: string;
  stock: number;
  min_stock: number;
  unidad_medida: string;
  precio: number;
  image_url?: string;
}) => api.post("/articles", data);

// Editar producto (CU 17)
export const updateProducto = (
  id: number,
  data: Partial<{
    title: string;
    stock: number;
    min_stock: number;
    unidad_medida: string;
    precio: number;
    image_url?: string;
    activo: boolean;
  }>
) => api.put(`/articles/${id}`, data);

// Ajustar stock manual (CU 14)
export const ajustarStock = (payload: { article_id: number; cantidad: number; motivo?: string }) =>
  api.post("/ajustar-stock", payload);

// Marcar producto dañado/vencido (CU 19)
export const marcarDanado = (payload: { article_id: number; cantidad: number; motivo: string }) =>
  api.post("/marcar-danado", payload);

// Conteo físico (CU 20)
export const conteoFisico = (payload: { article_id: number; stock_fisico: number }) =>
  api.post("/conteo-fisico", payload);

// Alertas de stock mínimo (CU 16)
export const getStockAlerts = () => api.get("/alertas-stock");

// Movimientos de inventario (CU 18)
export const getMovimientos = () => api.get("/movimientos");
import { useEffect, useState } from "react";