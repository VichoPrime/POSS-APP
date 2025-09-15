"use client";

import { useEffect, useState } from "react";
import { getInventario, createProducto, updateProducto, marcarDanado } from "@/services/inventory";

interface Articulo {
  id: number;
  title: string;
  stock: number;
  min_stock: number;
  unidad_medida: string;
  precio: number;
  activo: boolean;
  image_url?: string;
}

export default function ProductosPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario de creación
  const [nuevo, setNuevo] = useState({
    title: "",
    stock: 0,
    min_stock: 0,
    unidad_medida: "unidad",
    precio: 0,
    image_url: "",
  });

  // Edición
  const [editando, setEditando] = useState<Articulo | null>(null);

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = () => {
    getInventario()
      .then((res) => {
        setArticulos(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando inventario:", err);
        setLoading(false);
      });
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createProducto(nuevo);
      setMensaje(`✅ Producto ${res.data.title} creado correctamente`);
      setNuevo({ title: "", stock: 0, min_stock: 0, unidad_medida: "unidad", precio: 0, image_url: "" });
      cargarInventario();
    } catch (err) {
      console.error("Error creando producto:", err);
      setMensaje("❌ Error al crear producto");
    }
  };

  const handleEditar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editando) return;

    try {
      await updateProducto(editando.id, editando);
      setMensaje(`✏️ Producto ${editando.title} actualizado`);
      setEditando(null);
      cargarInventario();
    } catch (err) {
      console.error("Error editando producto:", err);
      setMensaje("❌ Error al editar producto");
    }
  };

  const handleDanado = async (id: number, cantidad: number, motivo: string) => {
    try {
      await marcarDanado({ article_id: id, cantidad, motivo });
      setMensaje("🗑️ Producto marcado como dañado/vencido");
      cargarInventario();
    } catch (err) {
      console.error("Error marcando dañado:", err);
      setMensaje("❌ Error al marcar producto");
    }
  };

  if (loading) return <p className="p-4">Cargando productos...</p>;

  return (
    <div>
      <h1 className="text-2xl fw-bold mb-4">Gestión de Productos</h1>

      {/* Formulario de creación */}
      <div className="mb-5">
        <h3>➕ Crear producto</h3>
        <form onSubmit={handleCrear} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={nuevo.title}
              onChange={(e) => setNuevo({ ...nuevo, title: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Stock inicial</label>
            <input
              type="number"
              className="form-control"
              value={nuevo.stock}
              onChange={(e) => setNuevo({ ...nuevo, stock: Number(e.target.value) })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Mínimo</label>
            <input
              type="number"
              className="form-control"
              value={nuevo.min_stock}
              onChange={(e) => setNuevo({ ...nuevo, min_stock: Number(e.target.value) })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Unidad</label>
            <input
              type="text"
              className="form-control"
              value={nuevo.unidad_medida}
              onChange={(e) => setNuevo({ ...nuevo, unidad_medida: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Precio</label>
            <input
              type="number"
              className="form-control"
              value={nuevo.precio}
              onChange={(e) => setNuevo({ ...nuevo, precio: Number(e.target.value) })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">URL de la imagen</label>
            <input
              type="text"
              className="form-control"
              value={nuevo.image_url}
              onChange={(e) => setNuevo({ ...nuevo, image_url: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-success">
              Crear
            </button>
          </div>
        </form>
      </div>

      {/* Listado de productos */}
      <h3>📋 Lista de productos</h3>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((a) => (
            <tr key={a.id}>
              <td>
                {a.image_url ? (
                  <img src={a.image_url} alt={a.title} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                ) : (
                  "—"
                )}
              </td>
              <td>{a.title}</td>
              <td>{a.stock}</td>
              <td>{a.min_stock}</td>
              <td>{a.unidad_medida}</td>
              <td>${a.precio}</td>
              <td>{a.activo ? "Activo" : "Inactivo"}</td>
              <td className="d-flex gap-2">
                {/* Botón Editar */}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setEditando({ ...a })}
                >
                  Editar
                </button>
                {/* Botón Marcar dañado */}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDanado(a.id, 1, "Producto dañado")}
                >
                  Dañado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {editando && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleEditar}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar producto</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditando(null)}
                  />
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editando.title}
                      onChange={(e) => setEditando({ ...editando, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editando.stock}
                      onChange={(e) => setEditando({ ...editando, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Mínimo</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editando.min_stock}
                      onChange={(e) => setEditando({ ...editando, min_stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Unidad</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editando.unidad_medida}
                      onChange={(e) => setEditando({ ...editando, unidad_medida: e.target.value })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Precio</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editando.precio}
                      onChange={(e) => setEditando({ ...editando, precio: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">URL de imagen</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editando.image_url || ""}
                      onChange={(e) => setEditando({ ...editando, image_url: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={editando.activo ? "1" : "0"}
                      onChange={(e) =>
                        setEditando({ ...editando, activo: e.target.value === "1" })
                      }
                    >
                      <option value="1">Activo</option>
                      <option value="0">Inactivo</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditando(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {mensaje && <div className="alert alert-info mt-4">{mensaje}</div>}
    </div>
  );
}
