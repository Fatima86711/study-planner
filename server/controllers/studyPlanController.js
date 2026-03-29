const StudyPlan = require('../models/StudyPlan');

// ─── PLAN SAVE KARO ───────────────────────────────────────────────────────────
// Route:  POST /api/study-plan/save
// Access: Private
const savePlan = async (req, res) => {
  try {
    const { title, subject, tasks } = req.body;

    // Validation
    if (!title || !subject || !tasks || tasks.length === 0) {
      return res.status(400).json({ message: 'Please provide title, subject and tasks' });
    }

    const plan = await StudyPlan.create({
      user: req.user.id,
      title,
      subject,
      tasks,
    });

    res.status(201).json({ success: true, plan });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── SAARE PLANS LAO ─────────────────────────────────────────────────────────
// Route:  GET /api/study-plan/my-plans
// Access: Private
const getMyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.user.id })
      .sort({ date: -1 }); // Latest pehle

    res.status(200).json({ success: true, plans });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── TASK COMPLETE MARK KARO ──────────────────────────────────────────────────
// Route:  PATCH /api/study-plan/:planId/task/:taskId
// Access: Private
const completeTask = async (req, res) => {
  try {
    const { planId, taskId } = req.params;

    // Pehle plan dhundo — aur confirm karo yeh isi user ka hai
    const plan = await StudyPlan.findOne({
      _id: planId,
      user: req.user.id,
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Tasks array mein se woh specific task dhundo
    const task = plan.tasks.id(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Task complete mark karo
    task.isCompleted = true;

    // Plan save karo
    await plan.save();

    res.status(200).json({ success: true, plan });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { savePlan, getMyPlans, completeTask };