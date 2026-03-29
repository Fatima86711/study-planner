const TimeLog = require('../models/TimeLog.js');

const saveSession = async (req, res) => {
  try {
    const { subject, topic, duration } = req.body;

    if (!subject || !topic || !duration) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const session = await TimeLog.create({
      user: req.user.id,   // middleware se aayega
      subject,
      topic,
      duration,
    });

    res.status(201).json({ success: true, session });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getHistory = async (req, res) => {
  try {
    const sessions = await TimeLog.find({ user: req.user.id })
      .sort({ date: -1 }); // latest pehle

    res.status(200).json({ success: true, sessions });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTodaySessions = async (req, res) => {
  try {
    // Aaj ki date ki start aur end banao
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await TimeLog.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Aaj ka total time calculate karo
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);

    res.status(200).json({ success: true, sessions, totalMinutes });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { saveSession, getHistory, getTodaySessions };
