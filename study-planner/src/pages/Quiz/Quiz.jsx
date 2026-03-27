import { useState } from 'react'
import { MdCheckCircle, MdCancel, MdArrowForward, MdRefresh } from 'react-icons/md'
import { FaBrain } from 'react-icons/fa'

// ── Dummy Questions (baad mein backend se aayenge) ──
const quizData = [
  {
    subject: 'Mathematics',
    question: 'What is the derivative of x²?',
    options: ['x', '2x', 'x²', '2'],
    correct: 1,
  },
  {
    subject: 'Physics',
    question: "Newton's second law of motion states that F = ?",
    options: ['mv', 'ma', 'mgh', 'mc²'],
    correct: 1,
  },
  {
    subject: 'Chemistry',
    question: 'What is the atomic number of Carbon?',
    options: ['6', '8', '12', '14'],
    correct: 0,
  },
  {
    subject: 'Mathematics',
    question: 'What is the value of sin(90°)?',
    options: ['0', '0.5', '1', '-1'],
    correct: 2,
  },
  {
    subject: 'Physics',
    question: 'What is the unit of electric current?',
    options: ['Volt', 'Watt', 'Ampere', 'Ohm'],
    correct: 2,
  },
]

// ── Result Card ──
const ResultCard = ({ score, total, onRetry }) => {
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
        <p className="text-gray-400 text-sm mb-6">
          AI has updated your weak subject analysis based on this quiz.
        </p>

        {/* Subject Breakdown */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-gray-500 mb-3">SUBJECT BREAKDOWN</p>
          {['Mathematics', 'Physics', 'Chemistry'].map((sub, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-600">{sub}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                i === 0 ? 'bg-green-100 text-green-600' :
                i === 1 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-500'
              }`}>
                {i === 0 ? 'Strong' : i === 1 ? 'Average' : 'Weak'}
              </span>
            </div>
          ))}
        </div>

        {/* AI Tip */}
        <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-600 mb-6">
          💡 AI Tip: Focus on Chemistry — it needs the most attention this week
        </div>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="flex items-center gap-2 mx-auto px-8 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md"
          style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
        >
          <MdRefresh size={18} />
          Retry Quiz
        </button>
      </div>
    </div>
  )
}

// ── Main Quiz Component ──
const Quiz = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  const currentQuestion = quizData[currentIndex]
  const progress = ((currentIndex) / quizData.length) * 100

  const handleOptionClick = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    if (index === currentQuestion.correct) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 >= quizData.length) {
      setIsFinished(true)
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setIsFinished(false)
  }

  const getOptionStyle = (index) => {
    if (!isAnswered) {
      return selectedOption === index
        ? 'border-teal-400 bg-teal-50'
        : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/50'
    }
    if (index === currentQuestion.correct) return 'border-green-400 bg-green-50'
    if (index === selectedOption) return 'border-red-400 bg-red-50'
    return 'border-gray-200 bg-gray-50 opacity-50'
  }

  // ── Show Result ──
  if (isFinished) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz Results</h1>
          <p className="text-gray-400 text-sm mt-1">AI is analyzing your performance</p>
        </div>
        <ResultCard score={score} total={quizData.length} onRetry={handleRetry} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quiz</h1>
          <p className="text-gray-400 text-sm mt-1">Test your knowledge — AI will update your plan</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl">
          <FaBrain className="text-teal-500" />
          <span className="text-sm font-semibold text-teal-600">Score: {score}/{quizData.length}</span>
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
          {currentQuestion.subject}
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
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>

              {/* Right icon after answer */}
              {isAnswered && index === currentQuestion.correct && (
                <MdCheckCircle className="text-green-500" size={22} />
              )}
              {isAnswered && index === selectedOption && index !== currentQuestion.correct && (
                <MdCancel className="text-red-400" size={22} />
              )}
            </button>
          ))}
        </div>

        {/* Explanation after answer */}
        {isAnswered && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
            selectedOption === currentQuestion.correct
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-red-50 text-red-500 border border-red-200'
          }`}>
            {selectedOption === currentQuestion.correct
              ? '✅ Correct! Well done.'
              : `❌ Wrong! Correct answer was: ${currentQuestion.options[currentQuestion.correct]}`}
          </div>
        )}

        {/* Next Button */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="mt-6 flex items-center gap-2 ml-auto px-6 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-105 shadow-md"
            style={{ background: 'linear-gradient(to right, #0f766e, #14b8a6)' }}
          >
            {currentIndex + 1 >= quizData.length ? 'See Results' : 'Next Question'}
            <MdArrowForward size={18} />
          </button>
        )}
      </div>
    </div>
  )
}

export default Quiz