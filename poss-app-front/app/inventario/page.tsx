"use client";

import { useEffect, useState } from "react";
import { getInventario } from "@/services/inventory";

interface Articulo {
  id: number;
  title: string;
  stock: number;
  min_stock: number;
  unidad_medida: string;
  precio: number;
  activo: boolean;
}

export default function InventarioPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInventario()
      .then((res) => {
        setArticulos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando inventario:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Cargando inventario...</p>;

  return (
    <div>
      <h1 className="text-2xl fw-bold mb-4">Inventario Completo</h1>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Producto</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {articulos.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4">
                No hay productos en inventario
              </td>
            </tr>
          ) : (
            articulos.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td>
                <td>{a.stock}</td>
                <td>{a.min_stock}</td>
                <td>{a.unidad_medida || "unidad"}</td>
                <td>${a.precio}</td>
                <td>{a.activo ? "Activo" : "Inactivo"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
