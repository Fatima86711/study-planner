import { useState } from 'react'
import { MdCheckCircle, MdRadioButtonUnchecked, MdCalendarToday, MdAutoAwesome, MdAccessTime } from 'react-icons/md'
import { FaBrain, FaFire } from 'react-icons/fa'

// ── Dummy Data ──
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const initialPlan = {
  Monday: [
    { id: 1, subject: 'Mathematics', topic: 'Calculus — Derivatives', duration: '1h 30m', time: '9:00 AM', priority: 'high', done: false },
    { id: 2, subject: 'Physics', topic: 'Newton\'s Laws', duration: '1h', time: '11:00 AM', priority: 'medium', done: false },
    { id: 3, subject: 'Chemistry', topic: 'Periodic Table Review', duration: '45m', time: '3:00 PM', priority: 'high', done: false },
  ],
  Tuesday: [
    { id: 4, subject: 'Mathematics', topic: 'Integration Basics', duration: '1h 30m', time: '9:00 AM', priority: 'high', done: false },
    { id: 5, subject: 'English', topic: 'Essay Writing Practice', duration: '1h', time: '12:00 PM', priority: 'low', done: false },
    { id: 6, subject: 'Chemistry', topic: 'Chemical Bonding', duration: '1h', time: '3:00 PM', priority: 'high', done: false },
  ],
  Wednesday: [
    { id: 7, subject: 'Physics', topic: 'Kinematics', duration: '1h', time: '10:00 AM', priority: 'medium', done: false },
    { id: 8, subject: 'Mathematics', topic: 'Trigonometry', duration: '1h 30m', time: '12:00 PM', priority: 'high', done: false },
    { id: 9, subject: 'Biology', topic: 'Cell Structure', duration: '45m', time: '4:00 PM', priority: 'low', done: false },
  ],
  Thursday: [
    { id: 10, subject: 'Chemistry', topic: 'Organic Chemistry Intro', duration: '1h 30m', time: '9:00 AM', priority: 'high', done: false },
    { id: 11, subject: 'Physics', topic: 'Wave Motion', duration: '1h', time: '11:00 AM', priority: 'medium', done: false },
  ],
  Friday: [
    { id: 12, subject: 'Mathematics', topic: 'Practice Problems', duration: '2h', time: '9:00 AM', priority: 'high', done: false },
    { id: 13, subject: 'English', topic: 'Reading Comprehension', duration: '45m', time: '12:00 PM', priority: 'low', done: false },
    { id: 14, subject: 'Chemistry', topic: 'Revision', duration: '1h', time: '3:00 PM', priority: 'high', done: false },
  ],
  Saturday: [
    { id: 15, subject: 'Full Revision', topic: 'Mathematics + Physics', duration: '2h', time: '10:00 AM', priority: 'high', done: false },
    { id: 16, subject: 'Quiz Practice', topic: 'All Subjects', duration: '1h', time: '1:00 PM', priority: 'medium', done: false },
  ],
  Sunday: [
    { id: 17, subject: 'Rest & Light Review', topic: 'Go through notes', duration: '1h', time: '5:00 PM', priority: 'low', done: false },
  ],
}

// ── Priority Badge ──
const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-red-50 text-red-500 border-red-200',
    medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    low: 'bg-green-50 text-green-600 border-green-200',
  }
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${styles[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

const StudyPlan = () => {
  const [activeDay, setActiveDay] = useState('Monday')
  const [plan, setPlan] = useState(initialPlan)
  const [activeTab, setActiveTab] = useState('daily') // daily | weekly

  const toggleDone = (dayKey, taskId) => {
    setPlan(prev => ({
      ...prev,
      [dayKey]: prev[dayKey].map(task =>
        task.id === taskId ? { ...task, done: !task.done } : task
      )
    }))
  }

  const currentDayTasks = plan[activeDay] || []
  const completedCount = currentDayTasks.filter(t => t.done).length
  const totalCount = currentDayTasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Weekly stats
  const allTasks = Object.values(plan).flat()
  const totalDone = allTasks.filter(t => t.done).length
  const totalTasks = allTasks.length

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Plan</h1>
          <p className="text-gray-400 text-sm mt-1">AI generated personalized plan based on your performance</p>
        </div>

        {/* AI Generated Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdAutoAwesome size={18} />
          AI Generated Plan
        </div>
      </div>

      {/* ── Tab: Daily / Weekly ── */}
      <div className="flex bg-gray-100 rounded-full p-1 w-fit">
        {['daily', 'weekly'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 capitalize ${
              activeTab === tab
                ? 'text-white shadow-md'
                : 'text-gray-500 bg-transparent'
            }`}
            style={activeTab === tab ? { background: 'linear-gradient(to right, #0f766e, #14b8a6)' } : {}}
          >
            {tab === 'daily' ? '📅 Daily View' : '📆 Weekly View'}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════ */}
      {/* ── DAILY VIEW ── */}
      {/* ══════════════════════════════════ */}
      {activeTab === 'daily' && (
        <div className="flex flex-col gap-4">

          {/* Day Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weekDays.map(day => {
              const dayTasks = plan[day] || []
              const dayDone = dayTasks.filter(t => t.done).length
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 min-w-[80px] transition-all duration-200 ${
                    activeDay === day
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}
                  style={activeDay === day ? { background: 'linear-gradient(to bottom, #0f766e, #14b8a6)' } : {}}
                >
                  <span className="text-xs font-bold">{day.slice(0, 3)}</span>
                  <span className="text-lg font-extrabold mt-1">{dayTasks.length}</span>
                  <span className="text-xs opacity-70">{dayDone}/{dayTasks.length}</span>
                </button>
              )
            })}
          </div>

          {/* Day Progress */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-700">{activeDay}'s Progress</h3>
              <span className="text-sm font-bold text-teal-600">{completedCount}/{totalCount} done</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(to right, #0f766e, #14b8a6)',
                }}
              />
            </div>
            <p className="text-right text-xs text-gray-400 mt-1">{progressPercent}% complete</p>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-3">
            {currentDayTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <p className="text-gray-400">🎉 Is din ke liye koi session nahi!</p>
              </div>
            ) : (
              currentDayTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleDone(activeDay, task.id)}
                  className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    task.done ? 'border-teal-200 bg-teal-50/30' : 'border-gray-100'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {task.done
                      ? <MdCheckCircle className="text-teal-500" size={28} />
                      : <MdRadioButtonUnchecked className="text-gray-300" size={28} />
                    }
                  </div>

                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-gray-800 ${task.done ? 'line-through text-gray-400' : ''}`}>
                        {task.subject}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <p className={`text-sm mt-1 ${task.done ? 'text-gray-300 line-through' : 'text-gray-500'}`}>
                      {task.topic}
                    </p>
                  </div>

                  {/* Time + Duration */}
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 justify-end text-gray-400 text-xs mb-1">
                      <MdCalendarToday size={12} />
                      {task.time}
                    </div>
                    <div className="flex items-center gap-1 justify-end text-teal-600 text-xs font-bold">
                      <MdAccessTime size={12} />
                      {task.duration}
                    </div>
                  </div>
                </div>
              ))
            )}
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
                <p className="text-xs text-gray-400">Total Sessions</p>
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
                <p className="text-xs text-gray-400">Focus Subject</p>
                <p className="text-lg font-extrabold text-gray-800">Mathematics</p>
              </div>
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {weekDays.map(day => {
              const tasks = plan[day] || []
              const done = tasks.filter(t => t.done).length
              return (
                <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700">{day}</h3>
                    <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-lg">
                      {done}/{tasks.length}
                    </span>
                  </div>

                  {/* Mini Progress */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: tasks.length > 0 ? `${Math.round((done / tasks.length) * 100)}%` : '0%',
                        background: 'linear-gradient(to right, #0f766e, #14b8a6)',
                      }}
                    />
                  </div>

                  {/* Task Pills */}
                  <div className="flex flex-col gap-2">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => toggleDone(day, task.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
                          task.done ? 'bg-teal-50' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {task.done
                          ? <MdCheckCircle className="text-teal-500 flex-shrink-0" size={16} />
                          : <MdRadioButtonUnchecked className="text-gray-300 flex-shrink-0" size={16} />
                        }
                        <span className={`text-xs font-medium truncate ${task.done ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {task.subject}
                        </span>
                        <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{task.duration}</span>
                      </div>
                    ))}
                  </div>

                  {/* Go to Day */}
                  <button
                    onClick={() => { setActiveDay(day); setActiveTab('daily') }}
                    className="mt-3 w-full text-xs text-teal-600 font-semibold hover:underline"
                  >
                    View Details →
                  </button>
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
                Mathematics aur Chemistry aapke weakest subjects hain. Is hafte
                in par zyada focus rakho. AI ne in subjects ko har din schedule
                mein rakkha hai. Consistency se follow karo!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default StudyPlan