const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Verificar si existe un token en los headers de autorización
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'miClaveSecreta');

      // Asignar el usuario a req.user (sin incluir la contraseña)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Error de autenticación:', error);
      return res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

// Middleware para verificar si el usuario es administrador
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
};

// Generador de tokens JWT
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'miClaveSecreta', {
    expiresIn: '30d',
  });
}; 