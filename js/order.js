// models/order.js
const mongoose = require('mongoose');

// Define Order Schema
const orderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    price: { type: Number, required: true },
    duration: { type: String, required: false },
    quantity: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming you have a User model for logged-in users
    createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phonenum: {type:Number, required: true},
    orderDate: { type: Date, default: Date.now },
});

// Export Order Model
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;
