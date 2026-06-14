"""
Severity classifier — maps AI diagnosis + danger rules to a severity level.
Provides an override if the static rules catch something the LLM missed.
"""
from typing import Optional
from app.ai.safety.danger_rules import check_danger_rules


def classify_severity(
    issue: Optional[str],
    warning: Optional[str],
    llm_severity: Optional[str],
    description: str = "",
) -> str:
    """Return the final severity, bumping it up if safety rules demand it."""
    combined = " ".join(filter(None, [issue, warning, description]))
    rule = check_danger_rules(combined)
    if rule:
        rule_sev = rule["severity"]
        # Always take the higher of LLM vs rule
        order = {"Low": 1, "Medium": 2, "High": 3}
        llm_rank = order.get(llm_severity or "Low", 1)
        rule_rank = order.get(rule_sev, 1)
        return rule_sev if rule_rank >= llm_rank else (llm_severity or "Low")
    return llm_severity or "Low"


def get_severity_color(severity: str) -> str:
    return {"Low": "#22c55e", "Medium": "#eab308", "High": "#ef4444"}.get(severity, "#6b7280")


def is_dangerous(severity: str) -> bool:
    return severity == "High"
