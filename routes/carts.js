const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect } = require('../middlewares/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/carts/mycart
// @desc    Get logged in user's cart
// @access  Private
router.get('/mycart', protect, async (req, res) => {
  try {
    // Buscar el carrito del usuario actual o crear uno nuevo si no existe
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      // Si no existe un carrito para este usuario, crear uno vacío
      cart = new Cart({
        user: req.user.id,
        items: []
      });
      await cart.save();
    }
    
    res.json(cart);
  } catch (err) {
    console.error('Error al obtener carrito:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   POST api/carts/item
// @desc    Add item to cart
// @access  Private
router.post('/item', [
  protect,
  [
    check('productId', 'El ID del producto es requerido').not().isEmpty(),
    check('name', 'El nombre del producto es requerido').not().isEmpty(),
    check('price', 'El precio del producto es requerido').isNumeric(),
    check('image', 'La imagen del producto es requerida').not().isEmpty(),
    check('quantity', 'La cantidad debe ser al menos 1').isInt({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId, name, price, image, quantity } = req.body;
  
  try {
    // Buscar el carrito del usuario o crear uno nuevo
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId
    );
    
    if (existingItemIndex !== -1) {
      // Actualizar la cantidad si el producto ya existe
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Agregar nuevo producto al carrito
      cart.items.push({ productId, name, price, image, quantity });
    }
    
    // Actualizar la fecha de última modificación
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    console.error('Error al añadir item al carrito:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   PUT api/carts/item/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/item/:productId', [
  protect,
  [
    check('quantity', 'La cantidad debe ser al menos 1').isInt({ min: 1 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { quantity } = req.body;
  const productId = parseInt(req.params.productId);
  
  try {
    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Carrito no encontrado' });
    }
    
    // Buscar el producto en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === productId
    );
    
    if (existingItemIndex === -1) {
      return res.status(404).json({ msg: 'Producto no encontrado en el carrito' });
    }
    
    // Actualizar la cantidad
    cart.items[existingItemIndex].quantity = quantity;
    
    // Actualizar la fecha de última modificación
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    console.error('Error al actualizar item del carrito:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE api/carts/item/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/item/:productId', protect, async (req, res) => {
  const productId = parseInt(req.params.productId);
  
  try {
    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Carrito no encontrado' });
    }
    
    // Filtrar el producto a eliminar
    cart.items = cart.items.filter(item => item.productId !== productId);
    
    // Actualizar la fecha de última modificación
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    console.error('Error al eliminar item del carrito:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// @route   DELETE api/carts/clear
// @desc    Clear the cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Carrito no encontrado' });
    }
    
    // Vaciar el carrito
    cart.items = [];
    
    // Actualizar la fecha de última modificación
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json(cart);
  } catch (err) {
    console.error('Error al vaciar el carrito:', err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router; 