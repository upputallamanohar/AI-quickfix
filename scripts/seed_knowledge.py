"""
Seed the RAG vector store with additional repair knowledge.
Run: python scripts/seed_knowledge.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.ai.rag.vector_store import add_document, seed_knowledge_base

EXTRA_DOCS = [
    ("auto_timing_belt", "Timing belt failure causes engine misfires or complete failure. Replace every 60,000–100,000 miles. Signs: ticking noise, engine won't start.", "Automobile"),
    ("auto_alternator", "Alternator failure causes battery warning light, dim lights, electrical issues. Test with multimeter: should read 13.5–14.5V at idle.", "Automobile"),
    ("auto_transmission", "Slipping transmission: check fluid level and color. Dark or burnt fluid needs full service. Shuddering at highway speed may indicate torque converter.", "Automobile"),
    ("elec_motherboard", "Motherboard POST failure: check RAM seating, CMOS battery, CPU cooler contact. Listen for beep codes — they encode the fault.", "Computer / Hardware"),
    ("elec_gpu", "GPU artifacts or crashes: reseat card, clean PCIe slot, check power connectors. Test with GPU-Z under load. Thermal paste may need replacing.", "Computer / Hardware"),
    ("home_hvac", "HVAC not cooling: check thermostat settings, replace dirty filter, clear condensate drain. Low refrigerant requires professional recharge.", "Home Appliance"),
    ("home_dishwasher", "Dishwasher not draining: clean filter basket, check drain hose kink, test drain pump. Error codes point to specific part failures.", "Home Appliance"),
    ("plumb_water_heater", "Water heater not heating: check pilot light (gas) or heating element continuity (electric). Anode rod replacement extends tank life.", "Plumbing"),
    ("net_wifi", "Poor WiFi: check 2.4GHz vs 5GHz band selection, update firmware, change channel to avoid interference. Factory reset if config is corrupted.", "Networking Device"),
    ("industrial_motor", "Electric motor not starting: check supply voltage, test capacitor, inspect brushes and commutator. Burning smell = winding failure.", "Industrial Machinery"),
]

if __name__ == "__main__":
    seed_knowledge_base()
    for doc_id, text, category in EXTRA_DOCS:
        add_document(doc_id, text, category)
        print(f"  Seeded: {doc_id}")
    print(f"Done — {len(EXTRA_DOCS)} extra documents added.")
