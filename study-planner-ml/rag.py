# study-planner-ml/rag.py

from sentence_transformers import SentenceTransformer
import chromadb

# Downloads ~90MB model on first run only, then cached
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Creates a local ./chroma_db folder to store vectors
chroma = chromadb.PersistentClient(path="./chroma_db")
collection = chroma.get_or_create_collection("student_notes")


def add_note(note_id: str, user_id: str, text: str):
    """Store or update a note's vector. Called every time a note is saved."""
    if not text or not text.strip():
        return
    embedding = embedder.encode(text).tolist()
    collection.upsert(
        ids=[note_id],
        embeddings=[embedding],
        documents=[text],
        metadatas=[{"user_id": user_id}]
    )


def get_context(user_id: str, question: str, top_k: int = 3) -> str:
    """Find the most relevant notes for a question. Returns plain text."""
    total = collection.count()
    if total == 0:
        return ""

    results = collection.query(
        query_embeddings=[embedder.encode(question).tolist()],
        n_results=min(top_k, total),
        where={"user_id": user_id}
    )

    chunks = results["documents"][0]
    if not chunks:
        return ""

    return "\n\n---\n\n".join(chunks)

def get_notes_by_subject(user_id: str, subject: str, topic: str = None) -> str:
    """Fetch notes filtered by subject and optional topic."""
    total = collection.count()
    if total == 0:
        return ""

    query = topic if topic else subject

    results = collection.query(
        query_embeddings=[embedder.encode(query).tolist()],
        n_results=min(5, total),
        where={"user_id": user_id}
    )

    chunks = results["documents"][0]
    return "\n\n".join(chunks) if chunks else ""