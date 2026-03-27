const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// Express app initialize karein
const app = express();

// Middleware
app.use(cors()); // Frontend ko allow karega
app.use(express.json()); // JSON data read karne ke liye

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Study Planner Backend is running!');
});

// Port define karein
const PORT = process.env.PORT || 5000;

// Server start karein
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});