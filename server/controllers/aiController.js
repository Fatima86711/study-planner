const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── QUIZ QUESTIONS GENERATE ──────────────────────────────────────────────────
// Route:  POST /api/ai/quiz
// Access: Private
const generateQuiz = async (req, res) => {
  try {
    const { subject } = req.body

    if (!subject) {
      return res.status(400).json({ message: 'Subject required' })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      system: `You are a quiz generator. Always respond with valid JSON only. No extra text, no markdown.`,
      messages: [
        {
          role: 'user',
          content: `Generate 5 multiple choice questions for subject: ${subject}.
          
          Respond ONLY with this JSON format:
          [
            {
              "question": "question text here",
              "options": ["option A", "option B", "option C", "option D"],
              "correct": 0
            }
          ]
          
          "correct" is the index (0-3) of the correct option.
          Make questions medium difficulty — suitable for high school / college level.`
        }
      ]
    })

    const text = message.content[0].text
    const questions = JSON.parse(text)

    res.status(200).json({ success: true, questions })

  } catch (error) {
    res.status(500).json({ message: 'Quiz generate nahi hua', error: error.message })
  }
}

// ─── STUDY PLAN GENERATE ──────────────────────────────────────────────────────
// Route:  POST /api/ai/plan
// Access: Private
const generatePlan = async (req, res) => {
  try {
    const { subject, days, hours } = req.body

    if (!subject || !days || !hours) {
      return res.status(400).json({ message: 'Subject, days aur hours required hain' })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      system: `You are a study plan assistant. Always respond with valid JSON only. No extra text.`,
      messages: [
        {
          role: 'user',
          content: `Create a study plan for subject: ${subject}, duration: ${days} days, daily hours: ${hours} hours.
          
          Respond ONLY with this JSON format:
          {
            "title": "plan title",
            "subject": "${subject}",
            "tasks": [
              { "description": "task description", "dueDate": "2025-04-01" },
              { "description": "task description", "dueDate": "2025-04-02" }
            ]
          }
          
          Generate ${days} tasks — one per day. Use today's date onwards for dueDates.`
        }
      ]
    })

    const text = message.content[0].text
    const plan = JSON.parse(text)

    res.status(200).json({ success: true, plan })

  } catch (error) {
    res.status(500).json({ message: 'Plan generate nahi hua', error: error.message })
  }
}

module.exports = { generateQuiz, generatePlan }