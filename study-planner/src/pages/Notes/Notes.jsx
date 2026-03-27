import { useState } from 'react'
import { MdAdd, MdDelete, MdSearch, MdAutoAwesome, MdNote, MdClose } from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'

// ── Dummy Notes ──
const initialNotes = [
  {
    id: 1,
    subject: 'Mathematics',
    title: 'Calculus Notes',
    content: 'Derivative of x² is 2x. Integration is the reverse of differentiation. Chain rule: d/dx[f(g(x))] = f\'(g(x)) · g\'(x)',
    date: 'Mar 26',
    aiSummary: 'Calculus ke basic rules cover kiye gaye hain — derivatives, integration, aur chain rule.',
    aiSuggestion: 'L\'Hopital Rule aur Partial Derivatives bhi parho.',
    analyzed: true,
  },
  {
    id: 2,
    subject: 'Physics',
    title: 'Newton Laws',
    content: 'First law: An object at rest stays at rest. Second law: F = ma. Third law: Every action has equal and opposite reaction.',
    date: 'Mar 25',
    aiSummary: 'Newton ke teeno laws of motion summarize kiye gaye hain.',
    aiSuggestion: 'Friction aur Circular Motion ke saath in laws ka application parho.',
    analyzed: true,
  },
  {
    id: 3,
    subject: 'Chemistry',
    title: 'Periodic Table',
    content: 'Elements are arranged by atomic number. Groups are vertical columns. Periods are horizontal rows. Noble gases are in group 18.',
    date: 'Mar 24',
    aiSummary: 'Periodic table ki basic structure aur element arrangement explain ki gayi hai.',
    aiSuggestion: 'Valence electrons aur electronegativity trends bhi cover karo.',
    analyzed: true,
  },
]

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Biology']

// ── AI Analyze Simulation ──
const simulateAI = (content) => {
  const words = content.trim().split(' ').length
  return {
    aiSummary: `Aapke notes mein ${words} words hain. AI ne key concepts identify kiye hain jo is topic ka core cover karte hain.`,
    aiSuggestion: 'Recommend hai ke in concepts ko quiz mein test karo aur related topics bhi explore karo for better understanding.',
  }
}

const Notes = () => {
  const [notes, setNotes] = useState(initialNotes)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  // New note form state
  const [newNote, setNewNote] = useState({ subject: '', title: '', content: '' })

  // ── Filter Notes ──
  const filteredNotes = notes.filter(note => {
    const matchSubject = selectedSubject === 'All' || note.subject === selectedSubject
    const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  // ── Add Note ──
  const handleAddNote = () => {
    if (!newNote.subject || !newNote.title || !newNote.content.trim()) {
      alert('Sab fields fill karo!')
      return
    }
    const note = {
      id: Date.now(),
      subject: newNote.subject,
      title: newNote.title,
      content: newNote.content,
      date: 'Mar 27',
      aiSummary: null,
      aiSuggestion: null,
      analyzed: false,
    }
    setNotes(prev => [note, ...prev])
    setNewNote({ subject: '', title: '', content: '' })
    setShowAddModal(false)
  }

  // ── Delete Note ──
  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (selectedNote?.id === id) setSelectedNote(null)
  }

  // ── AI Analyze ──
  const handleAnalyze = (note) => {
    setAnalyzing(true)
    setTimeout(() => {
      const result = simulateAI(note.content)
      const updated = {
        ...note,
        aiSummary: result.aiSummary,
        aiSuggestion: result.aiSuggestion,
        analyzed: true,
      }
      setNotes(prev => prev.map(n => n.id === note.id ? updated : n))
      setSelectedNote(updated)
      setAnalyzing(false)
    }, 2000) // 2 second AI simulation
  }

  // ── Subject color ──
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

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-400 text-sm mt-1">AI aapke notes analyze karke suggestions dega</p>
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

      {/* ── Search + Filter ── */}
      <div className="flex flex-wrap gap-3">

        {/* Search */}
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

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 outline-none focus:border-teal-400"
        >
          <option value="All">All Subjects</option>
          {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
        </select>
      </div>

      {/* ── Main Content: Notes List + Detail ── */}
      <div className="flex gap-4 flex-col lg:flex-row">

        {/* Notes List */}
        <div className="flex flex-col gap-3 lg:w-2/5">
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <MdNote className="text-gray-300 mx-auto mb-2" size={40} />
              <p className="text-gray-400 text-sm">Koi note nahi mila</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedNote?.id === note.id
                    ? 'border-teal-400 shadow-md'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {/* Subject Badge */}
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${subjectColor(note.subject)}`}>
                      {note.subject}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-gray-800 mt-2 text-sm">{note.title}</h3>

                    {/* Preview */}
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{note.content}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id) }}
                    className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{note.date}</span>
                  {note.analyzed && (
                    <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                      <MdAutoAwesome size={12} /> AI Analyzed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Note Detail Panel */}
        <div className="flex-1">
          {!selectedNote ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center h-full flex flex-col items-center justify-center">
              <MdNote className="text-gray-200 mb-3" size={60} />
              <p className="text-gray-400 font-medium">Koi note select karein</p>
              <p className="text-gray-300 text-sm mt-1">Left side se note click karein details dekhne ke liye</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col gap-4">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${subjectColor(selectedNote.subject)}`}>
                    {selectedNote.subject}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedNote.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">{selectedNote.date}</p>
                </div>
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <MdDelete size={22} />
                </button>
              </div>

              {/* Note Content */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.content}
                </p>
              </div>

              {/* AI Analyze Button */}
              {!selectedNote.analyzed && (
                <button
                  onClick={() => handleAnalyze(selectedNote)}
                  disabled={analyzing}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-105 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
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

              {/* AI Results */}
              {selectedNote.analyzed && (
                <div className="flex flex-col gap-3">

                  {/* AI Summary */}
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MdAutoAwesome className="text-teal-500" size={16} />
                      <span className="text-sm font-bold text-teal-700">AI Summary</span>
                    </div>
                    <p className="text-sm text-teal-700 leading-relaxed">
                      {selectedNote.aiSummary}
                    </p>
                  </div>

                  {/* AI Suggestion */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FaBrain className="text-purple-500" size={16} />
                      <span className="text-sm font-bold text-purple-700">AI Suggestion</span>
                    </div>
                    <p className="text-sm text-purple-700 leading-relaxed">
                      {selectedNote.aiSuggestion}
                    </p>
                  </div>

                  {/* Re-analyze */}
                  <button
                    onClick={() => handleAnalyze(selectedNote)}
                    disabled={analyzing}
                    className="text-xs text-teal-600 font-semibold hover:underline text-center"
                  >
                    🔄 Dobara Analyze Karao
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════ */}
      {/* ── Add Note Modal ── */}
      {/* ══════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">Naya Note Add Karein</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
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
                {subjects.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
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
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600 mb-1 block">Notes Content</label>
              <textarea
                rows={5}
                placeholder="Apne notes yahan likhein — AI analyze karega..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notes