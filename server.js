const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Configuración de variables de entorno
dotenv.config();

// Importación de rutas
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profiles');
const cartRoutes = require('./routes/carts');

// Inicialización de la aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Asegurarse de que la carpeta uploads exista antes de configurar la ruta estática
const uploadsPath = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsPath)) {
    console.log(`Creando directorio de uploads en: ${uploadsPath}`);
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  
  // Verificar permisos de escritura
  fs.accessSync(uploadsPath, fs.constants.W_OK);
  console.log(`Directorio de uploads verificado con permisos: ${uploadsPath}`);
} catch (error) {
  console.error(`ERROR CRÍTICO: No se puede configurar el directorio de uploads: ${error.message}`);
  console.error('Esto afectará la funcionalidad de carga de imágenes');
}

// Configuración avanzada para servir archivos estáticos con más detalle en logs
console.log(`Configurando ruta estática /uploads en: ${uploadsPath}`);
app.use('/uploads', (req, res, next) => {
  // Log de cada solicitud a /uploads
  console.log(`[${new Date().toISOString()}] Solicitud de archivo: ${req.url}`);
  
  // Verificar primero que el archivo existe para dar mejor información
  const requestedFilePath = path.join(uploadsPath, req.url);
  fs.access(requestedFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`Archivo no encontrado: ${requestedFilePath}`);
    } else {
      console.log(`Sirviendo archivo: ${requestedFilePath}`);
    }
    // Continuar con el middleware de archivos estáticos
    next();
  });
}, express.static(uploadsPath, {
  maxAge: '1d', // Cache de 1 día
  fallthrough: false, // Generar error 404 si el archivo no existe
}));

// Middleware para capturar errores 404 en archivos estáticos
app.use('/uploads', (req, res, next) => {
  res.status(404).json({ 
    error: 'Archivo no encontrado',
    path: req.originalUrl 
  });
});

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/carts', cartRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de la Tienda',
    environment: process.env.NODE_ENV || 'development',
    uploadsDirectory: uploadsPath
  });
});

// Manejador de errores 
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

// Conexión a MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tienda-app';

console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`Puerto: ${PORT}`);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err.message);
  }); 