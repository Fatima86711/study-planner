import { useState, useEffect } from 'react'
import { MdAdd, MdDelete, MdSearch, MdAutoAwesome, MdNote, MdClose } from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'
import api from '../../services/api'

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology']

// ── Subject Color ──
const subjectColor = (subject) => {
  const colors = {
    Mathematics: 'bg-blue-50 text-blue-600 border-blue-200',
    Physics: 'bg-purple-50 text-purple-600 border-purple-200',
    Chemistry: 'bg-orange-50 text-orange-600 border-orange-200',
    English: 'bg-pink-50 text-pink-600 border-pink-200',
    Biology: 'bg-green-50 text-green-600 border-green-200',
    'Computer Science': 'bg-teal-50 text-teal-600 border-teal-200',
  }
  return colors[subject] || 'bg-gray-50 text-gray-600 border-gray-200'
}

const Notes = () => {
  // ── Notes State ───────────────────────────────────────────────────────────
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── UI State ──────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)

  // ── Add Note State ────────────────────────────────────────────────────────
  const [newNote, setNewNote] = useState({ subject: '', title: '', content: '' })
  const [saving, setSaving] = useState(false)

  // ── AI State ──────────────────────────────────────────────────────────────
  const [analyzing, setAnalyzing] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [aiPreview, setAiPreview] = useState(null) // Modal mein AI preview

  // ── Fetch Notes ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/api/notes/my-notes')
        setNotes(res.data.notes)
      } catch (err) {
        setError('Notes load nahi hue')
      } finally {
        setLoading(false)
      }
    }
    fetchNotes()
  }, [])

  // ── Filter Notes ──────────────────────────────────────────────────────────
  const filteredNotes = notes.filter(note => {
    const matchSubject = selectedSubject === 'All' || note.subject === selectedSubject
    const matchSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  // ── AI Summarize in Modal (Preview) ───────────────────────────────────────
  const handleAiSummarize = async () => {
    if (!newNote.content.trim()) return alert('Pehle content likho!')
    setSummarizing(true)
    setAiPreview(null)

    try {
      const res = await api.post('/api/notes/summarize', {
        content: newNote.content,
      })
      setAiPreview({
        summary: res.data.summary,
        suggestions: res.data.suggestions,
      })
    } catch (err) {
      alert('AI summary generate nahi hui — please retry')
    } finally {
      setSummarizing(false)
    }
  }

  // ── Save Note — Bina AI ───────────────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      return alert('Sab fields fill karo!')
    }
    setSaving(true)

    try {
      const res = await api.post('/api/notes/save', {
        title: newNote.title,
        subject: newNote.subject,
        content: newNote.content,
      })
      setNotes(prev => [res.data.note, ...prev])
      resetModal()
    } catch (err) {
      alert('Note save nahi hua — please retry')
    } finally {
      setSaving(false)
    }
  }

  // ── Save Note — AI Summary Ke Saath ──────────────────────────────────────
  const handleSaveWithSummary = async () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      return alert('Sab fields fill karo!')
    }
    if (!aiPreview) return alert('Pehle AI summary generate karo!')
    setSaving(true)

    try {
      const res = await api.post('/api/notes/save-with-summary', {
        title: newNote.title,
        subject: newNote.subject,
        content: newNote.content,
        summary: aiPreview.summary,
        suggestions: aiPreview.suggestions,
      })
      setNotes(prev => [res.data.note, ...prev])
      resetModal()
    } catch (err) {
      alert('Note save nahi hua — please retry')
    } finally {
      setSaving(false)
    }
  }

  // ── Analyze Existing Note ─────────────────────────────────────────────────
  const handleAnalyzeExisting = async (note) => {
    setAnalyzing(true)

    try {
      const res = await api.post('/api/notes/summarize', {
        content: note.content,
      })

      // Save with summary
      const saveRes = await api.post('/api/notes/save-with-summary', {
        title: note.title,
        subject: note.subject,
        content: note.content,
        summary: res.data.summary,
        suggestions: res.data.suggestions,
      })

      // Local state update — purana note replace karo
      const updatedNote = {
        ...note,
        summary: res.data.summary,
        suggestions: res.data.suggestions,
      }

      setNotes(prev => prev.map(n => n._id === note._id ? updatedNote : n))
      setSelectedNote(updatedNote)

    } catch (err) {
      alert('AI analysis fail — please retry')
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Delete Note ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`)
      setNotes(prev => prev.filter(n => n._id !== id))
      if (selectedNote?._id === id) setSelectedNote(null)
    } catch (err) {
      console.error('Delete note failed', err)
      alert('Note delete karne mein problem aayi. Please retry karo.')
      // Re-fetch notes to keep state consistent with server
      try {
        const res = await api.get('/api/notes/my-notes')
        setNotes(res.data.notes)
        setSelectedNote(null)
      } catch (fetchErr) {
        console.error('Refresh after delete failure failed', fetchErr)
      }
    }
  }

  // ── Reset Modal ───────────────────────────────────────────────────────────
  const resetModal = () => {
    setShowAddModal(false)
    setNewNote({ subject: '', title: '', content: '' })
    setAiPreview(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI aapke notes analyze karke suggestions dega
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdAdd size={20} />
          Add Note
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Search + Filter ── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <MdSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Notes search karein..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 outline-none focus:border-teal-400"
        >
          <option value="All">All Subjects</option>
          {subjects.map((sub, i) => (
            <option key={i} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      {/* ── Main Content ── */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading notes...</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-col lg:flex-row">

          {/* ── Notes List ── */}
          <div className="flex flex-col gap-3 lg:w-2/5">
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <MdNote className="text-gray-300 mx-auto mb-2" size={40} />
                <p className="text-gray-400 text-sm">Koi note nahi mila</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note._id}
                  onClick={() => setSelectedNote(note)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedNote?._id === note._id
                      ? 'border-teal-400 shadow-md'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${subjectColor(note.subject)}`}>
                        {note.subject}
                      </span>
                      <h3 className="font-bold text-gray-800 mt-2 text-sm">{note.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{note.content}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(note._id) }}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })}
                    </span>
                    {note.summary && (
                      <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                        <MdAutoAwesome size={12} /> AI Analyzed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Note Detail Panel ── */}
          <div className="flex-1">
            {!selectedNote ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <MdNote className="text-gray-200 mb-3" size={60} />
                <p className="text-gray-400 font-medium">Koi note select karein</p>
                <p className="text-gray-300 text-sm mt-1">
                  Left side se note click karein details dekhne ke liye
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${subjectColor(selectedNote.subject)}`}>
                      {selectedNote.subject}
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">
                      {selectedNote.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedNote._id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <MdDelete size={22} />
                  </button>
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {selectedNote.content}
                  </p>
                </div>

                {/* AI Analyze Button — agar summary nahi hai */}
                {!selectedNote.summary && (
                  <button
                    onClick={() => handleAnalyzeExisting(selectedNote)}
                    disabled={analyzing}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md disabled:opacity-70"
                    style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                  >
                    {analyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        AI Analyze kar raha hai...
                      </>
                    ) : (
                      <>
                        <FaBrain size={16} />
                        AI se Analyze Karao
                      </>
                    )}
                  </button>
                )}

                {/* AI Results — agar summary hai */}
                {selectedNote.summary && (
                  <div className="flex flex-col gap-3">

                    {/* AI Summary */}
                    <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MdAutoAwesome className="text-teal-500" size={16} />
                        <span className="text-sm font-bold text-teal-700">AI Summary</span>
                      </div>
                      <p className="text-sm text-teal-700 leading-relaxed">
                        {selectedNote.summary}
                      </p>
                    </div>

                    {/* AI Suggestions */}
                    {selectedNote.suggestions?.length > 0 && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaBrain className="text-purple-500" size={16} />
                          <span className="text-sm font-bold text-purple-700">
                            AI Suggestions
                          </span>
                        </div>
                        <ul className="flex flex-col gap-1">
                          {selectedNote.suggestions.map((tip, i) => (
                            <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                              <span className="flex-shrink-0">💡</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Re-analyze */}
                    <button
                      onClick={() => handleAnalyzeExisting(selectedNote)}
                      disabled={analyzing}
                      className="text-xs text-teal-600 font-semibold hover:underline text-center disabled:opacity-50"
                    >
                      🔄 Dobara Analyze Karao
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════ */}
      {/* ── Add Note Modal ── */}
      {/* ══════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Naya Note Add Karein</h2>
              <button onClick={resetModal} className="text-gray-400 hover:text-gray-600">
                <MdClose size={24} />
              </button>
            </div>

            {/* Subject */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Subject</label>
              <select
                value={newNote.subject}
                onChange={(e) => setNewNote(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              >
                <option value="">-- Subject chunein --</option>
                {subjects.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Note Title</label>
              <input
                type="text"
                placeholder="e.g. Calculus Notes, Newton Laws..."
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400"
              />
            </div>

            {/* Content */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Notes Content
              </label>
              <textarea
                rows={5}
                placeholder="Apne notes yahan likhein — AI analyze karega..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 resize-none"
              />
            </div>

            {/* AI Summarize Button */}
            <button
              onClick={handleAiSummarize}
              disabled={summarizing || !newNote.content.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-teal-400 text-teal-600 font-semibold text-sm mb-4 hover:bg-teal-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {summarizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                  AI Summary Generate Ho Rahi Hai...
                </>
              ) : (
                <>
                  <FaBrain size={14} />
                  AI Summary Generate Karo (Optional)
                </>
              )}
            </button>

            {/* AI Preview — agar summary generate hui */}
            {aiPreview && (
              <div className="mb-4 flex flex-col gap-2">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
                  <p className="text-xs font-bold text-teal-700 mb-1">
                    ✅ AI Summary:
                  </p>
                  <p className="text-xs text-teal-600">{aiPreview.summary}</p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-xs font-bold text-purple-700 mb-1">
                    💡 AI Suggestions:
                  </p>
                  {aiPreview.suggestions.map((tip, i) => (
                    <p key={i} className="text-xs text-purple-600">• {tip}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetModal}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>

              {/* Save without AI */}
              {!aiPreview && (
                <button
                  onClick={handleSaveNote}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </button>
              )}

              {/* Save with AI Summary */}
              {aiPreview && (
                <button
                  onClick={handleSaveWithSummary}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-60"
                  style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
                >
                  {saving ? 'Saving...' : '✨ Save with AI'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes
