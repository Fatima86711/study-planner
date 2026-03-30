const Groq = require('groq-sdk')
const Note = require('../models/Note')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// ─── QUIZ QUESTIONS GENERATE — NOTES SE ──────────────────────────────────────
const generateQuiz = async (req, res) => {
  try {
    const { subject, topic } = req.body

    if (!subject) {
      return res.status(400).json({ message: 'Subject required hai' })
    }

    // ── Notes fetch karo ──────────────────────────────────────────────────
    const notes = await Note.find({
      user: req.user._id,
      subject: subject,
    })

    let prompt = ''

    if (notes.length > 0) {

      if (topic && topic.trim()) {
        // ── Topic diya hai — us topic wale notes filter karo ────────────
        // Pehle topic se matching notes dhundo
        const topicNotes = notes.filter(note =>
          note.title.toLowerCase().includes(topic.toLowerCase()) ||
          note.content.toLowerCase().includes(topic.toLowerCase())
        )

        const relevantNotes = topicNotes.length > 0 ? topicNotes : notes

        // Sirf pure content extract karo — koi labels nahi
        const pureContent = relevantNotes
          .map(note => note.content)
          .join('\n\n')

        prompt = `You are a quiz generator for students.

A student has written the following study notes about "${topic}" in ${subject}:

"""
${pureContent}
"""

Generate 5 multiple choice questions STRICTLY based on the concepts, facts, and information written in these notes above.

IMPORTANT RULES:
- Questions must test understanding of the SUBJECT MATTER in the notes
- Do NOT ask questions about the notes themselves (like "how many sections", "what does the title say")
- Do NOT ask meta questions about the structure of the notes
- Ask about Physics/Chemistry/Math/etc. concepts that appear in the notes
- If notes mention "F = ma", ask about force, mass, acceleration — not about the note itself

Respond ONLY with a valid JSON array — no extra text, no markdown backticks:
[
  {
    "question": "question about the subject content",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0
  }
]`

      } else {
        // ── Topic nahi diya — poore subject ke notes ka content use karo ─
        const pureContent = notes
          .map(note => note.content)
          .join('\n\n')

        prompt = `You are a quiz generator for students.

A student has written the following study notes for ${subject}:

"""
${pureContent}
"""

Generate 5 multiple choice questions STRICTLY based on the concepts, facts, and information written in these notes above.

IMPORTANT RULES:
- Questions must test understanding of the SUBJECT MATTER in the notes
- Do NOT ask questions about the notes themselves (like "how many sections", "what does the title say")
- Do NOT ask meta questions about the structure of the notes
- Ask about ${subject} concepts that appear in the notes
- Cover different topics from across all the notes

Respond ONLY with a valid JSON array — no extra text, no markdown backticks:
[
  {
    "question": "question about the subject content",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0
  }
]`
      }

    } else {
      // ── Koi notes nahi — general knowledge se ────────────────────────
      const topicLine = topic
        ? `Focus specifically on the topic: ${topic}`
        : `Cover important and commonly tested concepts`

      prompt = `You are a quiz generator for students.

The student has no saved notes for ${subject} yet.
Generate 5 multiple choice questions about ${subject}.
${topicLine}

Make questions suitable for high school or college level.
Test actual subject knowledge — formulas, concepts, definitions, laws.

Respond ONLY with a valid JSON array — no extra text, no markdown backticks:
[
  {
    "question": "question about ${subject}",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0
  }
]`
    }

    // ── Groq API Call ─────────────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a strict quiz generator. You ONLY generate questions about subject matter content. You NEVER ask questions about the structure or format of notes. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt,
        }
      ],
      temperature: 0.5,   // ← Kam temperature — zyada focused responses
      max_tokens: 1500,
    })

    let text = completion.choices[0].message.content

    // ── Safe JSON Parse ───────────────────────────────────────────────────
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()

    const questions = JSON.parse(text)

    res.status(200).json({
      success: true,
      questions,
      notesUsed: notes.length,
      fromNotes: notes.length > 0,
    })

  } catch (error) {
    console.error('Quiz generation error:', error.message)
    res.status(500).json({
      message: 'Quiz generate nahi hua',
      error: error.message
    })
  }
}

// ─── STUDY PLAN GENERATE ──────────────────────────────────────────────────────
const generatePlan = async (req, res) => {
  try {
    const { subject, days, hours } = req.body

    if (!subject || !days || !hours) {
      return res.status(400).json({ message: 'Subject, days aur hours required hain' })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Create a study plan for subject: ${subject}, duration: ${days} days, daily hours: ${hours} hours.
          
          Respond ONLY with this JSON format — no extra text, no markdown:
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
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    let text = completion.choices[0].message.content
    text = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const plan = JSON.parse(text)

    res.status(200).json({ success: true, plan })

  } catch (error) {
    console.error('Plan generation error:', error.message)
    res.status(500).json({
      message: 'Plan generate nahi hua',
      error: error.message
    })
  }
}

module.exports = { generateQuiz, generatePlan }