"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/inventario", label: "📦 Inventario" },
    { href: "/inventario/movimientos", label: "📜 Informe de Movimientos" },
    { href: "/inventario/conteo", label: "📝 Verificación Física" }, // nombre más intuitivo
    { href: "/inventario/ajustes", label: "⚙️ Ajustes" },
  ];

    return (
      <div className="d-flex" style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside className="bg-light border-end p-3" style={{ width: "240px" }}>
          <h4 className="mb-4">Menú Inventario</h4>
          <nav className="nav flex-column">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                <span
                  className={`d-block px-3 py-2 rounded ${
                    pathname === item.href ? "bg-primary text-white" : "text-dark hover:bg-light"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>
  
        {/* Main content */}
        <main className="flex-grow-1 p-4">{children}</main>
      </div>
    );
  }
