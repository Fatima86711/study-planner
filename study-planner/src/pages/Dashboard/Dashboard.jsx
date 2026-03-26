// MdLocalFire ko MdLocalFireDepartment se badal dein
import { MdLocalFireDepartment, MdAccessTime, MdWarning, MdCheckCircle } from 'react-icons/md'
import { FaBrain, FaChartLine } from 'react-icons/fa'

// ── Dummy Data (baad mein backend se aayega) ──
const stats = [
  {
    icon: <MdLocalFireDepartment size={28} className="text-orange-400" />,
    label: 'Study Streak',
    value: '7 Days 🔥',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  {
    icon: <MdAccessTime size={28} className="text-teal-500" />,
    label: 'Total Study Hours',
    value: '42 hrs',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  {
    icon: <MdWarning size={28} className="text-red-400" />,
    label: 'Weak Subjects',
    value: '3 Subjects',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  {
    icon: <MdCheckCircle size={28} className="text-green-500" />,
    label: "Today's Goal",
    value: '60% Done',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
]

const weakSubjects = [
  { name: 'Mathematics', progress: 35 },
  { name: 'Physics', progress: 50 },
  { name: 'Chemistry', progress: 45 },
]

const studyPlanPreview = [
  { time: '9:00 AM', subject: 'Mathematics', duration: '1.5 hrs', done: true },
  { time: '11:00 AM', subject: 'Physics', duration: '1 hr', done: true },
  { time: '2:00 PM', subject: 'Chemistry', duration: '1 hr', done: false },
  { time: '4:00 PM', subject: 'English', duration: '45 min', done: false },
]

const recentQuizzes = [
  { subject: 'Mathematics', score: 60, total: 100, date: 'Mar 24' },
  { subject: 'Physics', score: 75, total: 100, date: 'Mar 23' },
  { subject: 'Chemistry', score: 55, total: 100, date: 'Mar 22' },
]

// ── Helper: score color ──
const scoreColor = (score) => {
  if (score >= 75) return 'text-green-500'
  if (score >= 55) return 'text-yellow-500'
  return 'text-red-500'
}

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Here's your study overview for today</p>
      </div>

      {/* ── Row 1: Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} ${stat.border} border rounded-2xl p-5 flex items-center gap-4 shadow-sm`}
          >
            <div className="p-3 bg-white rounded-xl shadow-sm">{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Today's Goal Progress + Weak Subjects ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's Goal Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-teal-500" size={20} />
            <h2 className="font-bold text-gray-700">Today's Study Goal</h2>
          </div>
          <p className="text-sm text-gray-400 mb-2">Target: 4 hours — Completed: 2.5 hours</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div
              className="h-4 rounded-full transition-all duration-500"
              style={{
                width: '60%',
                background: 'linear-gradient(to right, #0f766e, #14b8a6)',
              }}
            />
          </div>
          <p className="text-right text-sm font-semibold text-teal-600">60%</p>

          {/* Mini breakdown */}
          <div className="mt-4 flex flex-col gap-2">
            {[
              { label: 'Mathematics', val: 80 },
              { label: 'Physics', val: 50 },
              { label: 'Chemistry', val: 30 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.val}%`,
                      background: 'linear-gradient(to right, #0f766e, #14b8a6)',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{item.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Subjects */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaBrain className="text-red-400" size={20} />
            <h2 className="font-bold text-gray-700">Weak Subjects</h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">AI has detected these need more attention</p>

          <div className="flex flex-col gap-4">
            {weakSubjects.map((subject, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                  <span className="text-sm text-red-400 font-semibold">{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500">
            💡 AI Tip: Spend extra 30 mins daily on Mathematics this week
          </div>
        </div>
      </div>

      {/* ── Row 3: Study Plan Preview + Recent Quiz Scores ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Upcoming Study Plan */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">📅 Today's Study Plan</h2>
          <div className="flex flex-col gap-3">
            {studyPlanPreview.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  item.done
                    ? 'bg-teal-50 border-teal-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    item.done ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {item.done ? '✓' : '○'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{item.subject}</p>
                    <p className="text-xs text-gray-400">{item.time} · {item.duration}</p>
                  </div>
                </div>
                {item.done && (
                  <span className="text-xs text-teal-500 font-medium">Done</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quiz Scores */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">📝 Recent Quiz Scores</h2>
          <div className="flex flex-col gap-3">
            {recentQuizzes.map((quiz, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700">{quiz.subject}</p>
                  <p className="text-xs text-gray-400">{quiz.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${scoreColor(quiz.score)}`}>
                    {quiz.score}
                    <span className="text-xs text-gray-400 font-normal">/{quiz.total}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {quiz.score >= 75 ? '✅ Good' : quiz.score >= 55 ? '⚠️ Average' : '❌ Weak'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-600">
            💡 Tip: Attempt quiz regularly to help AI improve your study plan
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard;