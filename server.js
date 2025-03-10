const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

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

// Servir archivos estáticos (imágenes de perfil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/carts', cartRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de la Tienda' });
});

// Conexión a MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tienda-app';

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