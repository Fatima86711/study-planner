import { useState, useEffect } from 'react'
import { MdLocalFireDepartment, MdAccessTime, MdWarning, MdCheckCircle } from 'react-icons/md'
import { FaBrain, FaChartLine } from 'react-icons/fa'
import api from '../../services/api'

// ── Helper: score color ──
const scoreColor = (score) => {
  if (score >= 75) return 'text-green-500'
  if (score >= 55) return 'text-yellow-500'
  return 'text-red-500'
}

const Dashboard = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [dashboard, setDashboard] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [weakSubjects, setWeakSubjects] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [todayPlan, setTodayPlan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Data Fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Teeno calls ek saath — parallel
        const [dashRes, weakRes, quizRes, planRes] = await Promise.all([
          api.get('/api/analytics/dashboard'),
          api.get('/api/analytics/weak-subjects'),
          api.get('/api/quiz/history'),
          api.get('/api/study-plan/my-plans'),
        ])

        setDashboard(dashRes.data.dashboard)
        setWeakSubjects(weakRes.data.subjectSummary.slice(0, 3)) // Sirf top 3
        setRecentQuizzes(quizRes.data.attempts.slice(0, 3))      // Sirf latest 3

        // Aaj ka plan — latest plan ki tasks dikhao
        if (planRes.data.plans.length > 0) {
          setTodayPlan(planRes.data.plans[0].tasks.slice(0, 4))  // Sirf 4 tasks
        }

      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-sm mt-1">Please refresh the page</p>
        </div>
      </div>
    )
  }

  // ── Stats Cards — Real Data ────────────────────────────────────────────────
  const stats = [
    {
      icon: <MdLocalFireDepartment size={28} className="text-orange-400" />,
      label: 'Study Streak',
      value: `${dashboard?.streak || 0} Days 🔥`,
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      icon: <MdAccessTime size={28} className="text-teal-500" />,
      label: 'Total Study Hours',
      value: `${dashboard?.totalHours || 0} hrs`,
      bg: 'bg-teal-50',
      border: 'border-teal-200',
    },
    {
      icon: <MdWarning size={28} className="text-red-400" />,
      label: 'Weak Subjects',
      value: `${weakSubjects.filter(s => s.isWeak).length} Subjects`,
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    {
      icon: <MdCheckCircle size={28} className="text-green-500" />,
      label: "Today's Goal",
      value: `${dashboard?.plans?.completionRate || 0}% Done`,
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
  ]

  // ── Today's Progress Percentage ────────────────────────────────────────────
  const todayProgress = dashboard?.plans?.completionRate || 0
  const todayMinutes = dashboard?.today?.minutes || 0
  const todayHours = (todayMinutes / 60).toFixed(1)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">
          Here's your study overview for today
        </p>
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

      {/* ── Row 2: Today's Goal + Weak Subjects ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's Goal Progress */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="text-teal-500" size={20} />
            <h2 className="font-bold text-gray-700">Today's Study Goal</h2>
          </div>

          <p className="text-sm text-gray-400 mb-2">
            Today: {todayHours} hrs studied · {dashboard?.today?.sessions || 0} sessions
          </p>

          {/* Main Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div
              className="h-4 rounded-full transition-all duration-500"
              style={{
                width: `${todayProgress}%`,
                background: 'linear-gradient(to right, #0f766e, #14b8a6)',
              }}
            />
          </div>
          <p className="text-right text-sm font-semibold text-teal-600">
            {todayProgress}%
          </p>

          {/* Weak subjects mini bars */}
          <div className="mt-4 flex flex-col gap-2">
            {weakSubjects.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 truncate">
                  {item.subject}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${item.averagePercentage}%`,
                      background: 'linear-gradient(to right, #0f766e, #14b8a6)',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">
                  {item.averagePercentage}%
                </span>
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
          <p className="text-sm text-gray-400 mb-4">
            AI has detected these need more attention
          </p>

          {weakSubjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No quiz data yet — attempt a quiz to see weak subjects
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {weakSubjects.map((subject, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {subject.subject}
                    </span>
                    <span className="text-sm text-red-400 font-semibold">
                      {subject.averagePercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-red-400 to-orange-400 transition-all duration-500"
                      style={{ width: `${subject.averagePercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {weakSubjects.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500">
              💡 AI Tip: Spend extra 30 mins daily on{' '}
              {weakSubjects[0]?.subject} this week
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Study Plan Preview + Recent Quiz Scores ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Today's Study Plan */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">📅 Today's Study Plan</h2>

          {todayPlan.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No study plan yet — create one in Study Plan page
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {todayPlan.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.isCompleted
                      ? 'bg-teal-50 border-teal-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        item.isCompleted
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {item.isCompleted ? '✓' : '○'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {item.description}
                      </p>
                      {item.dueDate && (
                        <p className="text-xs text-gray-400">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.isCompleted && (
                    <span className="text-xs text-teal-500 font-medium">Done</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Scores */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-4">📝 Recent Quiz Scores</h2>

          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No quizzes attempted yet — go to Quiz page to start
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentQuizzes.map((quiz, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {quiz.subject}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(quiz.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${scoreColor(quiz.percentage)}`}>
                      {quiz.score}
                      <span className="text-xs text-gray-400 font-normal">
                        /{quiz.totalQuestions}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {quiz.percentage >= 75
                        ? '✅ Good'
                        : quiz.percentage >= 55
                        ? '⚠️ Average'
                        : '❌ Weak'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-600">
            💡 Tip: Attempt quiz regularly to help AI improve your study plan
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard