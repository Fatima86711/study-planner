const TimeLog = require('../models/TimeLog');
const QuizAttempt = require('../models/QuizAttempt');
const StudyPlan = require('../models/StudyPlan');

// ─── DASHBOARD SUMMARY ────────────────────────────────────────────────────────
// Route:  GET /api/analytics/dashboard
// Access: Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── 1. Total Study Hours ──────────────────────────────────────────────────
    const allSessions = await TimeLog.find({ user: userId });
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // ── 2. Study Streak ───────────────────────────────────────────────────────
    // Check each day backwards from today
    let streak = 0;
    let checkDate = new Date();

    while (true) {
      // Is din ki start aur end
      const start = new Date(checkDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(checkDate);
      end.setHours(23, 59, 59, 999);

      // Is din koi session tha?
      const sessionThatDay = await TimeLog.findOne({
        user: userId,
        date: { $gte: start, $lte: end },
      });

      if (!sessionThatDay) break; // Streak toot gayi

      streak++;

      // Ek din peeche jaao
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // ── 3. Aaj Ka Data ────────────────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaySessions = await TimeLog.find({
      user: userId,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    // ── 4. Total Quiz Attempts ────────────────────────────────────────────────
    const totalQuizzes = await QuizAttempt.countDocuments({ user: userId });

    // ── 5. Overall Quiz Average ───────────────────────────────────────────────
    const quizAvg = await QuizAttempt.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avg: { $avg: '$percentage' } } },
    ]);
    const averageQuizScore = quizAvg.length > 0
      ? Math.round(quizAvg[0].avg)
      : 0;

    // ── 6. Total Plans + Completed Tasks ─────────────────────────────────────
    const allPlans = await StudyPlan.find({ user: userId });
    const totalPlans = allPlans.length;

    let totalTasks = 0;
    let completedTasks = 0;

    allPlans.forEach((plan) => {
      totalTasks += plan.tasks.length;
      completedTasks += plan.tasks.filter((t) => t.isCompleted).length;
    });

    // ── Final Response ────────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      dashboard: {
        totalHours,
        totalMinutes,
        streak,
        today: {
          minutes: todayMinutes,
          sessions: todaySessions.length,
        },
        quiz: {
          totalAttempts: totalQuizzes,
          averageScore: averageQuizScore,
        },
        plans: {
          total: totalPlans,
          totalTasks,
          completedTasks,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── WEEKLY PROGRESS ──────────────────────────────────────────────────────────
// Route:  GET /api/analytics/weekly
// Access: Private
const getWeeklyProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Date from 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Aggregate last 7 days of TimeLog data by date
    const weeklyData = await TimeLog.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          totalMinutes: { $sum: '$duration' },
          sessions: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date
      },
      {
        $project: {
          date: '$_id',
          totalMinutes: 1,
          sessions: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({ success: true, weeklyData });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── WEAK SUBJECTS ────────────────────────────────────────────────────────────
// Route:  GET /api/analytics/weak-subjects
// Access: Private
const getWeakSubjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const subjectSummary = await QuizAttempt.aggregate([
      // Step 1 — Filter by user
      { $match: { user: userId } },

      // Step 2 — Group by subject
      {
        $group: {
          _id: '$subject',
          averagePercentage: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          bestScore: { $max: '$percentage' },
          latestScore: { $last: '$percentage' },
        },
      },

      // Step 3 — Weakest subjects first
      { $sort: { averagePercentage: 1 } },

      // Step 4 — Clean response
      {
        $project: {
          subject: '$_id',
          averagePercentage: { $round: ['$averagePercentage', 1] },
          totalAttempts: 1,
          bestScore: 1,
          latestScore: 1,
          // Consider weak if average below 50%
          isWeak: { $lt: ['$averagePercentage', 50] },
          _id: 0,
        },
      },
    ]);

    res.status(200).json({ success: true, subjectSummary });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboard, getWeeklyProgress, getWeakSubjects };  