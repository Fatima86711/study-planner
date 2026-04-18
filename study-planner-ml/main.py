from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from groq import Groq
from bson import ObjectId
from dotenv import load_dotenv
from rag import add_note, get_context, get_notes_by_subject

import os, json, re, math
from collections import defaultdict
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Helper ────────────────────────────────────────────────────────────────────
def to_object_id(uid):
    try:
        return ObjectId(uid)
    except:
        return uid


# ── Request Models ────────────────────────────────────────────────────────────
class NoteIn(BaseModel):
    note_id: str
    user_id: str
    text: str

class ContextIn(BaseModel):
    user_id: str
    question: str

class QuizRequest(BaseModel):
    user_id: str
    subject: str
    topic: str = None
    num_questions: int = 5

class SpacedRepRequest(BaseModel):
    user_id: str

class RecommendRequest(BaseModel):
    user_id: str


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok"}


# ── RAG: Index Note ───────────────────────────────────────────────────────────
@app.post("/api/notes/index")
def index_note(body: NoteIn):
    add_note(body.note_id, body.user_id, body.text)
    return {"status": "indexed"}


# ── RAG: Get Chat Context ─────────────────────────────────────────────────────
@app.post("/api/chat/context")
def chat_context(body: ContextIn):
    context = get_context(body.user_id, body.question)
    return {"context": context}


# ── Quiz: Generate from Notes ─────────────────────────────────────────────────
@app.post("/api/quiz/generate")
def generate_quiz(body: QuizRequest):
    notes_text = get_notes_by_subject(body.user_id, body.subject, body.topic)

    if not notes_text:
        return {"questions": [], "notesUsed": 0, "error": "No notes found for this subject"}

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""You are a quiz generator. Based on the study notes below, generate exactly {body.num_questions} multiple choice questions.

SUBJECT: {body.subject}
{f'TOPIC: {body.topic}' if body.topic else ''}

STUDENT NOTES:
{notes_text}

Return ONLY a JSON array, no explanation, no markdown. Format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }}
]

Rules:
- "correct" is the index (0-3) of the correct option
- Make distractors plausible but clearly wrong
- Base questions directly on the notes above
- Return exactly {body.num_questions} questions"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.choices[0].message.content.strip()

    try:
        raw = re.sub(r"```json|```", "", raw).strip()
        questions = json.loads(raw)
        return {"questions": questions, "notesUsed": len(questions)}
    except Exception as e:
        return {"questions": [], "notesUsed": 0, "error": f"Parse error: {str(e)}"}


# ── Planner: Spaced Repetition Schedule ──────────────────────────────────────
@app.post("/api/planner/schedule")
def get_schedule(body: SpacedRepRequest):
    client = MongoClient(os.getenv("MONGO_URI"))
    db = client["test"]

    user_oid = to_object_id(body.user_id)

    quiz_data = list(db.quizattempts.find(
        {"user": user_oid},
        {"subject": 1, "percentage": 1, "date": 1, "_id": 0}
    ))
    study_data = list(db.timelogs.find(
        {"user": user_oid},
        {"subject": 1, "topic": 1, "duration": 1, "date": 1, "_id": 0}
    ))

    if not quiz_data and not study_data:
        return {"schedule": [], "message": "No data yet — complete quizzes and log study sessions first"}

    subject_scores = {}
    for q in quiz_data:
        subj = q.get("subject", "Unknown")
        if subj not in subject_scores:
            subject_scores[subj] = []
        subject_scores[subj].append({
            "score": q.get("percentage", 0),
            "date": q.get("date", datetime.utcnow())
        })

    schedule = []
    now = datetime.utcnow()

    for subject, attempts in subject_scores.items():
        attempts.sort(key=lambda x: x["date"])
        latest = attempts[-1]
        avg_score = sum(a["score"] for a in attempts) / len(attempts)

        if avg_score >= 80:
            stability_days = 7
        elif avg_score >= 60:
            stability_days = 3
        else:
            stability_days = 1

        last_studied = latest["date"]
        if isinstance(last_studied, str):
            last_studied = datetime.fromisoformat(last_studied)

        hours_elapsed = (now - last_studied).total_seconds() / 3600
        recall = round(math.exp(-hours_elapsed / (stability_days * 24)), 2)
        review_at = last_studied + timedelta(days=stability_days)

        if review_at < now:
            urgency = "overdue"
        elif recall < 0.5:
            urgency = "high"
        elif recall < 0.75:
            urgency = "medium"
        else:
            urgency = "low"

        total_minutes = sum(
            s.get("duration", 0) for s in study_data
            if s.get("subject") == subject
        )

        schedule.append({
            "subject": subject,
            "avg_score": round(avg_score, 1),
            "recall_probability": recall,
            "urgency": urgency,
            "review_at": review_at.isoformat(),
            "review_in_days": max(0, (review_at - now).days),
            "total_study_minutes": total_minutes,
            "attempts": len(attempts),
            "last_score": latest["score"]
        })

    urgency_order = {"overdue": 0, "high": 1, "medium": 2, "low": 3}
    schedule.sort(key=lambda x: (urgency_order[x["urgency"]], x["recall_probability"]))

    return {"schedule": schedule}


# ── Courses: AI Recommendations ───────────────────────────────────────────────
@app.post("/api/courses/recommend")
def recommend_courses(body: RecommendRequest):
    client_mongo = MongoClient(os.getenv("MONGO_URI"))
    db = client_mongo["test"]

    user_oid = to_object_id(body.user_id)

    quiz_data = list(db.quizattempts.find(
        {"user": user_oid},
        {"subject": 1, "percentage": 1, "_id": 0}
    ))
    study_data = list(db.timelogs.find(
        {"user": user_oid},
        {"subject": 1, "topic": 1, "duration": 1, "_id": 0}
    ))
    enrolled = list(db.courses.find(
        {"user": user_oid},
        {"name": 1, "subject": 1, "_id": 0}
    ))

    if not quiz_data and not study_data:
        return {
            "recommendations": [],
            "message": "Complete some quizzes and log study sessions first"
        }

    subject_scores = defaultdict(list)
    for q in quiz_data:
        subject_scores[q["subject"]].append(q["percentage"])

    subject_summary = {
        subj: {
            "avg": round(sum(s) / len(s), 1),
            "attempts": len(s),
            "best": max(s)
        }
        for subj, s in subject_scores.items()
    }

    subject_time = defaultdict(int)
    topics_studied = []
    for s in study_data:
        subject_time[s["subject"]] += s.get("duration", 0)
        if s.get("topic"):
            topics_studied.append(s["topic"])

    enrolled_names = [c["name"] for c in enrolled]

    profile_text = f"""
STUDENT QUIZ PERFORMANCE:
{json.dumps(subject_summary, indent=2)}

STUDY TIME (minutes per subject):
{json.dumps(dict(subject_time), indent=2)}

TOPICS STUDIED:
{', '.join(topics_studied[:20]) if topics_studied else 'None logged yet'}

ALREADY ENROLLED IN:
{', '.join(enrolled_names) if enrolled_names else 'No courses yet'}
"""

    prompt = f"""You are an intelligent course recommendation engine for a student learning platform.

Based on this student's profile, recommend exactly 6 online courses that would genuinely help them.

{profile_text}

Rules:
- Do NOT recommend courses they are already enrolled in
- Mix: recommend courses to strengthen weak subjects AND advance strong ones
- Use real, well-known platforms: Coursera, Udemy, edX, Khan Academy, YouTube, freeCodeCamp
- Each course must have a real, working URL
- Keep reasons short and personalized (max 12 words)
- Vary difficulty: include Beginner, Intermediate, Advanced

Return ONLY a JSON array, no explanation, no markdown:
[
  {{
    "id": "r001",
    "name": "Exact Course Name",
    "subject": "Subject Category",
    "level": "Beginner|Intermediate|Advanced",
    "platform": "Coursera",
    "url": "https://actual-url.com",
    "reason": "Short personalized reason based on their data",
    "score": 85
  }}
]"""

    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = response.choices[0].message.content.strip()

    try:
        raw = re.sub(r"```json|```", "", raw).strip()
        json_match = re.search(r"\[[\s\S]*\]", raw)
        if not json_match:
            return {"recommendations": [], "error": "AI returned invalid format"}

        recommendations = json.loads(json_match.group())
        return {
            "recommendations": recommendations,
            "profile": {
                "subjects_studied": list(subject_summary.keys()),
                "total_quiz_attempts": len(quiz_data),
                "total_study_sessions": len(study_data)
            }
        }
    except Exception as e:
        return {"recommendations": [], "error": f"Parse error: {str(e)}"}