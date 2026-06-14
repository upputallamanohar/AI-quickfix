"""
Follow-up question generator.
Augments or replaces LLM-generated follow-ups with context-aware suggestions.
"""
from typing import List, Optional

CATEGORY_FOLLOWUPS = {
    "Automobile": [
        "Is the check engine light on?",
        "When did you last service the vehicle?",
        "What sounds do you hear when starting?",
    ],
    "Electronics": [
        "Has the device been exposed to moisture?",
        "What error code or message is displayed?",
        "When did the issue first appear?",
    ],
    "Plumbing": [
        "Is the water supply shut off?",
        "Is the leak constant or intermittent?",
        "What material are the pipes made of?",
    ],
    "Computer / Hardware": [
        "What operating system are you running?",
        "Have you installed any new hardware recently?",
        "What diagnostic LEDs or beep codes do you see/hear?",
    ],
}

DEFAULT_FOLLOWUPS = [
    "Can you describe the issue in more detail?",
    "How long has this problem been occurring?",
]


def get_followups(category: str, llm_followups: List[str], max_count: int = 3) -> List[str]:
    """Merge LLM follow-ups with category-specific ones, deduplicated."""
    category_list = CATEGORY_FOLLOWUPS.get(category, DEFAULT_FOLLOWUPS)
    merged = list(llm_followups)
    for q in category_list:
        if q not in merged:
            merged.append(q)
    return merged[:max_count]
