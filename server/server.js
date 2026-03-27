// server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load env variables
dotenv.config();

// Database connect karo
connectDB();

// Express app initialize karein
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

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