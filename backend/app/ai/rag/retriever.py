"""
RAG retriever — formats retrieved chunks into a context string for the LLM.
"""
from typing import List
from app.ai.rag.vector_store import search
from app.utils.logger import get_logger

log = get_logger(__name__)


def retrieve_context(query: str, category: str = "", top_k: int = 4) -> str:
    """Retrieve relevant repair knowledge and format as a prompt context block."""
    docs = search(query, category=category, top_k=top_k)
    if not docs:
        return ""
    lines = ["Relevant repair knowledge from knowledge base:"]
    for i, doc in enumerate(docs, 1):
        lines.append(f"  [{i}] {doc}")
    context = "\n".join(lines)
    log.debug(f"RAG retrieved {len(docs)} chunks for query: {query[:60]}")
    return context
