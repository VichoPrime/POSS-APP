"use client";

import { useEffect, useState } from "react";
import { getStockAlerts } from "@/services/inventory";

interface Articulo {
  id: number;
  title: string;
  stock: number;
  min_stock: number;
  unidad_medida: string;
  categoria?: string;
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStockAlerts()
      .then((res) => {
        setAlertas(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando alertas:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Cargando alertas...</p>;

  return (
    <div>
      <h1 className="text-2xl fw-bold mb-4">🚨 Alertas de Stock</h1>
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Producto</th>
            <th>Stock actual</th>
            <th>Mínimo</th>
            <th>Unidad</th>
            <th>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {alertas.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4">
                ✅ No hay productos en alerta
              </td>
            </tr>
          ) : (
            alertas.map((a) => (
              <tr key={a.id} className="table-danger">
                <td>{a.title}</td>
                <td>{a.stock}</td>
                <td>{a.min_stock}</td>
                <td>{a.unidad_medida || "unidad"}</td>
                <td>{a.categoria || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
