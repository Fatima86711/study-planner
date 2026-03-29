import { useState, useEffect, useRef } from 'react'
import { MdPlayArrow, MdStop, MdAccessTime, MdBook, MdHistory } from 'react-icons/md'
import { FaFire } from 'react-icons/fa'
import api from '../../services/api'

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology']

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
  const [history, setHistory] = useState([])
  const [todayCount, setTodayCount] = useState(0)
  const [sessionSaved, setSessionSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const intervalRef = useRef(null)

  // ── History Fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, todayRes] = await Promise.all([
          api.get('/api/study/history'),
          api.get('/api/study/today'),
        ])
        setHistory(historyRes.data.sessions)
        setTodayCount(todayRes.data.sessions.length)
      } catch (err) {
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  // ── Timer Logic ────────────────────────────────────────────────────────────
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

  // ── Start Session ──────────────────────────────────────────────────────────
  const handleStart = () => {
    if (!selectedSubject) return alert('Pehle subject select karo!')
    if (!topic.trim()) return alert('Topic ka naam likho!')
    setIsRunning(true)
    setSessionSaved(false)
    setElapsed(0)
    setError('')
  }

  // ── Stop Session + Save to Backend ────────────────────────────────────────
  const handleStop = async () => {
    setIsRunning(false)

    if (elapsed < 10) return // Too short — ignore

    const durationInMinutes = Math.ceil(elapsed / 60) // Seconds to minutes

    setSaving(true)

    try {
      const response = await api.post('/api/study/session', {
        subject: selectedSubject,
        topic: topic,
        duration: durationInMinutes,
      })

      // Naya session history mein add karo — upar se
      setHistory(prev => [response.data.session, ...prev])
      setTodayCount(prev => prev + 1)
      setSessionSaved(true)

    } catch (err) {
      setError('Session save nahi hua — please retry')
    } finally {
      setSaving(false)
      setElapsed(0)
      setTopic('')
      setSelectedSubject('')
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Daily Time Log</h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your study sessions — AI will analyze your patterns
        </p>
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

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
              {isRunning
                ? `Studying: ${selectedSubject} — ${topic}`
                : 'Session Timer'}
            </p>
            <p className="text-5xl font-extrabold text-white tracking-widest">
              {formatTime(elapsed)}
            </p>
            {isRunning && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-white/80 animate-bounce"
                  style={{ animationDelay: '300ms' }} />
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
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md bg-red-500 disabled:opacity-60"
              >
                <MdStop size={22} />
                {saving ? 'Saving...' : 'Stop & Save'}
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
              {todayCount}
            </p>
            <p className="text-xs text-gray-400 mt-1">Sessions completed today</p>
          </div>

          {/* Total Logged */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MdBook className="text-teal-500" />
              <h3 className="font-bold text-gray-700 text-sm">Total Logged</h3>
            </div>
            <p className="text-4xl font-extrabold text-gray-800">
              {history.length}
            </p>
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

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MdHistory size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sessions yet — start your first session above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Topic</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session) => (
                  <tr
                    key={session._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-all"
                  >
                    <td className="py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-600">
                        {session.subject}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{session.topic}</td>
                    <td className="py-3 font-bold text-gray-800">
                      {formatDuration(session.duration * 60)}
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default TimeLog