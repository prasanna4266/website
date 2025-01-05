const mongoose = require('mongoose');
// Define Product Schema
const fruitSchema = new mongoose.Schema({
    'fruitId': { type: Number}, 
    'stock':{ type: Number},
    'name': { type: String, required: true },
    'img': { type: String, required: true },
    'maxquantity': { type: String, required: true },
    'regprice': { type: Number, required: true },
    'ourprice': { type: Number, required: true },
    '3mnths': {type:Number},
    '6mnths': {type:Number},
    '1year': {type:Number},
});

const Fruits = mongoose.models.Fruits || mongoose.model('Fruits',fruitSchema);
module.exports = Fruits;
async function fetchFruits() {
    try {
        const response = await fetch('http://localhost:3000/fruits'); // Assuming you're making an API call
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error in fetchFruits:', error);
        throw error; // Re-throw the error for further handling
    }
}
function confirmSubscription(productId, duration, price) {
    if (confirm(`Do you want to subscribe to ${duration} for ₹${price}?`)) {
        // Redirect to server route for subscription confirmation
        window.location.href = `/subscribe/${productId}?duration=${duration}`;
    }
}


