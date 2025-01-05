const express = require('express');
const router = express.Router();
const multer = require('multer');  // To handle file uploads
const Job = require('../jobs.js'); // Import the Job model
const upload = multer({ dest: 'uploads/' });

// Route to display careers page with job listings
router.get('/careers', async (req, res) => {
    try {
    // Fetch all job listings from the database
    const jobs = await Job.find();
    res.render('careers', { jobList: careers }); // Pass jobs to the EJS template
    } catch (error) {
    res.status(500).send('Error retrieving job listings');
    }
});

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


module.exports = router;
