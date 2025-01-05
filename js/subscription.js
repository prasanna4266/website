const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId,  required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, required: false }, // Ensure this is correct
    productName: { type: String, required: true }, // Ensure this is correct
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
