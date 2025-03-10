# API Backend - Tienda App

Este repositorio contiene el backend para nuestra aplicación de tienda, proporcionando una API RESTful para gestionar usuarios, productos, carritos, pedidos y perfiles.

## Tecnologías Utilizadas

- Node.js
- Express
- MongoDB
- JWT para autenticación
- Express Validator para validación de datos
- Multer para gestión de uploads de archivos
- CORS para comunicación segura con el frontend

## Estructura del Proyecto

```
backend/
├── middlewares/     # Middlewares personalizados (auth, upload)
├── models/          # Modelos de datos MongoDB (User, Order, Cart, etc.)
├── routes/          # Rutas de la API (users, orders, carts, profiles)
├── uploads/         # Directorio para archivos subidos (imágenes de perfil)
├── .env             # Variables de entorno (no incluido en el repositorio)
├── .gitignore       # Archivos excluidos del repositorio
├── package.json     # Dependencias del proyecto
└── server.js        # Punto de entrada de la aplicación
```

## Requisitos Previos

- Node.js v14 o superior
- MongoDB instalado y ejecutándose localmente o una conexión a MongoDB Atlas
- npm o yarn

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/PolCarva/gopersonal-backend.git
   cd backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/tienda-app
   JWT_SECRET=tu_clave_secreta_para_jwt
   ```

## Ejecución

Para iniciar el servidor en modo desarrollo con recarga automática:
```bash
npm run dev
```

Para iniciar el servidor en modo producción:
```bash
npm start
```
