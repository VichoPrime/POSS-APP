# 🛒 POSS-APP - Sistema de Punto de Venta

Sistema completo de punto de venta (POS) desarrollado con **Flask** (backend) y **Next.js** (frontend). Diseñado para negocios minoristas con gestión completa de inventario, ventas, usuarios y reportes.

## ✨ Características Principales

### 🛍️ Punto de Venta
- Venta de productos por unidad y por kilogramo
- Gestión de carrito de compras en tiempo real
- Múltiples métodos de pago (efectivo, débito, crédito)
- Sistema de cambio automático
- Suspensión y recuperación de ventas
- Devoluciones de productos
- Historial completo de transacciones

### 📦 Gestión de Inventario
- CRUD completo de productos
- Organización por categorías
- Control de stock en tiempo real
- Registro de pérdidas de inventario
- Conteo físico de inventario
- Márgenes de ganancia configurables
- Soporte de imágenes de productos

### 👥 Gestión de Usuarios
- Sistema de autenticación seguro
- Control de acceso basado en roles (Admin/Cajero)
- Gestión de permisos granulares
- Registro de actividades por usuario

### 📊 Reportes y Estadísticas
- Historial detallado de ventas
- Control de turnos de trabajo
- Gráficos de rendimiento
- Exportación de reportes en PDF/Excel
- Análisis de productos más vendidos

### 💰 Gestión Financiera
- Sistema de promociones y descuentos
- Cálculo automático de ganancias
- Precios sin decimales (adaptado para CLP)
- Resumen de ventas por turno

## 🚀 Instalación

### Requisitos Previos
- Python 3.8 o superior
- Node.js 18 o superior
- npm o yarn
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/VichoPrime/POSS-APP.git
cd POSS-APP
```

### 2. Configurar el Backend (Flask)

#### Crear y activar entorno virtual
```bash
# Windows
python -m venv PossApp
PossApp\Scripts\activate.bat

# Linux/Mac
python3 -m venv PossApp
source PossApp/bin/activate
```

#### Instalar dependencias
```bash
pip install -r requirements.txt
```

#### Inicializar la base de datos
```bash
# Windows
init_database.bat

# Linux/Mac
python init_database.py
```

### 3. Configurar el Frontend (Next.js)

```bash
cd poss-app-front
npm install
```

## 🎯 Ejecución del Sistema

### Opción 1: Script Automático (Windows)
```bash
start-system.bat
```

### Opción 2: Ejecución Manual

#### Terminal 1 - Backend
```bash
# Activar entorno virtual
PossApp\Scripts\activate.bat

# Iniciar servidor Flask
python app.py
```

#### Terminal 2 - Frontend
```bash
cd poss-app-front
npm run dev
```

### URLs de Acceso
- **Frontend (Interfaz):** http://localhost:3000
- **Backend (API):** http://localhost:5000

### Credenciales por Defecto
- **Usuario:** `admin`
- **Contraseña:** `123456`

> ⚠️ **Importante:** Cambia estas credenciales después de la primera instalación

## 🏗️ Estructura del Proyecto

```
POSS-APP/
├── 📁 Backend (Flask)
│   ├── app.py                    # Servidor Flask principal
│   ├── requirements.txt          # Dependencias Python
│   ├── init_database.py         # Inicializador de base de datos
│   ├── init_database.bat        # Script de inicialización (Windows)
│   ├── start-system.bat         # Iniciador del sistema completo
│   ├── models/                  # Modelos de base de datos
│   │   ├── user.py              # Modelo de usuarios
│   │   ├── article.py           # Modelo de productos
│   │   ├── sale.py              # Modelo de ventas
│   │   ├── discount.py          # Modelo de descuentos
│   │   ├── history.py           # Modelo de historial
│   │   ├── inventory_loss.py    # Modelo de pérdidas
│   │   └── physical_inventory.py # Modelo de conteo físico
│   ├── static/
│   │   └── uploads/             # Imágenes de productos
│   └── templates/               # Plantillas HTML
│
└── 📁 Frontend (Next.js)
    └── poss-app-front/
        ├── app/                 # Páginas de la aplicación
        │   ├── page.tsx         # Página principal (POS)
        │   ├── productos/       # Gestión de productos
        │   ├── promociones/     # Gestión de descuentos
        │   ├── gestion-usuarios/ # Gestión de usuarios
        │   ├── historial-turnos/ # Historial de turnos
        │   ├── historiales/     # Historial de ventas
        │   ├── perdidas-inventario/ # Registro de pérdidas
        │   └── conteo-fisico/   # Conteo de inventario
        ├── components/          # Componentes React reutilizables
        ├── hooks/              # Custom hooks (useAuth, useCart)
        ├── services/           # Servicios API
        └── types/              # Tipos TypeScript
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask** - Framework web de Python
- **Flask-SQLAlchemy** - ORM para base de datos
- **Flask-CORS** - Manejo de CORS
- **SQLite** - Base de datos
- **Werkzeug** - Utilidades WSGI

### Frontend
- **Next.js 14** - Framework de React
- **TypeScript** - Lenguaje tipado
- **Tailwind CSS** - Framework de estilos
- **React Hooks** - Gestión de estado
- **Fetch API** - Comunicación con backend

## 📖 Guía de Uso

### 1. Primer Inicio de Sesión
Accede con las credenciales por defecto y cambia la contraseña inmediatamente desde la gestión de usuarios.

### 2. Configuración Inicial
1. Crea las categorías de productos necesarias
2. Agrega los productos con sus precios y márgenes
3. Configura usuarios adicionales si es necesario

### 3. Operación Diaria
1. Inicia sesión con tu usuario
2. Realiza ventas desde la página principal
3. Gestiona el inventario según sea necesario
4. Revisa los reportes al final del turno

### 4. Gestión de Productos
- Usa imágenes en formato JPG, PNG o WEBP
- Define si el producto se vende por unidad o peso
- Establece el margen de ganancia deseado

### 5. Sistema de Turnos
- Cada venta se registra en el turno actual
- Puedes exportar el resumen del turno en PDF o Excel
- Los reportes incluyen ventas, métodos de pago y ganancias

## 🔒 Roles y Permisos

| Función | Admin | Cajero |
|---------|-------|--------|
| Realizar ventas | ✅ | ✅ |
| Gestionar productos | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |
| Ver reportes | ✅ | ✅ |
| Gestionar descuentos | ✅ | ❌ |
| Registrar pérdidas | ✅ | ✅ |
| Conteo físico | ✅ | ✅ |

## 🐛 Solución de Problemas

### El backend no inicia
- Verifica que el entorno virtual esté activado
- Asegúrate de tener instaladas todas las dependencias
- Revisa que el puerto 5000 no esté en uso

### El frontend no inicia
- Verifica que Node.js esté instalado
- Ejecuta `npm install` nuevamente
- Revisa que el puerto 3000 no esté en uso

### Error de conexión entre frontend y backend
- Asegúrate de que ambos servidores estén corriendo
- Verifica que el backend esté en el puerto 5000
- Revisa la configuración de CORS en `app.py`

### La base de datos no se crea ("unable to open database file")
- Asegúrate de ejecutar `init_database.bat` desde el directorio raíz del proyecto
- Verifica que tienes permisos de escritura en la carpeta
- Si el error persiste, crea manualmente la carpeta `instance` en la raíz del proyecto
- En caso de error, elimina la carpeta `instance` si existe y vuelve a inicializar

## 🚀 Despliegue en Producción

### Backend
1. Configura una base de datos PostgreSQL o MySQL
2. Actualiza las variables de entorno
3. Usa un servidor WSGI como Gunicorn
4. Configura HTTPS con certificado SSL

### Frontend
```bash
cd poss-app-front
npm run build
npm start
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz un Fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autores

**VichoPrime**
- GitHub: [@VichoPrime](https://github.com/VichoPrime)

**naiki919**
- GitHub: [@naiki919](https://github.com/naiki919)

## 🙏 Agradecimientos

Gracias a todos los que contribuyen al desarrollo y mejora de este sistema.

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub