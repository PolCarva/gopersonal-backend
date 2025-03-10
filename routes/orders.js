const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middlewares/auth');

// @route   POST /api/orders
// @desc    Crear un nuevo pedido
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No hay productos en el pedido' });
    }

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/orders/myorders
// @desc    Obtener pedidos del usuario
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Obtener un pedido por ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar si el pedido pertenece al usuario o es administrador
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para acceder a este pedido' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Actualizar estado del pedido (admin)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    order.status = status;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Obtener todos los pedidos (admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

module.exports = router; 