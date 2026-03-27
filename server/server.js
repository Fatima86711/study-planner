const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // ← Naya: db.js import kiya

// Load env variables
dotenv.config();

// ← Naya: Database connect karein (server start hone se pehle)
connectDB();

// Express app initialize karein
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Study Planner Backend is running! ✅');
});

// Port define karein
const PORT = process.env.PORT || 5000;

// Server start karein
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});