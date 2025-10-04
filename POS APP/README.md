# Sistema POS (Point of Sale)

Sistema de punto de venta completo desarrollado con Flask (backend) y Next.js (frontend).

## 📋 Características

- **Gestión de productos**: Agregar, editar, eliminar y buscar productos
- **Sistema de ventas**: Procesamiento de ventas con múltiples formas de pago
- **Control de inventario**: Seguimiento de stock y pérdidas de inventario
- **Gestión de usuarios**: Sistema de roles y permisos
- **Promociones y descuentos**: Gestión de ofertas especiales
- **Historial de turnos**: Seguimiento de actividades por turno
- **Conteo físico**: Herramientas para inventario físico
- **Reportes**: Historial de ventas y transacciones

## 🛠️ Tecnologías

### Backend
- **Python 3.12+**
- **Flask 3.1.1**
- **SQLAlchemy** (Base de datos)
- **Flask-CORS** (Manejo de CORS)

### Frontend
- **Next.js 15.1.3**
- **React 18**
- **TypeScript**
- **Bootstrap 5.3.0**
- **Axios** (Cliente HTTP)

## 📦 Instalación

### Prerrequisitos

1. **Python 3.12 o superior** - [Descargar Python](https://www.python.org/downloads/)
2. **Node.js 18 o superior** - [Descargar Node.js](https://nodejs.org/)
3. **Git** - [Descargar Git](https://git-scm.com/)

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/VichoPrime/POSS-APP.git
cd pos-app
```

### Paso 2: Configurar el Backend (Flask)

1. **Crear entorno virtual de Python:**
   ```bash
   python -m venv venv
   ```

2. **Activar entorno virtual:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Instalar dependencias de Python:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Inicializar la base de datos:**
   ```bash
   python init_database.py
   ```

### Paso 3: Configurar el Frontend (Next.js)

1. **Navegar a la carpeta del frontend:**
   ```bash
   cd poss-app-front
   ```

2. **Instalar dependencias de Node.js:**
   ```bash
   npm install
   ```

### Paso 4: Ejecutar la aplicación

#### Opción A: Usar los scripts automatizados (Recomendado para Windows)

1. **Ejecutar el script de inicio:**
   ```bash
   start-system.bat
   ```
   Este script iniciará automáticamente tanto el backend como el frontend.

#### Opción B: Ejecutar manualmente

1. **Iniciar el backend (Terminal 1):**
   ```bash
   # Asegúrate de estar en la carpeta raíz del proyecto con el entorno virtual activado
   python app.py
   ```
   El backend se ejecutará en: `http://localhost:5000`

2. **Iniciar el frontend (Terminal 2):**
   ```bash
   cd poss-app-front
   npm run dev
   ```
   El frontend se ejecutará en: `http://localhost:3000`

### Paso 5: Acceder a la aplicación

1. Abre tu navegador web
2. Ve a: `http://localhost:3000`
3. El sistema estará listo para usar

## 🔧 Configuración

### Variables de entorno

El sistema está configurado para desarrollo local. Para producción, considera configurar:

- **SECRET_KEY**: Cambia la clave secreta en `app.py`
- **DATABASE_URI**: Configura una base de datos más robusta (PostgreSQL, MySQL)
- **CORS_ORIGINS**: Ajusta los orígenes permitidos para CORS

### Base de datos

Por defecto, el sistema usa SQLite (`blog.db`). Para cambiar la base de datos:

1. Modifica `SQLALCHEMY_DATABASE_URI` en `app.py`
2. Instala el driver correspondiente
3. Ejecuta nuevamente `python init_database.py`

## 📁 Estructura del proyecto

```
pos-app/
├── app.py                 # Aplicación Flask principal
├── requirements.txt       # Dependencias Python
├── init_database.py      # Script de inicialización DB
├── start-system.bat      # Script de inicio automático
├── models/               # Modelos de base de datos
│   ├── article.py
│   ├── user.py
│   ├── sale.py
│   └── ...
├── static/               # Archivos estáticos
│   └── uploads/         # Imágenes de productos
└── poss-app-front/      # Aplicación Next.js
    ├── app/             # Páginas de Next.js
    ├── components/      # Componentes React
    ├── hooks/          # Hooks personalizados
    ├── services/       # Servicios API
    └── types/          # Tipos TypeScript
```

## 🚀 Desarrollo

### Comandos útiles

- **Reiniciar base de datos:**
  ```bash
  python init_database.py
  ```

- **Instalar nueva dependencia Python:**
  ```bash
  pip install nueva-dependencia
  pip freeze > requirements.txt
  ```

- **Instalar nueva dependencia Node.js:**
  ```bash
  cd poss-app-front
  npm install nueva-dependencia
  ```

### Puertos por defecto

- **Backend (Flask)**: `http://localhost:5000`
- **Frontend (Next.js)**: `http://localhost:3000`

## 🐛 Resolución de problemas

### Error: "Puerto ya en uso"

Si encuentras errores de puerto ocupado:

1. **Backend (Puerto 5000):**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Frontend (Puerto 3000):**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Error: "Módulo no encontrado"

1. Verifica que el entorno virtual esté activado
2. Reinstala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

### Error de CORS

Si tienes problemas de CORS, verifica que:
1. El frontend esté ejecutándose en `http://localhost:3000`
2. El backend esté configurado para permitir ese origen

## 📄 Licencia

[MIT License](LICENSE)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas, por favor abre un [issue](https://github.com/tu-usuario/pos-app/issues) en GitHub.

---

**¡Gracias por usar nuestro Sistema POS!** 🛒✨

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