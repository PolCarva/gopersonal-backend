const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// @route   GET /api/profiles/me
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    
    if (!profile) {
      // Si no existe, crear un perfil básico
      profile = await Profile.create({ user: req.user._id });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/profiles/me
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { bio, phoneNumber, address, birthdate, preferences } = req.body;
    
    // Buscar y actualizar perfil
    let profile = await Profile.findOne({ user: req.user._id });
    
    if (!profile) {
      // Si no existe, crear uno nuevo
      profile = new Profile({
        user: req.user._id,
      });
    }
    
    // Actualizar campos
    if (bio) profile.bio = bio;
    if (phoneNumber) profile.phoneNumber = phoneNumber;
    if (address) profile.address = address;
    if (birthdate) profile.birthdate = birthdate;
    if (preferences) profile.preferences = preferences;
    
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   POST /api/profiles/upload-photo
// @desc    Subir foto de perfil
// @access  Private
router.post('/upload-photo', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ninguna imagen' });
    }
    
    // Actualizar URL de imagen en el usuario
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Construir URL para la imagen
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    user.profileImage = imageUrl;
    await user.save();
    
    res.json({
      message: 'Imagen de perfil actualizada con éxito',
      profileImage: imageUrl
    });
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router; 