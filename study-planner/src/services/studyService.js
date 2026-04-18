import { ML_API } from "./api";

export const indexNote = async (noteId, userId, text) => {
  try {
    await fetch(`${ML_API}/api/notes/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note_id: noteId, user_id: userId, text })
    });
  } catch (err) {
    console.warn("RAG indexing skipped:", err.message);
  }
};
export const generateQuizFromNotes = async (userId, subject, topic = null, numQuestions = 5) => {
  try {
    const res = await fetch(`${ML_API}/api/quiz/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        subject,
        topic,
        num_questions: numQuestions
      })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Quiz generation failed:", err.message);
    return { questions: [], notesUsed: 0, error: err.message };
  }
};
export const getRAGContext = async (userId, question) => {
  try {
    const res = await fetch(`${ML_API}/api/chat/context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, question })
    });
    const data = await res.json();
    return data.context || "";
  } catch (err) {
    console.warn("RAG context failed:", err.message);
    return "";
  }
};
export const getStudySchedule = async (userId) => {
  try {
    const res = await fetch(`${ML_API}/api/planner/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    return data.schedule || [];
  } catch (err) {
    console.warn("Schedule fetch failed:", err.message);
    return [];
  }
};
export const getCourseRecommendations = async (userId) => {
  try {
    const res = await fetch(`${ML_API}/api/courses/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    console.log("Full API response:", data)   // ← ADD THIS
    return data.recommendations || [];
  } catch (err) {
    console.warn("Recommendations failed:", err.message);
    return [];
  }

};