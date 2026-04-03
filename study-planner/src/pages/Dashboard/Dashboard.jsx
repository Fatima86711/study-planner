import { useState, useEffect } from 'react'
import { MdLocalFireDepartment, MdAccessTime, MdWarning, MdCheckCircle } from 'react-icons/md'
import { FaBrain, FaChartLine } from 'react-icons/fa'
import api from '../../services/api'

// ── Score Utilities ──────────────────────────────────────────────────────────
const getScoreStyle = (pct) => {
  if (pct >= 75) return { text: '#166534', bg: '#dcfce7', dot: '#16a34a', label: 'Excellent' }
  if (pct >= 55) return { text: '#854d0e', bg: '#fef9c3', dot: '#ca8a04', label: 'Average' }
  return { text: '#991b1b', bg: '#fee2e2', dot: '#dc2626', label: 'Needs Work' }
}

// ── Micro Components ─────────────────────────────────────────────────────────

const Ring = ({ value, size = 72, stroke = 6, color = '#2563eb' }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
      />
    </svg>
  )
}

const Bar = ({ value, color = '#2563eb', height = 6 }) => (
  <div style={{ height, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden', width: '100%' }}>
    <div style={{
      height: '100%', width: `${Math.min(value, 100)}%`,
      background: color, borderRadius: 99,
      transition: 'width 0.9s cubic-bezier(.4,0,.2,1)',
    }} />
  </div>
)

const Tag = ({ children, color }) => (
  <span style={{
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', padding: '3px 8px', borderRadius: 6,
    background: color.bg, color: color.text,
  }}>{children}</span>
)

const Divider = () => (
  <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
)

const EmptyState = ({ text }) => (
  <div style={{ textAlign: 'center', padding: '32px 16px' }}>
    <div style={{
      width: 48, height: 48, borderRadius: 14, background: '#f8fafc',
      border: '1.5px dashed #e2e8f0', margin: '0 auto 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 20, opacity: 0.4 }}>–</span>
    </div>
    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{text}</p>
  </div>
)

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, light }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e8ecf0',
    borderRadius: 20,
    padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 14,
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: 80, height: 80,
      background: `radial-gradient(circle at top right, ${light} 0%, transparent 70%)`,
      pointerEvents: 'none',
    }} />
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: light,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 5px' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.03em' }}>{value}</p>
    </div>
    <div style={{ height: 3, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: '60%', background: accent, borderRadius: 99 }} />
    </div>
  </div>
)

// ── Section Card ─────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e8ecf0',
    borderRadius: 20,
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    ...style,
  }}>
    {children}
  </div>
)

const SectionTitle = ({ icon, title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: sub ? 5 : 0 }}>
      <div style={{ opacity: 0.85 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
    </div>
    {sub && <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, paddingLeft: 30 }}>{sub}</p>}
  </div>
)

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [weeklyData, setWeeklyData] = useState([])
  const [weakSubjects, setWeakSubjects] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [todayPlan, setTodayPlan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, weakRes, quizRes, planRes] = await Promise.all([
          api.get('/api/analytics/dashboard'),
          api.get('/api/analytics/weak-subjects'),
          api.get('/api/quiz/history'),
          api.get('/api/study-plan/my-plans'),
        ])
        setDashboard(dashRes.data.dashboard)
        setWeakSubjects(weakRes.data.subjectSummary.slice(0, 3))
        setRecentQuizzes(quizRes.data.attempts.slice(0, 3))
        if (planRes.data.plans.length > 0) {
          setTodayPlan(planRes.data.plans[0].tasks.slice(0, 4))
        }
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid #e2e8f0', borderTopColor: '#2563eb',
          animation: 'spin 0.75s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, animation: 'pulse 2s ease-in-out infinite' }}>
          Loading dashboard...
        </p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 300 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#dc2626', margin: '0 0 6px' }}>{error}</p>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Please refresh the page to try again.</p>
      </div>
    </div>
  )

  const todayProgress = dashboard?.plans?.completionRate || 0
  const todayMinutes = dashboard?.today?.minutes || 0
  const todayHours = (todayMinutes / 60).toFixed(1)
  const completedTasks = todayPlan.filter(t => t.isCompleted).length

  const SUBJECT_COLORS = [
    { bar: '#2563eb', light: '#eff6ff' },
    { bar: '#7c3aed', light: '#f5f3ff' },
    { bar: '#0d9488', light: '#f0fdfa' },
    { bar: '#ea580c', light: '#fff7ed' },
    { bar: '#db2777', light: '#fdf2f8' },
  ]

  const stats = [
    {
      icon: <MdLocalFireDepartment size={20} color="#ea580c" />,
      label: 'Study Streak',
      value: `${dashboard?.streak || 0} days`,
      accent: '#f97316',
      light: '#fff7ed',
    },
    {
      icon: <MdAccessTime size={20} color="#0d9488" />,
      label: 'Total Hours',
      value: `${dashboard?.totalHours || 0} hrs`,
      accent: '#14b8a6',
      light: '#f0fdfa',
    },
    {
      icon: <MdWarning size={20} color="#dc2626" />,
      label: 'Weak Subjects',
      value: `${weakSubjects.filter(s => s.isWeak).length} found`,
      accent: '#ef4444',
      light: '#fef2f2',
    },
    {
      icon: <MdCheckCircle size={20} color="#16a34a" />,
      label: "Today's Goal",
      value: `${todayProgress}% done`,
      accent: '#22c55e',
      light: '#f0fdf4',
    },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 22,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      minHeight: '100%',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .dash-row { animation: fadeUp 0.4s ease both; }
        .dash-row:nth-child(1) { animation-delay: 0s; }
        .dash-row:nth-child(2) { animation-delay: 0.07s; }
        .dash-row:nth-child(3) { animation-delay: 0.14s; }
        .dash-row:nth-child(4) { animation-delay: 0.21s; }
        .task-row:hover { background: #f8fafc !important; }
        .quiz-row:hover { background: #f8fafc !important; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; transition: all 0.2s ease; }
      `}</style>

      {/* ── Header ── */}
      <div className="dash-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 6, height: 28, background: 'linear-gradient(to bottom, #2563eb, #7c3aed)', borderRadius: 99 }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.04em' }}>
              Dashboard
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 0 16px', fontWeight: 400 }}>
            Study overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Today's Progress Ring */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: '#fff', border: '1px solid #e8ecf0',
          borderRadius: 16, padding: '14px 18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div style={{ position: 'relative', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ring value={todayProgress} size={52} stroke={5} color="#2563eb" />
            <span style={{ position: 'absolute', fontSize: 10, fontWeight: 700, color: '#2563eb' }}>
              {todayProgress}%
            </span>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, margin: '0 0 2px' }}>Daily Goal</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{todayHours} hrs · {dashboard?.today?.sessions || 0} sessions</p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Row 2: Goal + Weak Subjects ── */}
      <div className="dash-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* Today's Goal */}
        <Card>
          <SectionTitle
            icon={<FaChartLine color="#2563eb" size={15} />}
            title="Study Goal Progress"
            sub={`${todayHours} hrs studied · ${dashboard?.today?.sessions || 0} sessions today`}
          />

          {/* Main ring + number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ring value={todayProgress} size={80} stroke={7} color="#2563eb" />
              <span style={{ position: 'absolute', fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
                {todayProgress}%
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px' }}>Daily target completion</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag children={`${completedTasks} tasks done`} color={{ bg: '#eff6ff', text: '#1d4ed8' }} />
                {todayProgress >= 75 && <Tag children="On track" color={{ bg: '#dcfce7', text: '#166534' }} />}
                {todayProgress < 40 && <Tag children="Needs push" color={{ bg: '#fee2e2', text: '#991b1b' }} />}
              </div>
            </div>
          </div>

          <Divider />

          {/* Subject mini bars */}
          {weakSubjects.length > 0 ? (
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>
                Subject Scores
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {weakSubjects.slice(0, 3).map((item, i) => {
                  const c = SUBJECT_COLORS[i % SUBJECT_COLORS.length]
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 3, background: c.bar, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{item.subject}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: c.bar }}>{item.averagePercentage}%</span>
                      </div>
                      <Bar value={item.averagePercentage} color={c.bar} height={6} />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <EmptyState text="Attempt a quiz to see subject scores" />
          )}
        </Card>

        {/* Weak Subjects */}
        <Card>
          <SectionTitle
            icon={<FaBrain color="#dc2626" size={14} />}
            title="Weak Subjects"
            sub="Areas that need your attention"
          />

          {weakSubjects.length === 0 ? (
            <EmptyState text="No quiz data yet — attempt a quiz to see analysis" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {weakSubjects.map((subject, i) => {
                const ss = getScoreStyle(subject.averagePercentage)
                return (
                  <div key={i} style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid #f1f5f9',
                    background: '#fafbfc',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: ss.dot }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{subject.subject}</span>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px',
                        borderRadius: 8, background: ss.bg, color: ss.text,
                      }}>{subject.averagePercentage}% · {ss.label}</span>
                    </div>
                    <Bar
                      value={subject.averagePercentage}
                      color={ss.dot}
                      height={7}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {weakSubjects.length > 0 && (
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: 12, color: '#991b1b', margin: 0, lineHeight: 1.6 }}>
                <strong>AI Tip:</strong> Spend an extra 30 mins daily on{' '}
                <strong>{weakSubjects[0]?.subject}</strong> this week to improve your score.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 3: Study Plan + Quiz Scores ── */}
      <div className="dash-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* Study Plan */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <SectionTitle
              icon={<span style={{ fontSize: 15 }}>📅</span>}
              title="Today's Study Plan"
            />
            {todayPlan.length > 0 && (
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#2563eb',
                background: '#eff6ff', padding: '4px 10px', borderRadius: 8,
                marginTop: -20,
              }}>
                {completedTasks}/{todayPlan.length} done
              </div>
            )}
          </div>

          {todayPlan.length === 0 ? (
            <EmptyState text="No study plan yet — create one in Study Plan page" />
          ) : (
            <>
              {/* Thin progress bar */}
              <div style={{ marginBottom: 16, marginTop: -8 }}>
                <Bar value={(completedTasks / todayPlan.length) * 100} color="#2563eb" height={4} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayPlan.map((item, i) => (
                  <div
                    key={i}
                    className="task-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      background: item.isCompleted ? '#f0fdf4' : '#fff',
                      border: `1px solid ${item.isCompleted ? '#bbf7d0' : '#f1f5f9'}`,
                      cursor: 'default', transition: 'background 0.15s',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      background: item.isCompleted ? '#16a34a' : '#fff',
                      border: `2px solid ${item.isCompleted ? '#16a34a' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.isCompleted && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4L4 7L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 600, margin: 0,
                        color: item.isCompleted ? '#15803d' : '#1e293b',
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        opacity: item.isCompleted ? 0.7 : 1,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.description}
                      </p>
                      {item.dueDate && (
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                          Due {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {item.isCompleted && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', letterSpacing: '0.04em', flexShrink: 0 }}>
                        ✓ DONE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Quiz Scores */}
        <Card>
          <SectionTitle
            icon={<span style={{ fontSize: 15 }}>📝</span>}
            title="Recent Quiz Scores"
            sub="Your latest performance results"
          />

          {recentQuizzes.length === 0 ? (
            <EmptyState text="No quizzes attempted yet — go to Quiz page to start" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentQuizzes.map((quiz, i) => {
                const ss = getScoreStyle(quiz.percentage)
                return (
                  <div
                    key={i}
                    className="quiz-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 14,
                      border: '1px solid #f1f5f9', background: '#fafbfc',
                      transition: 'background 0.15s', cursor: 'default',
                    }}
                  >
                    {/* Score circle */}
                    <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ring value={quiz.percentage} size={46} stroke={4} color={ss.dot} />
                      <span style={{ position: 'absolute', fontSize: 9, fontWeight: 800, color: ss.dot }}>
                        {quiz.percentage}%
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {quiz.subject}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                        {new Date(quiz.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: ss.dot, margin: '0 0 3px', letterSpacing: '-0.03em' }}>
                        {quiz.score}
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>/{quiz.totalQuestions}</span>
                      </p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: ss.bg, color: ss.text }}>
                        {ss.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{
            marginTop: 16, padding: '12px 14px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
              <strong>Tip:</strong> Attempt quizzes regularly so the AI can refine your personalized study plan.
            </p>
          </div>
        </Card>

      </div>
    </div>
  )
}

export default Dashboard