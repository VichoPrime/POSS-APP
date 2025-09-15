"use client";

import { useEffect, useState } from "react";
import { getMovimientos } from "@/services/inventory";

interface Movimiento {
  id: number;
  article: string;
  unidad_medida: string;
  type: string;
  quantity: number;
  reason: string;
  usuario: string;
  fecha: string;
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMovimientos()
      .then((res) => {
        setMovimientos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando movimientos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Cargando movimientos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Movimientos</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Producto</th>
            <th className="border p-2">Unidad</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Razón</th>
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center p-4">
                No hay movimientos registrados
              </td>
            </tr>
          ) : (
            movimientos.map((m) => (
              <tr key={m.id}>
                <td className="border p-2">{m.article}</td>
                <td className="border p-2">{m.unidad_medida}</td>
                <td className="border p-2 capitalize">{m.type}</td>
                <td className="border p-2">{m.quantity}</td>
                <td className="border p-2">{m.reason}</td>
                <td className="border p-2">{m.usuario}</td>
                <td className="border p-2">{m.fecha}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
