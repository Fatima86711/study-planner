const QuizAttempt = require('../models/QuizAttempt');

// ─── SAVE QUIZ ATTEMPT ───────────────────────────────────────────────────
// Route:  POST /api/quiz/attempt
// Access: Private
const saveAttempt = async (req, res) => {
  try {
    const { subject, score, totalQuestions } = req.body;

    // Validation
    if (!subject || score === undefined || !totalQuestions) {
      return res.status(400).json({ message: 'Please provide subject, score and totalQuestions' });
    }

    // Validate score: not greater than total questions
    if (score > totalQuestions) {
      return res.status(400).json({ message: 'Score cannot be greater than totalQuestions' });
    }

    // Calculate percentage on server for accuracy
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

// ─── GET QUIZ HISTORY ────────────────────────────────────────────────────────
// Route:  GET /api/quiz/history
// Access: Private
const getHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .sort({ date: -1 }); // Latest first

    res.status(200).json({ success: true, attempts });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── GET SUBJECT SUMMARY ─────────────────────────────────────────────────
// Route:  GET /api/quiz/summary
// Access: Private
const getSubjectSummary = async (req, res) => {
  try {
    const summary = await QuizAttempt.aggregate([
      // Step 1 — Match attempts for this user
      {
        $match: { user: req.user._id }
      },
      // Step 2 — Group by subject
      {
        $group: {
          _id: '$subject',             // Group by subject
          averagePercentage: { $avg: '$percentage' }, // Calculate average
          totalAttempts: { $sum: 1 },  // Count attempts
          bestScore: { $max: '$percentage' }, // Best score
        }
      },
      // Step 3 — Sort by average for weakest first
      {
        $sort: { averagePercentage: 1 }
      },
      // Step 4 — Rename fields and clean output
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