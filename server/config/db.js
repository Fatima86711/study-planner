const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Failed: ${error.message}`);
    process.exit(1); // App band kar do agar DB connect na ho
  }
};

module.exports = connectDB;