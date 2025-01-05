const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Assuming a product reference
    duration: { type: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
