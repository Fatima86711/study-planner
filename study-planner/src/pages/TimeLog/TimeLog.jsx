import { useState, useEffect, useRef } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MdPlayArrow, MdStop, MdAccessTime, MdBook, MdHistory, MdMinimize, MdOpenInFull, MdCloseFullscreen } from 'react-icons/md'
import { FaFire } from 'react-icons/fa'
import api from '../../services/api'
import { useCourses } from '../../context/CourseContext'

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ── Circular Timer ──
const CircularTimer = ({ elapsed, isRunning }) => {
  const maxSeconds = 3600
  const radius = 120
  const stroke = 8
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const progress = Math.min(elapsed / maxSeconds, 1)
  const strokeDashoffset = circumference - progress * circumference

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 360) / 60
    const isMain = i % 5 === 0
    const rad = (angle - 90) * (Math.PI / 180)
    const outerR = normalizedRadius + stroke
    const innerR = isMain ? normalizedRadius - 8 : normalizedRadius - 4
    return {
      x1: radius + outerR * Math.cos(rad),
      y1: radius + outerR * Math.sin(rad),
      x2: radius + innerR * Math.cos(rad),
      y2: radius + innerR * Math.sin(rad),
      isMain
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg width={radius * 2} height={radius * 2}>
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2}
              stroke={tick.isMain ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
              strokeWidth={tick.isMain ? 2 : 1}
            />
          ))}
          <circle stroke="rgba(255,255,255,0.1)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke="url(#progressGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease' }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%'
        }}>
          <p style={{ fontSize: '32px', fontWeight: '800', color: 'white', letterSpacing: '2px', margin: 0, fontFamily: 'monospace' }}>
            {formatTime(elapsed)}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0' }}>
            {isRunning ? '● RUNNING' : elapsed > 0 ? '■ STOPPED' : '○ READY'}
          </p>
          {isRunning && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '6px' }}>
              {[0, 150, 300].map((delay, i) => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: '#ec4899',
                  animation: 'bounce 1s infinite',
                  animationDelay: `${delay}ms`
                }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Minimized floating pill when timer is running ──
const MiniTimer = ({ elapsed, isRunning, onExpand }) => (
  <div
    onClick={onExpand}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
      borderRadius: '999px',
      padding: '10px 20px',
      cursor: 'pointer',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'box-shadow 0.2s'
    }}
  >
    {isRunning && (
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        backgroundColor: '#ec4899',
        animation: 'pulse 1s infinite'
      }} />
    )}
    <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '16px', color: 'white', letterSpacing: '2px' }}>
      {formatTime(elapsed)}
    </span>
    <MdOpenInFull size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
  </div>
)

const TimeLog = () => {
  const { courses } = useCourses()
  const [selectedCourse, setSelectedCourse] = useState('')
  const [topic, setTopic] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [history, setHistory] = useState([])
  const [todayCount, setTodayCount] = useState(0)
  const [sessionSaved, setSessionSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 'expanded' | 'minimized' | 'hidden'
  const [timerView, setTimerView] = useState('expanded')

  const intervalRef = useRef(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, todayRes] = await Promise.all([
          api.get('/api/study/history'),
          api.get('/api/study/today'),
        ])
        setHistory(historyRes.data.sessions)
        setTodayCount(todayRes.data.sessions.length)
      } catch {
        setError('Failed to load history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const handleStart = () => {
    if (!selectedCourse) { toast.warning('Please select a course first!'); return }
    if (!topic.trim()) { toast.warning('Please enter a topic name!'); return }
    setIsRunning(true)
    setSessionSaved(false)
    setElapsed(0)
    setError('')
    setTimerView('expanded')
  }

  const handleStop = async () => {
    setIsRunning(false)
    setTimerView('expanded')
    if (elapsed < 10) return
    const durationInMinutes = Math.ceil(elapsed / 60)
    setSaving(true)
    try {
      const response = await api.post('/api/study/session', {
        subject: selectedCourse,
        topic,
        duration: durationInMinutes,
      })
      setHistory(prev => [response.data.session, ...prev])
      setTodayCount(prev => prev + 1)
      setSessionSaved(true)
    } catch {
      setError('Failed to save session — please retry')
    } finally {
      setSaving(false)
      setElapsed(0)
      setTopic('')
      setSelectedCourse('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>

      {/* ── Page Title ── */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>⏱️ Daily Time Log</h1>
        <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '4px' }}>
          Track your study sessions — AI will analyze your patterns
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: '12px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── Row 1: Controls + Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* ── LEFT: Course/Topic Card + Timer ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Course & Topic Card — always visible */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid #F3F4F6'
          }}>
            <h2 style={{ fontWeight: '700', fontSize: '14px', color: '#374151', marginBottom: '16px', margin: '0 0 16px 0' }}>
              📋 Session Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {/* Course Select */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '6px' }}>
                  Select Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={isRunning}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '14px',
                    outline: 'none',
                    opacity: isRunning ? 0.5 : 1,
                    boxSizing: 'border-box',
                    cursor: isRunning ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="">-- Select Course --</option>
                  {courses.length > 0
                    ? courses.map((course) => (
                        <option key={course._id} value={course.name}>{course.name}</option>
                      ))
                    : <option disabled>No courses added yet</option>
                  }
                </select>
              </div>

              {/* Topic Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '6px' }}>
                  Topic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Calculus, Newton's Laws..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isRunning}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    fontSize: '14px',
                    outline: 'none',
                    opacity: isRunning ? 0.5 : 1,
                    boxSizing: 'border-box',
                    cursor: isRunning ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>

            {/* Active session badge */}
            {isRunning && selectedCourse && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#16A34A'
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A', animation: 'pulse 1s infinite' }} />
                <span>
                  <strong>{selectedCourse}</strong>{topic ? ` · ${topic}` : ''}
                </span>
              </div>
            )}

            {sessionSaved && (
              <div style={{
                marginTop: '12px',
                padding: '10px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#16A34A',
                textAlign: 'center'
              }}>
                ✅ Session saved successfully!
              </div>
            )}
          </div>

          {/* ── Timer Panel (collapsible) ── */}
          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Timer header bar — always shown */}
            <div style={{
              background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Traffic-light style dots */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {/* Close (hide timer entirely) */}
                  <button
                    onClick={() => setTimerView('hidden')}
                    title="Hide timer"
                    style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: '#ff5f57', border: 'none', cursor: 'pointer', padding: 0
                    }}
                  />
                  {/* Minimize → pill */}
                  <button
                    onClick={() => setTimerView('minimized')}
                    title="Minimize"
                    style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: '#febc2e', border: 'none', cursor: 'pointer', padding: 0
                    }}
                  />
                  {/* Expand */}
                  <button
                    onClick={() => setTimerView('expanded')}
                    title="Expand"
                    style={{
                      width: '12px', height: '12px', borderRadius: '50%',
                      backgroundColor: '#28c840', border: 'none', cursor: 'pointer', padding: 0
                    }}
                  />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px' }}>
                  STUDY TIMER
                </span>
              </div>

              {/* Live compact time in header when minimized */}
              {timerView === 'minimized' && (
                <span style={{ fontFamily: 'monospace', fontSize: '14px', color: 'white', fontWeight: '700', letterSpacing: '2px' }}>
                  {formatTime(elapsed)}
                  {isRunning && <span style={{ color: '#ec4899', marginLeft: '6px' }}>●</span>}
                </span>
              )}

              {timerView === 'hidden' && (
                <button
                  onClick={() => setTimerView('expanded')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '11px',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    letterSpacing: '1px'
                  }}
                >
                  SHOW TIMER
                </button>
              )}
            </div>

            {/* Timer body — expanded */}
            {timerView === 'expanded' && (
              <>
                <div style={{
                  background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
                  padding: '0 32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <CircularTimer elapsed={elapsed} isRunning={isRunning} />

                  {isRunning && selectedCourse && (
                    <div style={{ textAlign: 'center', marginTop: '4px' }}>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: '600' }}>
                        📚 {selectedCourse}
                      </p>
                      {topic && (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>
                          {topic}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Start / Stop Button */}
                <div style={{ backgroundColor: 'white', padding: '20px 24px' }}>
                  {!isRunning ? (
                    <button
                      onClick={handleStart}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                        background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                        color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <MdPlayArrow size={22} /> Start Session
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      disabled={saving}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
                        background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                        color: 'white', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: saving ? 0.7 : 1
                      }}
                    >
                      <MdStop size={22} />
                      {saving ? 'Saving...' : 'Stop & Save'}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Timer body — minimized: just the button */}
            {timerView === 'minimized' && (
              <div style={{ backgroundColor: 'white', padding: '16px 24px' }}>
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '14px', border: 'none',
                      background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                      color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <MdPlayArrow size={20} /> Start Session
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    disabled={saving}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '14px', border: 'none',
                      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                      color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    <MdStop size={20} />
                    {saving ? 'Saving...' : 'Stop & Save'}
                  </button>
                )}
              </div>
            )}

            {/* Timer hidden — only header bar shown (handled above) */}
          </div>
        </div>

        {/* ── RIGHT: Stats Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FaFire style={{ color: '#F97316' }} />
              <span style={{ fontWeight: '700', fontSize: '13px', color: '#374151' }}>Today's Sessions</span>
            </div>
            <p style={{ fontSize: '40px', fontWeight: '800', color: '#111827', margin: 0 }}>{todayCount}</p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>Sessions completed today</p>
          </div>

          <div style={{
            backgroundColor: 'white', borderRadius: '20px', padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MdBook style={{ color: '#14B8A6' }} size={18} />
              <span style={{ fontWeight: '700', fontSize: '13px', color: '#374151' }}>Total Logged</span>
            </div>
            <p style={{ fontSize: '40px', fontWeight: '800', color: '#111827', margin: 0 }}>{history.length}</p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>All time sessions</p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            borderRadius: '20px', padding: '20px', color: 'white'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>🤖 AI Tip</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
              Log at least 3 sessions daily so AI can detect your study patterns accurately.
            </p>
          </div>

        </div>
      </div>

      {/* ── Session History ── */}
      <div style={{
        backgroundColor: 'white', borderRadius: '24px', padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6'
      }}>
        <h2 style={{
          fontWeight: '700', fontSize: '16px', color: '#374151', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <MdHistory style={{ color: '#14B8A6' }} size={20} />
          Session History
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              width: '32px', height: '32px', border: '4px solid #E5E7EB',
              borderTop: '4px solid #14B8A6', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 8px'
            }} />
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            <MdHistory size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '14px' }}>No sessions yet — start your first session above!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6', color: '#9CA3AF', fontSize: '12px', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Course</th>
                  <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Topic</th>
                  <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Duration</th>
                  <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((session) => (
                  <tr
                    key={session._id}
                    style={{ borderBottom: '1px solid #F9FAFB' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                        fontWeight: '600', backgroundColor: '#F0FDFA', color: '#0F766E'
                      }}>
                        {session.subject}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', color: '#6B7280' }}>{session.topic}</td>
                    <td style={{ padding: '12px 0', fontWeight: '700', color: '#111827' }}>
                      {formatDuration(session.duration * 60)}
                    </td>
                    <td style={{ padding: '12px 0', color: '#9CA3AF' }}>
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} theme="light" />
    </div>
  )
}

export default TimeLog