"""
Static danger rule table.
Maps keywords/patterns → auto-inject warning messages.
Used as a fast pre-filter before LLM reasoning.
"""
from typing import Optional

DANGER_RULES = [
    {
        "keywords": ["fuel leak", "petrol leak", "gas leak", "diesel leak", "fuel smell"],
        "severity": "High",
        "warning": "⚠️ FUEL LEAK DETECTED — Do NOT start the vehicle. Keep away from ignition sources. Evacuate the area and call emergency services if indoors.",
    },
    {
        "keywords": ["smoke", "burning smell", "sparks", "fire", "flames"],
        "severity": "High",
        "warning": "⚠️ FIRE/SMOKE HAZARD — Disconnect power immediately. Do not use water on electrical fires. Use a CO2 or dry-powder extinguisher.",
    },
    {
        "keywords": ["high voltage", "240v", "mains", "live wire", "electrical shock"],
        "severity": "High",
        "warning": "⚠️ ELECTRICAL DANGER — Do NOT touch. Isolate the mains supply before any inspection. Call a licensed electrician.",
    },
    {
        "keywords": ["asbestos", "insulation crumble", "old pipe wrap"],
        "severity": "High",
        "warning": "⚠️ POTENTIAL ASBESTOS — Do not disturb. Contact a certified asbestos removal specialist.",
    },
    {
        "keywords": ["brake fluid", "brake line", "brake fail"],
        "severity": "High",
        "warning": "⚠️ BRAKE SYSTEM — Do NOT drive the vehicle. Brake failure is life-threatening. Tow to a certified mechanic.",
    },
    {
        "keywords": ["coolant leak", "overheating", "temperature warning"],
        "severity": "Medium",
        "warning": "⚠️ OVERHEATING RISK — Do not open the radiator cap while hot. Allow the engine to cool completely (30+ min) before inspection.",
    },
    {
        "keywords": ["battery acid", "swollen battery", "battery leak"],
        "severity": "Medium",
        "warning": "⚠️ BATTERY HAZARD — Wear gloves and eye protection. Battery acid causes severe burns.",
    },
]


def check_danger_rules(text: str) -> Optional[dict]:
    """Return the first matching danger rule for the given text, or None."""
    text_lower = text.lower()
    for rule in DANGER_RULES:
        if any(kw in text_lower for kw in rule["keywords"]):
            return rule
    return None
