"""
Vector store using ChromaDB (local, no server needed).
Falls back to a simple in-memory list if chromadb is not installed.
"""
from typing import List, Dict
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

try:
    import chromadb
    from chromadb.utils import embedding_functions
    _client = chromadb.PersistentClient(path=settings.VECTOR_STORE_PATH)
    _ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=settings.EMBEDDING_MODEL
    )
    _collection = _client.get_or_create_collection(
        name="repair_knowledge", embedding_function=_ef
    )
    _CHROMA_AVAILABLE = True
    log.info("ChromaDB vector store initialised.")
except Exception as e:
    _CHROMA_AVAILABLE = False
    _collection = None
    log.warning(f"ChromaDB not available ({e}) — RAG disabled.")

# Seed data: built-in repair knowledge snippets
_SEED_DOCS = [
    {"id": "auto_oil_leak", "text": "Oil leaks in cars are often caused by worn gaskets, cracked seals, or loose drain plugs. Check the oil pan, valve cover, and timing cover.", "category": "Automobile"},
    {"id": "auto_battery", "text": "A clicking sound when starting usually indicates a dead or weak battery. Check terminals for corrosion. Jump-start or replace the battery.", "category": "Automobile"},
    {"id": "auto_brake", "text": "Squealing brakes indicate worn brake pads. Grinding means metal-on-metal contact — replace pads and inspect rotors immediately.", "category": "Automobile"},
    {"id": "elec_capacitor", "text": "Bulging or leaking capacitors on circuit boards cause erratic behaviour or complete failure. Replace with same-spec capacitor.", "category": "Electronics"},
    {"id": "elec_power", "text": "No power to electronics: check fuse, power supply voltage, and continuity of the main cable before inspecting the board.", "category": "Electronics"},
    {"id": "plumb_drip", "text": "A dripping tap is usually a worn washer or O-ring. Turn off the supply, disassemble the tap head, and replace the worn part.", "category": "Plumbing"},
    {"id": "plumb_blockage", "text": "Blocked drains can be cleared with a plunger, drain snake, or enzymatic cleaner. Avoid caustic soda on plastic pipes.", "category": "Plumbing"},
    {"id": "pc_no_post", "text": "PC that does not POST: reseat RAM, check CPU power connector, clear CMOS. Listen for diagnostic beep codes.", "category": "Computer / Hardware"},
    {"id": "pc_overheating", "text": "PC overheating: clean dust from heatsink and fans, reapply thermal paste, ensure adequate case airflow.", "category": "Computer / Hardware"},
    {"id": "appliance_washer", "text": "Washing machine not spinning: check door latch, drive belt, and motor coupling. Error codes point to specific faults.", "category": "Home Appliance"},
]


def seed_knowledge_base():
    if not _CHROMA_AVAILABLE or _collection is None:
        return
    existing = _collection.get()["ids"]
    new_docs = [d for d in _SEED_DOCS if d["id"] not in existing]
    if new_docs:
        _collection.add(
            ids=[d["id"] for d in new_docs],
            documents=[d["text"] for d in new_docs],
            metadatas=[{"category": d["category"]} for d in new_docs],
        )
        log.info(f"Seeded {len(new_docs)} documents into vector store.")


def add_document(doc_id: str, text: str, category: str = "General"):
    if not _CHROMA_AVAILABLE or _collection is None:
        return
    _collection.upsert(ids=[doc_id], documents=[text], metadatas=[{"category": category}])


def search(query: str, category: str = "", top_k: int = None) -> List[str]:
    if not _CHROMA_AVAILABLE or _collection is None:
        return []
    k = top_k or settings.RAG_TOP_K
    where = {"category": category} if category else None
    results = _collection.query(query_texts=[query], n_results=k, where=where)
    docs = results.get("documents", [[]])[0]
    return docs
