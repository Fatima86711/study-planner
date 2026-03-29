const QuizAttempt = require('../models/QuizAttempt');

// ─── QUIZ ATTEMPT SAVE KARO ───────────────────────────────────────────────────
// Route:  POST /api/quiz/attempt
// Access: Private
const saveAttempt = async (req, res) => {
  try {
    const { subject, score, totalQuestions } = req.body;

    // Validation
    if (!subject || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Please provide subject, score and totalQuestions' });
    }

    // Score valid hai? — score, totalQuestions se zyada nahi ho sakta
    if (score > totalQuestions) {
      return res.status(400).json({ message: 'Score cannot be greater than totalQuestions' });
    }

    // Backend khud percentage calculate karega — frontend par trust nahi
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt = await QuizAttempt.create({
      user: req.user.id,
      subject,
      score,
      totalQuestions,
      percentage,
    });

    res.status(201).json({ success: true, attempt });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── SAARI HISTORY LAO ────────────────────────────────────────────────────────
// Route:  GET /api/quiz/history
// Access: Private
const getHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ date: -1 }); // Latest pehle

    res.status(200).json({ success: true, attempts });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── SUBJECT WISE SUMMARY LAO ─────────────────────────────────────────────────
// Route:  GET /api/quiz/summary
// Access: Private
const getSubjectSummary = async (req, res) => {
  try {
    const summary = await QuizAttempt.aggregate([
      // Step 1 — Sirf is user ki attempts lo
      {
        $match: { user: req.user._id }
      },
      // Step 2 — Subject ke hisaab se group karo
      {
        $group: {
          _id: '$subject',             // Subject se group karo
          averagePercentage: { $avg: '$percentage' }, // Average nikalo
          totalAttempts: { $sum: 1 },  // Kitni baar diya
          bestScore: { $max: '$percentage' }, // Sabse acha score
        }
      },
      // Step 3 — Average ke hisaab se sort karo — kamzor pehle
      {
        $sort: { averagePercentage: 1 }
      },
      // Step 4 — Field names clean karo
      {
        $project: {
          subject: '$_id',
          averagePercentage: { $round: ['$averagePercentage', 1] },
          totalAttempts: 1,
          bestScore: 1,
          _id: 0,
        }
      }
    ]);

    res.status(200).json({ success: true, summary });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { saveAttempt, getHistory, getSubjectSummary };