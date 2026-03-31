import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { MdCheckCircle, MdCancel, MdArrowForward, MdRefresh, MdNote } from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'
import api from '../../services/api'

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Computer Science']

// ── Result Card ──
const ResultCard = ({ score, total, subject, topic, notesUsed, onRetry }) => {
  const percentage = Math.round((score / total) * 100)
  const getMessage = () => {
    if (percentage >= 80) return { text: 'Excellent! 🎉', color: 'text-green-500' }
    if (percentage >= 60) return { text: 'Good Job! 👍', color: 'text-yellow-500' }
    return { text: 'Needs Improvement 💪', color: 'text-red-400' }
  }
  const msg = getMessage()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center border border-gray-100">

        {/* Score Circle */}
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
          style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
        >
          <div>
            <p className="text-4xl font-extrabold text-white">{percentage}%</p>
            <p className="text-white/80 text-xs">{score}/{total} correct</p>
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-2 ${msg.color}`}>{msg.text}</h2>
        <p className="text-gray-400 text-sm mb-4">
          Subject: <span className="font-semibold text-gray-600">{subject}</span>
          {topic && (
            <> · Topic: <span className="font-semibold text-gray-600">{topic}</span></>
          )}
        </p>

        {/* Notes Used Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 ${
          notesUsed > 0
            ? 'bg-teal-50 text-teal-600 border border-teal-200'
            : 'bg-gray-100 text-gray-500 border border-gray-200'
        }`}>
          <MdNote size={14} />
          {notesUsed > 0
            ? `${notesUsed} questions generated from your notes`
            : 'Questions generated from general study material'}
        </div>

        {/* Score Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-500 mb-3">QUIZ SUMMARY</p>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Subject</span>
            <span className="text-sm font-bold text-gray-800">{subject}</span>
          </div>
          {topic && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Topic</span>
              <span className="text-sm font-bold text-gray-800">{topic}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Score</span>
            <span className="text-sm font-bold text-gray-800">{score}/{total}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">Percentage</span>
            <span className={`text-sm font-bold ${msg.color}`}>{percentage}%</span>
          </div>
        </div>

        {/* AI Tip */}
        <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-600 mb-6">
          {percentage >= 80
            ? '💡 Great performance! Keep it up and try a harder topic next time.'
            : percentage >= 60
            ? `💡 Good effort! Revise ${subject} once more to strengthen your concepts.`
            : `💡 AI Tip: Focus on ${subject} — spend extra time on weak areas this week.`
          }
        </div>

        <button
          onClick={onRetry}
          className="flex items-center gap-2 mx-auto px-8 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdRefresh size={18} />
          Try Another Quiz
        </button>
      </div>
    </div>
  )
}

// ── Main Quiz Component ──
const Quiz = () => {
  const [selectedSubject, setSelectedSubject] = useState('')
  const [topic, setTopic] = useState('')               // ← Naya
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizData, setQuizData] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [notesUsed, setNotesUsed] = useState(0)        // ← Naya

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Generate Questions ────────────────────────────────────────────────────
  const handleStartQuiz = async () => {
    if (!selectedSubject) {
      toast.warning('Please select a subject first!')
      return
    }
    setGenerating(true)
    setGenError('')

    try {
      const res = await api.post('/api/ai/quiz', {
        subject: selectedSubject,
        topic: topic.trim() || null,   // Topic is optional — use null when empty
      })

      setQuizData(res.data.questions)
      setNotesUsed(res.data.notesUsed)
      setQuizStarted(true)

    } catch (err) {
      setGenError('Failed to generate questions — please retry')
    } finally {
      setGenerating(false)
    }
  }

  const handleOptionClick = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    if (index === quizData[currentIndex].correct) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = async () => {
    if (currentIndex + 1 >= quizData.length) {
      await handleSaveScore()
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    }
  }

  const handleSaveScore = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/quiz/attempt', {
        subject: selectedSubject,
        score: score,
        totalQuestions: quizData.length,
      })
    } catch (err) {
      console.error('Failed to save score:', err)
    } finally {
      setSubmitting(false)
      setIsFinished(true)
    }
  }

  const handleRetry = () => {
    setSelectedSubject('')
    setTopic('')
    setQuizStarted(false)
    setQuizData([])
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setIsFinished(false)
    setGenError('')
    setNotesUsed(0)
  }

  const getOptionStyle = (index) => {
    if (!isAnswered) {
      return selectedOption === index
        ? 'border-teal-400 bg-teal-50'
        : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/50'
    }
    if (index === quizData[currentIndex].correct) return 'border-green-400 bg-green-50'
    if (index === selectedOption) return 'border-red-400 bg-red-50'
    return 'border-gray-200 bg-gray-50 opacity-50'
  }

  const progress = quizStarted ? ((currentIndex) / quizData.length) * 100 : 0

  // ── Result Screen ─────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz Results</h1>
          <p className="text-gray-400 text-sm mt-1">AI is analyzing your performance</p>
        </div>
        <ResultCard
          score={score}
          total={quizData.length}
          subject={selectedSubject}
          topic={topic}
          notesUsed={notesUsed}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  // ── Setup Screen ──────────────────────────────────────────────────────────
  if (!quizStarted) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz</h1>
          <p className="text-gray-400 text-sm mt-1">
            Test your knowledge — AI will generate questions from your notes
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
            >
              <FaBrain className="text-white" size={28} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Start AI Quiz</h2>
            <p className="text-gray-400 text-sm mt-1">
              Select a subject and AI will generate questions from your notes
            </p>
          </div>

          {/* Subject Grid */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Select Subject <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedSubject === sub
                      ? 'text-white border-transparent shadow-md'
                      : 'border-gray-200 text-gray-600 hover:border-teal-300 bg-gray-50'
                  }`}
                  style={selectedSubject === sub
                    ? { background: 'linear-gradient(to right, #0f766e, #14b8a6)' }
                    : {}}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input — Optional */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Topic{' '}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Derivatives, Newton Laws... (blank = whole course)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-teal-400 transition-all"
            />

            {/* Helper Text */}
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MdNote size={12} />
                If topic is entered, questions will be generated from that topic's notes
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MdNote size={12} />
                If no topic is entered, questions will use all notes for the subject
              </p>
            </div>
          </div>

          {/* Error */}
          {genError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {genError}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            disabled={!selectedSubject || generating}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI is generating questions from your notes...
              </span>
            ) : (
              '🧠 Generate Quiz From My Notes'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── Quiz Screen ───────────────────────────────────────────────────────────
  const currentQuestion = quizData[currentIndex]

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz</h1>
          <p className="text-gray-400 text-sm mt-1">
            {notesUsed > 0
              ? `${notesUsed} questions generated from your notes`
              : 'Questions generated from general knowledge'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl">
          <FaBrain className="text-teal-500" />
          <span className="text-sm font-semibold text-teal-600">
            Score: {score}/{quizData.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Question {currentIndex + 1} of {quizData.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #0f766e, #14b8a6)',
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto w-full">

        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
            {selectedSubject}
          </span>
          {topic && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
              {topic}
            </span>
          )}
          {notesUsed > 0 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
              📝 From Your Notes
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 flex items-center justify-between ${getOptionStyle(index)}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
              {isAnswered && index === currentQuestion.correct && (
                <MdCheckCircle className="text-green-500 flex-shrink-0" size={22} />
              )}
              {isAnswered && index === selectedOption && index !== currentQuestion.correct && (
                <MdCancel className="text-red-400 flex-shrink-0" size={22} />
              )}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
            selectedOption === currentQuestion.correct
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-red-50 text-red-500 border border-red-200'
          }`}>
            {selectedOption === currentQuestion.correct
              ? '✅ Correct! Well done.'
              : `❌ Wrong! Correct answer: ${currentQuestion.options[currentQuestion.correct]}`
            }
          </div>
        )}

        {isAnswered && (
          <button
            onClick={handleNext}
            disabled={submitting}
            className="mt-6 flex items-center gap-2 ml-auto px-6 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md disabled:opacity-60"
            style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {currentIndex + 1 >= quizData.length ? 'See Results' : 'Next Question'}
                <MdArrowForward size={18} />
              </>
            )}
          </button>
        )}
      </div>

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

export default Quiz
