const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin, generateToken } = require('../middlewares/auth');

// @route   POST /api/users/register
// @desc    Registrar un nuevo usuario
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({
        message: 'El usuario ya existe con ese email o nombre de usuario'
      });
    }

    // Crear nuevo usuario
    const user = await User.create({
      username,
      email,
      password,
      name
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Datos de usuario inválidos' });
    }
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/users/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/users/me
// @desc    Obtener datos del usuario actual
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/users/me
// @desc    Actualizar datos del usuario
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.name,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/users
// @desc    Obtener todos los usuarios (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router; 