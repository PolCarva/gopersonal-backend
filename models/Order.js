const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
      default: 'pendiente'
    },
    shippingAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: {
      type: String,
      enum: ['tarjeta', 'efectivo', 'transferencia'],
      default: 'tarjeta'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', OrderSchema); 