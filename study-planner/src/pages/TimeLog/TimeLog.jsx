import { useState, useEffect, useRef } from 'react'
import { MdPlayArrow, MdStop, MdAccessTime, MdBook, MdHistory } from 'react-icons/md'
import { FaFire } from 'react-icons/fa'

// ── Dummy Data ──
const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology']

const initialHistory = [
  { id: 1, subject: 'Mathematics', topic: 'Calculus', duration: '1h 30m', date: 'Mar 26', time: '9:00 AM' },
  { id: 2, subject: 'Physics', topic: 'Newton Laws', duration: '1h 00m', date: 'Mar 26', time: '11:00 AM' },
  { id: 3, subject: 'Chemistry', topic: 'Periodic Table', duration: '45m', date: 'Mar 25', time: '2:00 PM' },
  { id: 4, subject: 'English', topic: 'Essay Writing', duration: '30m', date: 'Mar 25', time: '4:00 PM' },
]

// ── Format seconds to hh:mm:ss ──
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ── Format seconds to readable ──
const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const TimeLog = () => {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState(initialHistory)
  const [sessionSaved, setSessionSaved] = useState(false)
  const intervalRef = useRef(null)

  // ── Timer Logic ──
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const handleStart = () => {
    if (!selectedSubject) return alert('Pehle subject select karo!')
    if (!topic.trim()) return alert('Topic ka naam likhо!')
    setIsRunning(true)
    setSessionSaved(false)
    setElapsed(0)
  }

  const handleStop = () => {
    setIsRunning(false)
    if (elapsed < 10) return // Too short — ignore

    // Save to history
    const now = new Date()
    const newSession = {
      id: Date.now(),
      subject: selectedSubject,
      topic: topic,
      duration: formatDuration(elapsed),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
    setHistory(prev => [newSession, ...prev])
    setSessionSaved(true)
    setElapsed(0)
    setTopic('')
    setSelectedSubject('')
  }

  // ── Today's total time per subject ──
  const todayStats = subjects.map(sub => {
    const todaySessions = history.filter(h => h.subject === sub && h.date === 'Mar 27')
    return { subject: sub, sessions: todaySessions.length }
  }).filter(s => s.sessions > 0)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daily Time Log</h1>
        <p className="text-gray-400 text-sm mt-1">Track your study sessions — AI will analyze your patterns</p>
      </div>

      {/* ── Row 1: Timer Card + Quick Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Timer Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <MdAccessTime className="text-teal-500" size={22} />
            Start Study Session
          </h2>

          {/* Subject Select */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isRunning}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all disabled:opacity-50"
            >
              <option value="">-- Subject chunein --</option>
              {subjects.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Topic Input */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Topic Name
            </label>
            <input
              type="text"
              placeholder="e.g. Calculus, Newton's Laws..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isRunning}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Timer Display */}
          <div
            className="rounded-2xl p-6 text-center mb-6"
            style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
          >
            <p className="text-white/70 text-sm mb-1">
              {isRunning ? `Studying: ${selectedSubject} — ${topic}` : 'Session Timer'}
            </p>
            <p className="text-5xl font-extrabold text-white tracking-widest">
              {formatTime(elapsed)}
            </p>
            {isRunning && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Start / Stop Button */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md"
                style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
              >
                <MdPlayArrow size={22} />
                Start Session
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md bg-red-500"
              >
                <MdStop size={22} />
                Stop & Save
              </button>
            )}
          </div>

          {/* Session Saved Message */}
          {sessionSaved && (
            <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-600 text-center">
              ✅ Session saved! AI is updating your study pattern.
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-4">

          {/* Today's Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaFire className="text-orange-400" />
              <h3 className="font-bold text-gray-700 text-sm">Today's Sessions</h3>
            </div>
            <p className="text-4xl font-extrabold text-gray-800">
              {history.filter(h => h.date === 'Mar 26').length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Sessions completed today</p>
          </div>

          {/* Total Logged */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MdBook className="text-teal-500" />
              <h3 className="font-bold text-gray-700 text-sm">Total Logged</h3>
            </div>
            <p className="text-4xl font-extrabold text-gray-800">{history.length}</p>
            <p className="text-xs text-gray-400 mt-1">All time sessions</p>
          </div>

          {/* AI Tip */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
          >
            <p className="text-xs font-bold mb-2">🤖 AI Tip</p>
            <p className="text-xs text-white/90 leading-relaxed">
              Log at least 3 sessions daily so AI can detect your study patterns accurately.
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 2: Session History ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <MdHistory className="text-teal-500" size={20} />
          Session History
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Topic</th>
                <th className="pb-3 font-semibold">Duration</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((session) => (
                <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50 transition-all">
                  <td className="py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-600">
                      {session.subject}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{session.topic}</td>
                  <td className="py-3 font-bold text-gray-800">{session.duration}</td>
                  <td className="py-3 text-gray-400">{session.date}</td>
                  <td className="py-3 text-gray-400">{session.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default TimeLog