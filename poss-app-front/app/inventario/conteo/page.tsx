"use client";

import { useEffect, useState } from "react";
import { getInventario, conteoFisico } from "@/services/inventory";

interface Articulo {
  id: number;
  title: string;
  stock: number;
}

export default function ConteoPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [stockFisico, setStockFisico] = useState<number>(0);
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    getInventario()
      .then((res) => setArticulos(res.data))
      .catch((err) => console.error("Error cargando inventario:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setMensaje("Selecciona un producto");
      return;
    }

    try {
      const res = await conteoFisico({
        article_id: Number(selectedId),
        stock_fisico: stockFisico,
      });
      setMensaje(res.data.message);
    } catch (err) {
      console.error("Error en conteo físico:", err);
      setMensaje("❌ Error al actualizar inventario físico");
    }
  };

  return (
    <div>
      <h1 className="text-2xl fw-bold mb-4">Verificación Física</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="mb-3">
          <label className="form-label">Producto</label>
          <select
            className="form-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Selecciona un producto</option>
            {articulos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} (Stock registrado: {a.stock})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Stock físico</label>
          <input
            type="number"
            className="form-control"
            value={stockFisico}
            onChange={(e) => setStockFisico(Number(e.target.value))}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Actualizar
        </button>
      </form>

      {mensaje && <div className="alert alert-info mt-4">{mensaje}</div>}
    </div>
  );
}
