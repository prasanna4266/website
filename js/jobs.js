const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true
    },
    description: {
    type: String,
    required: true
    },
    location: {
    type: String,
    required: true
    },
    department: {
    type: String,
    required: true
    },
    postedAt: {
    type: Date,
    default: Date.now
    }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
