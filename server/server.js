// server.js m

const dotenv = require('dotenv');
// Load environment variables first so everything sees process.env values
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes.js');
const studyRoutes = require('./routes/studyRoutes.js');
const aiRoutes = require('./routes/aiRoutes.js');
const studyPlanRoutes = require('./routes/studyPlanRoutes.js');
const quizRoutes = require('./routes/quizRoutes.js');
const notesRoutes = require('./routes/notesRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes.js');
const courseRoutes = require('./routes/courseRoutes');


// Connect to database before starting server
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/study-plan', studyPlanRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes)
app.use('/api/courses', courseRoutes);

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Study Planner Backend is running! ✅');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
