import { useState } from 'react'
import { MdCheckCircle, MdCancel, MdArrowForward, MdRefresh } from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'
import api from '../../services/api'

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Computer Science']

// ── Result Card ──
const ResultCard = ({ score, total, subject, onRetry }) => {
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
        </p>
        <p className="text-gray-400 text-sm mb-6">
          AI has updated your weak subject analysis based on this quiz.
        </p>

        {/* Score Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-500 mb-3">QUIZ SUMMARY</p>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Subject</span>
            <span className="text-sm font-bold text-gray-800">{subject}</span>
          </div>
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

        {/* Retry Button */}
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
  // ── Setup State ───────────────────────────────────────────────────────────
  const [selectedSubject, setSelectedSubject] = useState('')
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizData, setQuizData] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // ── Quiz State ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Generate Questions from Claude API ────────────────────────────────────
  const handleStartQuiz = async () => {
  if (!selectedSubject) return alert('Pehle subject select karo!')
  setGenerating(true)
  setGenError('')

  try {
    const res = await api.post('/api/ai/quiz', {
      subject: selectedSubject,
    })
    setQuizData(res.data.questions)
    setQuizStarted(true)
  } catch (err) {
    setGenError('Questions generate nahi hue — please retry')
  } finally {
    setGenerating(false)
  }
}

  // ── Option Click ──────────────────────────────────────────────────────────
  const handleOptionClick = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    if (index === quizData[currentIndex].correct) {
      setScore(prev => prev + 1)
    }
  }

  // ── Next Question ─────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (currentIndex + 1 >= quizData.length) {
      // Quiz khatam — score save karo
      await handleSaveScore()
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    }
  }

  // ── Save Score to Backend ─────────────────────────────────────────────────
  const handleSaveScore = async () => {
    setSubmitting(true)
    try {
      await api.post('/api/quiz/attempt', {
        subject: selectedSubject,
        score: score,
        totalQuestions: quizData.length,
      })
    } catch (err) {
      console.error('Score save nahi hua:', err)
      // Error hone par bhi result dikhao — quiz complete tha
    } finally {
      setSubmitting(false)
      setIsFinished(true)
    }
  }

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    setSelectedSubject('')
    setQuizStarted(false)
    setQuizData([])
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setIsFinished(false)
    setGenError('')
  }

  // ── Option Styling ────────────────────────────────────────────────────────
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

  // ── Show Result ───────────────────────────────────────────────────────────
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
          onRetry={handleRetry}
        />
      </div>
    )
  }

  // ── Show Setup Screen ─────────────────────────────────────────────────────
  if (!quizStarted) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz</h1>
          <p className="text-gray-400 text-sm mt-1">
            Test your knowledge — AI will update your plan
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
              Subject select karo — AI 5 questions generate karega
            </p>
          </div>

          {/* Subject Select */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Select Subject
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
                AI Questions Generate Ho Rahe Hain...
              </span>
            ) : (
              '🧠 Generate & Start Quiz'
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── Show Quiz ─────────────────────────────────────────────────────────────
  const currentQuestion = quizData[currentIndex]

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz</h1>
          <p className="text-gray-400 text-sm mt-1">
            Test your knowledge — AI will update your plan
          </p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl">
          <FaBrain className="text-teal-500" />
          <span className="text-sm font-semibold text-teal-600">
            Score: {score}/{quizData.length}
          </span>
        </div>
      </div>

      {/* ── Progress Bar ── */}
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

      {/* ── Question Card ── */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto w-full">

        {/* Subject Badge */}
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
          {selectedSubject}
        </span>

        {/* Question */}
        <h2 className="text-xl font-bold text-gray-800 mt-4 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options */}
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

        {/* Explanation */}
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

        {/* Next Button */}
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
    </div>
  )
}

export default Quiz