# POS System - Sistema de Punto de Venta

Sistema completo de punto de venta desarrollado con Flask (backend) y Next.js (frontend).

## 🚀 Inicio Rápido

### Para usuarios nuevos:
1. Ejecutar `init_database.bat` para crear la base de datos
2. Ejecutar `start-system.bat` para iniciar el sistema completo

### Usuario por defecto:
- **Usuario:** admin
- **Contraseña:** 123456

## 📋 Características

### 🛒 Punto de Venta
- ✅ Venta de productos por unidad y por kilogramo
- ✅ Gestión de carrito de compras
- ✅ Múltiples métodos de pago (efectivo, débito, crédito)
- ✅ Sistema de cambio automático
- ✅ Suspensión y recuperación de ventas
- ✅ Historial de turnos y ventas

### 📦 Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Categorías organizadas
- ✅ Control de stock
- ✅ Márgenes de ganancia para todos los productos
- ✅ Precios sin decimales (adaptado para pesos chilenos)

### 👥 Gestión de Usuarios
- ✅ Control de acceso por roles
- ✅ Gestión de cajeros
- ✅ Autenticación segura

### 📊 Reportes
- ✅ Historial de ventas
- ✅ Control de turnos
- ✅ Estadísticas de productos

## 🛠️ Instalación Manual

### Requisitos
- Python 3.8+
- Node.js 18+
- npm

### Backend (Flask)
```bash
# Activar entorno virtual
PossApp\Scripts\activate.bat

# Instalar dependencias (ya instaladas)
pip install -r requirements.txt

# Inicializar base de datos (primera vez)
python init_database.py

# Ejecutar servidor
python app.py
```

### Frontend (Next.js)
```bash
# Ir al directorio frontend
cd poss-app-front

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Estructura del Proyecto

```
POS APP/
├── app.py                 # Servidor Flask principal
├── requirements.txt       # Dependencias Python
├── init_database.py      # Inicializador de base de datos
├── init_database.bat     # Script de inicialización
├── start-system.bat      # Iniciador completo del sistema
├── README.md             # Este archivo
├── .gitignore           # Archivos a ignorar en git
├── instance/
│   └── blog.db          # Base de datos SQLite
├── models/              # Modelos de datos
│   ├── __init__.py
│   ├── user.py
│   ├── article.py
│   └── sale.py
├── poss-app-front/      # Aplicación Next.js
│   ├── app/             # Páginas y layouts
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   └── types/           # Definiciones TypeScript
└── PossApp/             # Entorno virtual Python
    └── ...
```

## 📱 URLs del Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 🎯 Uso del Sistema

1. **Inicio de Sesión:** Usar credenciales por defecto (admin/123456)
2. **Gestión de Productos:** Agregar categorías y productos desde el menú
3. **Punto de Venta:** Seleccionar productos, agregar al carrito, procesar pago
4. **Reportes:** Ver historial de ventas y turnos

## 🔒 Roles y Permisos

- **Admin:** Acceso completo al sistema
- **Cajero:** Acceso a POS y consultas básicas

## 💰 Sistema de Precios

- Márgenes de ganancia configurables
- Soporte para productos por unidad y por peso

## 🛡️ Seguridad

- Autenticación basada en tokens
- Control de acceso por roles
- Validación en frontend y backend

## 📞 Soporte

Para problemas o consultas sobre el sistema, verificar:
1. Que ambos servidores estén ejecutándose
2. Que la base de datos esté inicializada
3. Que las dependencias estén instaladas correctamente

---