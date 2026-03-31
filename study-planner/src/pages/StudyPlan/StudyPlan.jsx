import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  MdCheckCircle, MdRadioButtonUnchecked, MdCalendarToday,
  MdAutoAwesome, MdAccessTime, MdAdd, MdSave
} from 'react-icons/md'
import { FaBrain, FaFire } from 'react-icons/fa'
import api from '../../services/api'

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ── Priority Badge ──
const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-red-50 text-red-500 border-red-200',
    medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    low: 'bg-green-50 text-green-600 border-green-200',
  }
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${styles[priority] || styles.medium}`}>
      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium'}
    </span>
  )
}

const StudyPlan = () => {
  const [activeDay, setActiveDay] = useState('Monday')
  const [activeTab, setActiveTab] = useState('daily')

  // ── Plans State ──────────────────────────────────────────────────────────
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── AI Generate State ────────────────────────────────────────────────────
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [genSubject, setGenSubject] = useState('')
  const [genDays, setGenDays] = useState('7')
  const [genHours, setGenHours] = useState('2')
  const [generating, setGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [saving, setSaving] = useState(false)

  // ── Fetch Plans ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/api/study-plan/my-plans')
        setPlans(res.data.plans)
      } catch (err) {
        setError('Failed to load plans')
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  // ── AI Generate Plan ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!genSubject.trim()) {
      toast.warning('Please enter a subject!')
      return
    }
    setGenerating(true)

    try {
      const res = await api.post('/api/ai/plan', {
        subject: genSubject,
        days: genDays,
        hours: genHours,
      })
      setGeneratedPlan(res.data.plan)
    } catch (err) {
      toast.error('AI failed to generate plan — please retry')
    } finally {
      setGenerating(false)
    }
  }

  // ── Save Generated Plan ──────────────────────────────────────────────────
  const handleSavePlan = async () => {
    if (!generatedPlan) return
    setSaving(true)

    try {
      const res = await api.post('/api/study-plan/save', {
        title: generatedPlan.title,
        subject: generatedPlan.subject,
        tasks: generatedPlan.tasks,
      })

      // Add new plan to list
      setPlans(prev => [res.data.plan, ...prev])
      setGeneratedPlan(null)
      setShowGenerateModal(false)
      setGenSubject('')
      toast.success('Plan saved successfully!')

    } catch (err) {
      toast.error('Failed to save plan — please retry')
    } finally {
      setSaving(false)
    }
  }

  // ── Task Complete Toggle ─────────────────────────────────────────────────
  const handleTaskComplete = async (planId, taskId) => {
    try {
      const res = await api.patch(`/api/study-plan/${planId}/task/${taskId}`)

      // Update local state
      setPlans(prev =>
        prev.map(plan =>
          plan._id === planId
            ? {
                ...plan,
                tasks: plan.tasks.map(task =>
                  task._id === taskId
                    ? { ...task, isCompleted: true }
                    : task
                )
              }
            : plan
        )
      )
    } catch (err) {
      toast.error('Task update failed')
    }
  }

  // ── Active Plan — latest plan ─────────────────────────────────────────────
  const activePlan = plans[0] || null

  // ── Weekly Stats ──────────────────────────────────────────────────────────
  const allTasks = plans.flatMap(p => p.tasks)
  const totalDone = allTasks.filter(t => t.isCompleted).length
  const totalTasks = allTasks.length

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Plan</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI generated personalized plan based on your performance
          </p>
        </div>

        {/* Generate Button */}
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdAutoAwesome size={18} />
          Generate AI Plan
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Tab: Daily / Weekly ── */}
      <div className="flex bg-gray-100 rounded-full p-1 w-fit">
        {['daily', 'weekly'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 capitalize ${
              activeTab === tab ? 'text-white shadow-md' : 'text-gray-500 bg-transparent'
            }`}
            style={activeTab === tab
              ? { background: 'linear-gradient(to right, #0f766e, #14b8a6)' }
              : {}}
          >
            {tab === 'daily' ? '📅 Daily View' : '📆 Weekly View'}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading your plans...</p>
        </div>
      ) : plans.length === 0 ? (
        // ── No Plans Yet ──
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <MdCalendarToday size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-semibold mb-2">No plans yet</p>
          <p className="text-gray-400 text-sm mb-6">
            Click the "Generate AI Plan" button to create a personalized plan
          </p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-md"
            style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
          >
            <MdAutoAwesome size={16} className="inline mr-2" />
            Generate My First Plan
          </button>
        </div>
      ) : (
        <>
          {/* ══════════════════════════════════ */}
          {/* ── DAILY VIEW ── */}
          {/* ══════════════════════════════════ */}
          {activeTab === 'daily' && activePlan && (
            <div className="flex flex-col gap-4">

              {/* Plan Title */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Active Plan</p>
                  <p className="font-bold text-gray-800">{activePlan.title}</p>
                </div>
                <span className="text-xs bg-teal-50 text-teal-600 font-semibold px-3 py-1 rounded-full">
                  {activePlan.subject}
                </span>
              </div>

              {/* Progress */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-700">Overall Progress</h3>
                  <span className="text-sm font-bold text-teal-600">
                    {activePlan.tasks.filter(t => t.isCompleted).length}/
                    {activePlan.tasks.length} done
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: activePlan.tasks.length > 0
                        ? `${Math.round(
                            (activePlan.tasks.filter(t => t.isCompleted).length /
                              activePlan.tasks.length) * 100
                          )}%`
                        : '0%',
                      background: 'linear-gradient(to right, #0f766e, #14b8a6)',
                    }}
                  />
                </div>
              </div>

              {/* Task List */}
              <div className="flex flex-col gap-3">
                {activePlan.tasks.map(task => (
                  <div
                    key={task._id}
                    onClick={() => !task.isCompleted && handleTaskComplete(activePlan._id, task._id)}
                    className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md ${
                      task.isCompleted
                        ? 'border-teal-200 bg-teal-50/30'
                        : 'border-gray-100 cursor-pointer'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      {task.isCompleted
                        ? <MdCheckCircle className="text-teal-500" size={28} />
                        : <MdRadioButtonUnchecked className="text-gray-300" size={28} />
                      }
                    </div>

                    {/* Task Info */}
                    <div className="flex-1">
                      <span className={`font-bold text-gray-800 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {task.description}
                      </span>
                      {task.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    {task.isCompleted && (
                      <span className="text-xs text-teal-500 font-bold flex-shrink-0">
                        ✓ Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════ */}
          {/* ── WEEKLY VIEW ── */}
          {/* ══════════════════════════════════ */}
          {activeTab === 'weekly' && (
            <div className="flex flex-col gap-4">

              {/* Weekly Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="p-3 bg-teal-50 rounded-xl">
                    <MdCalendarToday className="text-teal-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-extrabold text-gray-800">{totalTasks}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <MdCheckCircle className="text-green-500" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Completed</p>
                    <p className="text-2xl font-extrabold text-gray-800">{totalDone}</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <FaBrain className="text-red-400" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Plans</p>
                    <p className="text-2xl font-extrabold text-gray-800">{plans.length}</p>
                  </div>
                </div>
              </div>

              {/* All Plans List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(plan => {
                  const done = plan.tasks.filter(t => t.isCompleted).length
                  const total = plan.tasks.length
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={plan._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-700 truncate">{plan.title}</h3>
                        <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-lg ml-2 flex-shrink-0">
                          {done}/{total}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{plan.subject}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            background: 'linear-gradient(to right, #0f766e, #14b8a6)',
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                        {plan.tasks.slice(0, 4).map(task => (
                          <div key={task._id} className="flex items-center gap-2">
                            {task.isCompleted
                              ? <MdCheckCircle className="text-teal-500 flex-shrink-0" size={14} />
                              : <MdRadioButtonUnchecked className="text-gray-300 flex-shrink-0" size={14} />
                            }
                            <span className={`text-xs truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </span>
                          </div>
                        ))}
                        {plan.tasks.length > 4 && (
                          <p className="text-xs text-gray-400 mt-1">
                            +{plan.tasks.length - 4} more tasks
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* AI Insight */}
              <div
                className="rounded-2xl p-5 text-white flex items-start gap-3"
                style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
              >
                <FaFire size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">🤖 AI Weekly Insight</p>
                  <p className="text-xs text-white/90 leading-relaxed">
                    Follow your plans regularly — AI is tracking your consistency.
                    Complete each task to receive better recommendations from AI!
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════ */}
      {/* ── AI GENERATE MODAL ── */}
      {/* ══════════════════════════════════ */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">

            <h2 className="text-xl font-bold text-gray-800 mb-1">
              🤖 Generate AI Study Plan
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              AI aapke liye personalized plan banayega
            </p>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Mathematics, Physics..."
                value={genSubject}
                onChange={(e) => setGenSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              />
            </div>

            {/* Days */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Plan Duration (days)
              </label>
              <select
                value={genDays}
                onChange={(e) => setGenDays(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              >
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
              </select>
            </div>

            {/* Daily Hours */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Daily Study Hours
              </label>
              <select
                value={genHours}
                onChange={(e) => setGenHours(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              >
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
                <option value="3">3 Hours</option>
                <option value="4">4 Hours</option>
              </select>
            </div>

            {/* Generated Plan Preview */}
            {generatedPlan && (
              <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                <p className="text-sm font-bold text-teal-700 mb-2">
                  ✅ Plan Ready: {generatedPlan.title}
                </p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {generatedPlan.tasks.map((task, i) => (
                    <p key={i} className="text-xs text-teal-600">
                      {i + 1}. {task.description}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGenerateModal(false)
                  setGeneratedPlan(null)
                  setGenSubject('')
                }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              {!generatedPlan ? (
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                >
                  {generating ? 'Generating...' : '✨ Generate'}
                </button>
              ) : (
                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                >
                  <MdSave size={16} />
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer 
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default StudyPlan