"""
Instruction generator — post-processes raw LLM output into
structured, skill-level-appropriate repair steps.
"""
from typing import List

SKILL_PREFIXES = {
    "beginner": "👉 ",
    "intermediate": "",
    "advanced": "",
}

BEGINNER_TIPS = {
    "turn off": "Make sure the device is completely powered off before proceeding.",
    "unscrew": "Use the correct screwdriver size — the tip should fit snugly in the screw head.",
    "disconnect": "Always disconnect the power source before touching any wiring.",
}


def enrich_steps(steps: List[str], skill_level: str) -> List[str]:
    """Add skill-appropriate cues and tips to each step."""
    prefix = SKILL_PREFIXES.get(skill_level, "")
    enriched = []
    for step in steps:
        text = prefix + step
        if skill_level == "beginner":
            for keyword, tip in BEGINNER_TIPS.items():
                if keyword in step.lower() and tip not in text:
                    text += f" ({tip})"
                    break
        enriched.append(text)
    return enriched


def add_safety_step(steps: List[str], warning: str | None) -> List[str]:
    """Prepend a safety step when a warning is present."""
    if warning:
        safety = f"⚠️ Safety first: {warning}"
        return [safety] + steps
    return steps


def format_tools(tools: List[str]) -> List[str]:
    """Deduplicate and title-case tools list."""
    seen = set()
    result = []
    for t in tools:
        key = t.lower().strip()
        if key not in seen:
            seen.add(key)
            result.append(t.strip().title())
    return result
