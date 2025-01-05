const mongoose = require('mongoose');

// Define Product Schema
const productSchema = new mongoose.Schema({
    'productId': { type: Number}, 
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

// Export Product Model
const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');
module.exports = Product;
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/products'); // Assuming you're making an API call
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        return await response.json();
    } catch (error) {
        console.error('Error in fetchProducts:', error);
        throw error; // Re-throw the error for further handling
    }
}
