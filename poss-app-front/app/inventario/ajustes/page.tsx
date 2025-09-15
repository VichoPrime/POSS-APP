"use client";

import { useEffect, useState } from "react";
import { getInventario, ajustarStock } from "@/services/inventory";

interface Articulo {
  id: number;
  title: string;
  stock: number;
}

export default function AjustesPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [cantidad, setCantidad] = useState<number>(0);
  const [motivo, setMotivo] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    getInventario()
      .then((res) => setArticulos(res.data))
      .catch((err) => console.error("Error cargando inventario:", err));
  }, []);

  const handleSubmit = async (tipo: "add" | "remove", e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || cantidad <= 0) {
      setMensaje("Selecciona un producto y una cantidad mayor que 0");
      return;
    }

    try {
      const factor = tipo === "add" ? 1 : -1;
      const res = await ajustarStock({
        article_id: Number(selectedId),
        cantidad: cantidad * factor,
        motivo,
      });
      setMensaje(res.data.message || "Ajuste realizado correctamente");
    } catch (err) {
      console.error("Error en ajuste de stock:", err);
      setMensaje("❌ Error al ajustar stock");
    }
  };

  return (
    <div>
      <h1 className="text-2xl fw-bold mb-4">Ajustes de Stock</h1>

      <div className="mb-4">
        <label className="form-label">Producto</label>
        <select
          className="form-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">Selecciona un producto</option>
          {articulos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} (Stock actual: {a.stock})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label">Cantidad</label>
        <input
          type="number"
          className="form-control"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Motivo</label>
        <input
          type="text"
          className="form-control"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ejemplo: ajuste por merma, carga inicial..."
        />
      </div>

      <div className="d-flex gap-3">
        <button
          onClick={(e) => handleSubmit("add", e)}
          className="btn btn-success"
        >
          ➕ Añadir stock
        </button>
        <button
          onClick={(e) => handleSubmit("remove", e)}
          className="btn btn-danger"
        >
          ➖ Retirar stock
        </button>
      </div>

      {mensaje && <div className="alert alert-info mt-4">{mensaje}</div>}
    </div>
  );
}
