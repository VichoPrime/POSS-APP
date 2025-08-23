# SISTEMA POS - PUNTO DE VENTA
Sistema completo para control de inventarios, ventas, turnos y devoluciones
La creación de la base de datos fue realizada con Thunder Client

##  INSTALACIÓN Y CONFIGURACIÓN

### Navegar al directorio principal
cd "C:\Users\vicen\Desktop\POS APP"

### Crear entorno virtual Python
python -m venv PossApp

### Activar entorno virtual
En Windows:
PossApp\Scripts\activate

En Linux/Mac:
source PossApp/bin/activate

### Dependencias Backend (versiones específicas en requirements.txt)
Con el entorno virtual activado:
pip install flask
pip install flask-sqlalchemy
pip install flask-cors
pip install werkzeug

### Iniciar Frontend
cd poss-app-front
npm install
npm run dev
(Se ejecuta en http://localhost:3000)

### Iniciar Backend
python app.py
(Se ejecuta en http://127.0.0.1:5000)

## BASE DE DATOS
La base de datos se crea automáticamente al iniciar app.py
Archivo: instance/blog.db (SQLite)

Tablas creadas automáticamente:
- users (usuarios del sistema)
- categories (categorías de productos)
- articles (productos/inventario)
- turnos (turnos de trabajo)
- sales (ventas realizadas)
- sale_items (items de cada venta)
- suspended_sales (ventas suspendidas)
- devoluciones (devoluciones de productos)

## 🔧 CONFIGURACIÓN INICIAL CON THUNDER CLIENT

### 1. Creación de Usuario
POST http://127.0.0.1:5000/register
Content-Type: application/json

{
  "username": "AdminTest",
  "email": "admin@pos.com",
  "password": "123456"
}

### 2. Login de Usuario
POST http://127.0.0.1:5000/login
Content-Type: application/json

{
  "email": "admin@pos.com",
  "password": "123456"
}

### 3. Creación de Categorías
POST http://127.0.0.1:5000/categories
Content-Type: application/json

{
  "name": "Lacteos"
}

{
  "name": "Bebidas"
}

{
  "name": "Snacks"
}

### 4. Creación de Productos
POST http://127.0.0.1:5000/articles
Content-Type: application/json

{
  "title": "Leche chocolate SL",
  "content": "Lonco leche de chocolate sin lactosa Light",
  "image_url": "https://unimarc.vtexassets.com/arquivos/ids/227471/000000000000572628-UN-01.jpg?v=638315320680000000",
  "stock": 30,
  "codigo_barra": "7802910000728",
  "precio": 1000,
  "activo": true,
  "category_id": 1
}

{
  "title": "Monster Energy",
  "content": "Bebida energética Monster original 473ml",
  "image_url": "https://dojiw2m9tvv09.cloudfront.net/31276/product/monster-original-473ml8732.jpg",
  "stock": 25,
  "codigo_barra": "0070847811121",
  "precio": 3500,
  "activo": true,
  "category_id": 2
}

{
  "title": "Doritos Nacho",
  "content": "Doritos sabor nacho cheese 150g",
  "image_url": "https://www.doritos.com/sites/doritos.com/files/2018-08/doritos-nacho-cheese.png",
  "stock": 40,
  "codigo_barra": "0028400064316",
  "precio": 2200,
  "activo": true,
  "category_id": 3
}

## 🛒 ENDPOINTS DE VENTAS

### Procesar Venta
POST http://127.0.0.1:5000/sales
Content-Type: application/json

{
  "cart_items": [
    {
      "id": 1,
      "title": "Monster Energy",
      "precio": 3500,
      "quantity": 2
    },
    {
      "id": 2,
      "title": "Doritos Nacho",
      "precio": 2200,
      "quantity": 1
    }
  ],
  "metodo_pago": "efectivo"
}

### Suspender Venta
POST http://127.0.0.1:5000/sales/suspend
Content-Type: application/json

{
  "cart_items": [
    {
      "id": 1,
      "title": "Monster Energy",
      "precio": 3500,
      "quantity": 3
    }
  ],
  "nota": "Cliente fue al banco por dinero"
}

### Obtener Ventas Suspendidas
GET http://127.0.0.1:5000/sales/suspended

### Retomar Venta Suspendida
POST http://127.0.0.1:5000/sales/suspended/1/resume

### Eliminar Venta Suspendida
DELETE http://127.0.0.1:5000/sales/suspended/1

##  ENDPOINTS DE DEVOLUCIONES

### Procesar Devolución
POST http://127.0.0.1:5000/returns
Content-Type: application/json

{
  "article_id": 1,
  "quantity": 2,
  "motivo": "Producto dañado al llegar"
}

### Obtener Devoluciones del Turno Actual
GET http://127.0.0.1:5000/returns

### Obtener Devoluciones por Turno Específico
GET http://127.0.0.1:5000/returns/1

## ENDPOINTS DE TURNOS

### Obtener Turno Actual
GET http://127.0.0.1:5000/turno-actual

### Cerrar Turno
POST http://127.0.0.1:5000/close-turno

### Historial de Turnos
GET http://127.0.0.1:5000/turnos-historial

### Ventas de un Turno Específico
GET http://127.0.0.1:5000/turnos/1/ventas

## 📦 ENDPOINTS DE PRODUCTOS

### Listar Productos
GET http://127.0.0.1:5000/articles

### Buscar por Código de Barras
GET http://127.0.0.1:5000/articles/barcode/7802910000728

### Actualizar Producto
PUT http://127.0.0.1:5000/articles/1
Content-Type: application/json

{
  "stock": 45,
  "precio": 3800
}

### Eliminar Producto
DELETE http://127.0.0.1:5000/articles/1

## 📊 ENDPOINTS DE CATEGORÍAS

### Listar Categorías
GET http://127.0.0.1:5000/categories

### Crear Categoría
POST http://127.0.0.1:5000/categories
Content-Type: application/json

{
  "name": "Nueva Categoría"
}

## FUNCIONALIDADES DE AUTENTICACIÓN

### Verificar Autenticación
GET http://127.0.0.1:5000/check-auth

### Cerrar Sesión
POST http://127.0.0.1:5000/logout

##  FLUJO DE TRABAJO TÍPICO

1. **Crear usuario** y hacer login
2. **Crear categorías** para organizar productos
3. **Agregar productos** con stock inicial
4. **Iniciar turno** (automático al hacer login)
5. **Procesar ventas** escaneando códigos o buscando productos
6. **Manejar ventas suspendidas** si es necesario
7. **Procesar devoluciones** cuando sea requerido
8. **Cerrar turno** al final del día

##  NOTAS IMPORTANTES

- El sistema maneja automáticamente el stock al vender y devolver productos
- Los turnos se crean automáticamente al hacer login
- Las ventas suspendidas se asocian al turno activo
- Las devoluciones actualizan el stock inmediatamente
- Todos los endpoints (excepto register/login) requieren autenticación
- Los totales netos se calculan como: Ventas - Devoluciones

##  TROUBLESHOOTING

### Error "no such column"
python -c "from app import app, db; app.app_context().push(); db.create_all(); print('BD actualizada')"

### Error de autenticación
Verificar que estás logueado y usando las cookies de sesión

### Error de stock
Verificar que hay suficiente stock antes de procesar venta

### Frontend no conecta
Verificar que CORS esté configurado correctamente en app.py

##  INTERFAZ WEB

Accede a http://localhost:3000 para usar la interfaz gráfica que incluye:
-  Punto de venta con scanner de códigos
-  Gestión de productos e inventario  
-  Sistema de ventas suspendidas
-  Procesamiento de devoluciones
-  Historial de turnos y ventas
-  Autenticación de usuarios

##  ESTRUCTURA DEL PROYECTO

POS APP/
├── app.py                 # Backend Flask
├── requirements.txt       # Dependencias Python
├── models/               # Modelos de base de datos
│   ├── user.py          # Usuarios
│   ├── article.py       # Productos y categorías
│   └── sale.py          # Ventas, turnos, devoluciones
├── instance/
│   └── blog.db          # Base de datos SQLite
└── poss-app-front/      # Frontend Next.js
    ├── app/             # Páginas de la aplicación
    ├── components/      # Componentes reutilizables
    ├── hooks/           # Hooks personalizados
    ├── services/        # Servicios de API
    └── types/           # Tipos TypeScript

¡Sistema completo de POS listo para usar! 




