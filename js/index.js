const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const uri = 'mongodb+srv://prasannabollineni2:bollineni4266@cluster0.ngdtd.mongodb.net/mysite?retryWrites=true&w=majority&appName=Cluster0';
const cors = require('cors');
const Product = require('./product');
const router = express.Router(); // Initialize router
const Fruits = require('./fruits');
const Subscription = require('./subscription')
const Order = require('./order');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const Contact = require('./contact'); // Adjust the path as needed
const User = require('./user'); // Import the User model
const bcrypt = require('bcrypt');
const session = require('express-session');
const Cart = require('./cart');
const { error } = require('console');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('public', path.join(__dirname, 'public'));

const PORT = 3000;
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(cors());
app.use(express.json());
// Middleware for sessions
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    })
);
app.use((req, res, next) => {
    if (req.session && req.session.userId) {
        // If the session is valid and userId exists, pass it to locals
        res.locals.user = req.session.userId;
    } else {
        // Handle case where there's no session or userId
        res.locals.user = null;
    }
    next();
});
app.use(express.static('public')); // Adjust 'public' to your folder name
mongoose.connect('mongodb+srv://prasannabollineni2:bollineni4266@cluster0.ngdtd.mongodb.net/mysite?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,  // Increase the timeout to 30 seconds
    connectTimeoutMS: 30000,          // Connection timeout to 30 seconds
})
.then(() => {
    console.log('Connection successful');
})
.catch((err) => {
    console.error('Connection error:', err.message);
});

// Registration route
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, contactNumber, password, confirmPassword } = req.body;

    try {
        // Check if the email or contact number already exists in the database
        const existingUser = await User.findOne({ $or: [{ email }, { contactNumber }] });

        if (existingUser) {
            return res.status(400).send('Email or Contact Number already exists');
        }

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            contactNumber,
            password,
        });

        // Save the user to the database
        await newUser.save();
        
        // Redirect to login page after successful registration
        return res.sendFile(path.join(__dirname, '/public/products.html')); // Ensure this is the final response
    } catch (err) {
        console.error('Error in registering user:', err);  // Log the specific error
        res.status(500).send('Internal Server Error');
    }
});

// POST route for handling login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            // If user does not exist
            return res.status(400).send('Invalid email or password');
        }
        // Directly compare plain text passwords
        if (user.password !== password) {
            return res.render('login', { message: 'Invalid email or password' });
        }

        // Successful login, store user session
        req.session.user = user;
        req.session.userId = user._id;
          // Check if there's a redirect URL from the login page
          const redirectUrl = req.query.redirect || '/';  // Default to home page if no redirect URL is provided
            return res.redirect('/profile');
        } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).send('Internal Server Error');
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // Proceed to the next middleware or route handler
    }

    // If the user is not authenticated, redirect them to the login page with the original URL
    res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
}

// Define routes
app.get('/products',isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find(); // Fetch products from the database
        if (!products || products.length === 0) {
            throw new Error('No products found'); // Handle empty database
        }
        res.render('products', { products }); // Pass products to the EJS file
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Error fetching products');
    }
});
// Define routes
app.get('/fruits', async (req, res) => {
    try {
        const fruits = await Fruits.find(); // Fetch products from the database
        if (!fruits || fruits.length === 0) {
            throw new Error('No fruits found'); // Handle empty database
        }
        res.render('fruits', { fruits }); // Pass products to the EJS file
    } catch (err) {
        console.error('Error fetching fruits:', err);
        res.status(500).send('Error fetching fruits');
    }
});

app.post('/submit-contact-form', async (req, res) => {
    try {
        const contact = new Contact({
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
        });
        await contact.save();
        return res.status(201).send('Message saved successfully!');
    } catch (error) {
        return res.status(500).send('Error saving message: ' + error.message);
    }
});// This should log the model definition


// Route to handle job application submission
router.post('/careers/apply', upload.single('resume'), async (req, res) => {
    const { name, email, message } = req.body;
    const resume = req.file ? req.file.path : null; // Get resume file path
    
    try {
        const application = new Application({
        jobTitle: "Sample Job Title",  // Replace this with dynamic job title from form if needed
        name,
        email,
        resume,
        message
        });
    
      await application.save(); // Save the application in the database
    
        res.send('Application submitted successfully');
    } catch (error) {
        res.status(500).send('Error submitting application');
    }
    });
// Route to display careers page with job listings
router.get('/careers', async (req, res) => {
    try {
    // Fetch all job listings from the database
    const jobs = await Job.find();
    res.render('careers', { jobList: careers.html }); // Pass jobs to the EJS template
    } catch (error) {
    res.status(500).send('Error retrieving job listings');
    }
});
// Route to handle subscription creation or update
router.post('/subscribe', async (req, res) => {
    const { userId, productName, description, duration, price } = req.body;

    try {
      // Create a new subscription or update an existing one for the user
        const subscription = new Subscription({
        userId,
        productName,
        description,
        duration,
        price
        });

        await subscription.save();
        res.redirect('/active-subscriptions');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to save subscription details' });
        }
    });
module.exports = router;


// Route for profile page
app.get('/profile', async (req, res) => {
    const userId = req.session.userId; // Assuming you're storing user ID in session

    if (!userId) {
        return res.redirect('/login'); // Redirect to login if user is not logged in
    }

    try {
        // Fetch the user's profile from the database using userId
        const user = await User.findById(userId).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render profile page and pass the user data to the view
        res.render('profile', { user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Failed to fetch profile');
    }
});


// Now `subscription.product` will contain the product details (Fruit or Vegetable)

//for fruits
app.get('/subscription-details', async (req, res) => {
    try {
        const { productId, duration } = req.query;
        const userId = req.session.userId;

        if (!userId || !productId || !duration) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const product = await Fruits.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Format duration to match the product schema keys
        let normalizedDuration = duration.replace(/\s+/g, '').toLowerCase();
        if (normalizedDuration === '3months') {
            normalizedDuration = '3mnths';
        } else if (normalizedDuration === '6months') {
            normalizedDuration = '6mnths';
        } else if (normalizedDuration === '12months') {
            normalizedDuration = '1year';
        }
        const durationMap = {
            '1year': 12 * 30 * 24 * 60 * 60 * 1000,
            '6mnths': 6 * 30 * 24 * 60 * 60 * 1000,
            '3mnths': 3 * 30 * 24 * 60 * 60 * 1000,
        };

        const endDate = new Date(Date.now() + (durationMap[normalizedDuration] || 0));
        console.log('Normalized duration:', normalizedDuration); // Log the formatted duration
        if (!durationMap[normalizedDuration]) {
            return res.status(400).json({ message: 'Invalid duration' });
        }
        

        // Check if the formatted duration exists in the product schema
        const price = product[normalizedDuration];
        if (!price) {
            return res.status(400).json({ message: 'Invalid duration' });
        }


        // Provide description and productName if required
        const description = product.description || 'Default description';
        const productName = product.name || 'Default product name';

        const newSubscription = new Subscription({
            userId,
            productId,
            duration,
            price,
            startDate: new Date(),
            endDate,
            productName,
        });

        await newSubscription.save();
        res.status(201).render('subscription-details', { user: req.session.user, product, duration });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ message: 'Failed to add subscription', error });
    }
});

//for vegetables
app.get('/subscription-details1', async (req, res) => {
    try {
        const { productId, duration } = req.query;
        const userId = req.session.userId;

        if (!userId || !productId || !duration) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Format duration to match the product schema keys
        let normalizedDuration = duration.replace(/\s+/g, '').toLowerCase();
        if (normalizedDuration === '3months') {
            normalizedDuration = '3mnths';
        } else if (normalizedDuration === '6months') {
            normalizedDuration = '6mnths';
        } else if (normalizedDuration === '12months') {
            normalizedDuration = '1year';
        }
        const durationMap = {
            '1year': 12 * 30 * 24 * 60 * 60 * 1000,
            '6mnths': 6 * 30 * 24 * 60 * 60 * 1000,
            '3mnths': 3 * 30 * 24 * 60 * 60 * 1000,
        };

        const endDate = new Date(Date.now() + (durationMap[normalizedDuration] || 0));
        console.log('Normalized duration:', normalizedDuration); // Log the formatted duration
        if (!durationMap[normalizedDuration]) {
            return res.status(400).json({ message: 'Invalid duration' });
        }
        

        // Check if the formatted duration exists in the product schema
        const price = product[normalizedDuration];
        if (!price) {
            return res.status(400).json({ message: 'Invalid duration' });
        }


        // Provide description and productName if required
        const description = product.description || 'Default description';
        const productName = product.name || 'Default product name';

        const newSubscription = new Subscription({
            userId,
            productId,
            duration,
            price,
            startDate: new Date(),
            endDate,
            productName,
        });

        await newSubscription.save();
        res.status(201).render('subscription-details', { user: req.session.user, product, duration });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ message: 'Failed to add subscription', error });
    }
});
//fruits
app.post('/subscription-details', async (req, res) => {
    const { productId, duration } = req.body;
    const userId = req.session.userId; // Assuming you're storing the user ID in session or elsewhere
     // Normalize the duration to match the keys in your durationMap
    const normalizedDuration = duration.replace(/\s+/g, '').toLowerCase();
    console.log('Normalized Duration:', normalizedDuration);

    try {
        // Fetch the product details from the database
        const product = await Fruits.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        console.log('Product:', product);
        console.log('Normalized Duration:', normalizedDuration);
        console.log('Price:', product[normalizedDuration]);
        // Check if the duration is valid and get the price from the product object
        const price = product[normalizedDuration];
        if (!price) {
            return res.status(400).json({ message: 'Invalid duration' });
        }
        
        // Render the subscription details page
        res.status(201).json({ message: 'Subscription added'});
        res.render('subscription-details', { user: req.session.user, product, price, duration, endDate });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching subscription details.');
    }
});
//vegetables
app.post('/subscription-details1', async (req, res) => {
    const { productId, duration } = req.body;
    const userId = req.session.userId; // Assuming you're storing the user ID in session or elsewhere
     // Normalize the duration to match the keys in your durationMap
    const normalizedDuration = duration.replace(/\s+/g, '').toLowerCase();
    console.log('Normalized Duration:', normalizedDuration);

    try {
        // Fetch the product details from the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        console.log('Normalized Duration:', normalizedDuration);
        console.log('Price:', product[normalizedDuration]);
        // Check if the duration is valid and get the price from the product object
        const price = product[normalizedDuration];
        if (!price) {
            return res.status(400).json({ message: 'Invalid duration' });
        }
        
        // Render the subscription details page
        res.status(201).json({ message: 'Subscription added'});
        res.render('subscription-details', { user: req.session.user, product, price, duration, endDate });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching subscription details.');
    }
});

app.get('/active-subscriptions', async (req, res) => {
    const userId = req.session.userId; // Assuming session holds the user's ID

    try {
        const subscriptions = await Subscription.find({userId })
            .populate('productId','price') // Populate product details
            .exec();

        res.render('active-subscriptions', { subscriptions });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch subscriptions');
    }
});
app.get('/cart', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/login'); // Redirect to login if not logged in
    }
    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.render('cart', { cart: { items: [] } }); // Render empty cart if none exists
        }

        res.render('cart', { cart });
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).send('An error occurred while fetching the cart');
    }
});
app.post('/cart/update', async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    try {
        const cart = await Cart.findOne({ userId });
        if (cart) {
            const item = cart.items.find(item => item.productId.toString() === productId);
            if (item) {
                item.quantity = parseInt(quantity, 10);
                await cart.save();
            }
        }
        res.redirect('/cart');
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).send('An error occurred while updating the cart.');
    }
});



// Route for rendering the order page
app.get('/order', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/login'); // Ensure user is logged in
    }

    // Fetch the user's cart (make sure to have a Cart model in place)
    Cart.findOne({ userId })
        .populate('items.productId') // populate product details
        .exec((err, cart) => {
            if (err) {
                return res.status(500).send('Error fetching cart');
            }

            if (!cart || cart.items.length === 0) {
                return res.redirect('/cart'); // If cart is empty, redirect to cart page
            }

            res.render('order', { cart }); // Render the order page with cart items
        });
});
app.post('/order', (req, res) => {
    const { productId, price } = req.body;
    console.log("Product ID:", productId);
    console.log("Price:", price); // Log to verify the price

    // Store the productId and price in the session or pass them to the next page
    req.session.orderDetails = { productId, price };

    // Redirect to the order confirmation page
    res.redirect('/checkout');
});
app.get('/checkout', (req, res) => {
    const orderDetails = req.session.orderDetails;

    if (!orderDetails) {
        return res.redirect('/active-subscriptions'); // Redirect if no order details
    }

    res.render('checkout', { orderDetails });
});

app.post('/checkout', async (req, res) => {
    const { name, address, phonenum, quantity } = req.body;
    const { productId, price } = req.session.orderDetails;

    try {
        req.session.orderDetails = {
            productId,
            price,
            name,
            address,
            quantity,
            phonenum
        };
        
        // Save order to the database
        // Create a new order document with all required fields
        const newOrder = new Order({
            productId,
            name,
            price,
            quantity,
            phonenum,
            address,
            orderDate: new Date(),
        });
        await newOrder.save();

        // Clear session and redirect to confirmation
        res.redirect('/order-confirmation');
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).send('Failed to process the order');
    }
});

app.get('/order-confirmation', (req, res) => {
    const orderDetails = req.session.orderDetails;


    if (!orderDetails) {
        return res.redirect('/active-subscriptions'); // Redirect if no order details found
    }

    res.render('order-confirmation', { orderDetails });
});

app.post('/checkout/:productId', (req, res) => {
    const productId = req.params.productId;
    const quantity = req.body.quantity;

    // Handle the checkout logic, such as adding the product to the cart or processing payment
    const cart = req.session.cart || [];
    cart.push({ productId, quantity });
    req.session.cart = cart;

    res.redirect('/checkout');
});

// Checkout route
app.get('/checkout', (req, res) => {
    const selectedProducts = req.session.comboProducts || [];
    const userId = req.session.userId;
    if (!userId) {
        return res.redirect('/login'); // Ensure user is logged in
    }

    // You can fetch cart and checkout data, and render the checkout page
    res.render('checkout'); // Render your checkout page
});
//veges
app.post('/add-combo-to-cart', async (req, res) => {
    try {
        const { productId, duration } = req.query;
        const userId = req.session.userId;

        if (!userId || !productId || !duration) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const product = await Fruits.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log('Product:',product)

        // Format duration to match the product schema keys
        let normalizedDuration = duration.replace(/\s+/g, '').toLowerCase();
        if (normalizedDuration === '3months') {
            normalizedDuration = '3mnths';
        } else if (normalizedDuration === '6months') {
            normalizedDuration = '6mnths';
        } else if (normalizedDuration === '12months') {
            normalizedDuration = '1year';
        }
        const durationMap = {
            '1year': 12 * 30 * 24 * 60 * 60 * 1000,
            '6mnths': 6 * 30 * 24 * 60 * 60 * 1000,
            '3mnths': 3 * 30 * 24 * 60 * 60 * 1000,
        };

        const endDate = new Date(Date.now() + (durationMap[normalizedDuration] || 0));
        console.log('Normalized duration:', normalizedDuration); // Log the formatted duration
        if (!durationMap[normalizedDuration]) {
            return res.status(400).json({ message: 'Invalid duration' });
        }
        

        // Check if the formatted duration exists in the product schema
        const price = product[normalizedDuration];
        if (!price) {
            return res.status(400).json({ message: 'Invalid duration' });
        }


        // Provide description and productName if required
        const description = product.description || 'Default description';
        const productName = product.name || 'Default product name';

        Subscriptions.push({
            userId,
            productId,
            duration,
            price,
            startDate: new Date(),
            endDate,
            productName,
        });

        await Subscription.insertMany(Subscriptions);
        res.status(201).render('subscription-details', { user: req.session.user, product, duration });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ message: 'Failed to add subscription', error });
    }
});
app.post('/add-combo-to-cart1', async (req, res) => {
    try {
        const { productId, duration } = req.query;
        const userId = req.session.userId;

        if (!userId || !productId || !duration) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log('Product:',product)

        // Format duration to match the product schema keys
        let normalizedDuration = duration.replace(/\s+/g, '').toLowerCase();
        if (normalizedDuration === '3months') {
            normalizedDuration = '3mnths';
        } else if (normalizedDuration === '6months') {
            normalizedDuration = '6mnths';
        } else if (normalizedDuration === '12months') {
            normalizedDuration = '1year';
        }
        const durationMap = {
            '1year': 12 * 30 * 24 * 60 * 60 * 1000,
            '6mnths': 6 * 30 * 24 * 60 * 60 * 1000,
            '3mnths': 3 * 30 * 24 * 60 * 60 * 1000,
        };

        const endDate = new Date(Date.now() + (durationMap[normalizedDuration] || 0));
        console.log('Normalized duration:', normalizedDuration); // Log the formatted duration
        if (!durationMap[normalizedDuration]) {
            return res.status(400).json({ message: 'Invalid duration' });
        }
        

        // Check if the formatted duration exists in the product schema
        const price = product[normalizedDuration];
        if (!price) {
            return res.status(400).json({ message: 'Invalid duration' });
        }


        // Provide description and productName if required
        const description = product.description || 'Default description';
        const productName = product.name || 'Default product name';

        Subscriptions.push({
            userId,
            productId,
            duration,
            price,
            startDate: new Date(),
            endDate,
            productName,
        });

        await Subscription.insertMany(Subscriptions);
        res.status(201).render('subscription-details', { user: req.session.user, product, duration });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ message: 'Failed to add subscription', error });
    }
});
// Serve the combo selection page (ensure this is added)
app.get('/combo-selection', async (req, res) => {
    const { products, durations } = req.body; // Extract product IDs and subscription durations
    let selectedProducts = [];  // Initialize empty array for selected products
    try {
        const products = await Product.find();
        console.log(products);
        res.render('combo-selection', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.render('combo-selection',{ products: [] });
    }
    res.render('combo-selection'); // Render the EJS page for combo selection
});


module.exports = router;
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});