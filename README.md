🔧 AI Quick Fix — Visual Repair Intelligence

Ever stared at a broken appliance, leaking pipe, or smoking engine and had absolutely no idea what to do next? **AI Quick Fix** solves that.

Upload a photo. Get a diagnosis. Fix it.

 What Is This?

AI Quick Fix is a full-stack AI assistant that looks at images of broken or malfunctioning devices and tells you exactly what's wrong — and how to fix it. It uses Google Gemini's multimodal vision model to analyze what it sees, assess how dangerous the situation is, and walk you through a repair step by step.

It's not just an image classifier. It holds a conversation. It talks back. It warns you when something is actually dangerous. And it adapts its instructions based on whether you're a beginner or someone who knows their way around a toolbox.

 Who Is It For?

- Someone whose car is making a weird noise and doesn't know a mechanic
- A homeowner dealing with a leaking pipe at midnight
- A technician who wants a second opinion on a circuit board
- Anyone who's ever googled "why is my washing machine doing this" and got nowhere

---

What It Can Diagnose

| Device | Examples |
|--------|---------|
| 🚗 Automobile | Engine smoke, oil leaks, flat tyres, battery issues |
| 🏍️ Motorcycle | Chain problems, brake wear, exhaust faults |
| 📱 Electronics | Burnt PCBs, cracked screens, blown capacitors |
| 🏠 Home Appliance | Washing machine faults, HVAC failures, oven issues |
| 🚰 Plumbing | Pipe leaks, blocked drains, tap faults |
| 📡 Networking | Router failures, switch damage, cable faults |
| ⚙️ Industrial | Motor burnout, compressor issues, belt wear |
| 💻 Computer Hardware | GPU damage, overheating, RAM faults |

---

Core Features

**Visual Diagnosis**
Drop in a photo or extract frames from a video. The AI examines the image, identifies the fault, names the affected component, and tells you how serious it is.

**Severity & Safety System**
Every diagnosis comes with a severity rating — Low, Medium, or High. If something is genuinely dangerous (live wires, pressurized systems, overheating engines), the AI flags it with a clear warning before anything else.

**Step-by-Step Repair Instructions**
Not generic advice. Actual numbered steps tailored to what the AI saw in your image and your stated skill level — beginner, intermediate, or advanced.

**Conversational Follow-Up**
After the diagnosis, you can keep talking. Ask follow-up questions, describe new symptoms, request clarification. The AI remembers the context of the conversation.

**Voice In, Voice Out**
Speak your question instead of typing. The AI reads safety warnings and guidance aloud. Useful when your hands are covered in grease.

**Diagnosis History**
Every session is saved. Go back and review previous diagnoses anytime.

## Tech Behind It

This isn't glued together with duct tape. The architecture is properly separated — frontend, backend, and AI layer are each their own thing.

**Frontend** — React + Vite. Fast, clean, dark UI with a blue accent theme. Handles image upload, video frame extraction, voice recording, and real-time chat. No external UI libraries — all custom styled.

**Backend** — FastAPI (Python). Handles file uploads, routes requests to the right AI module, stores diagnosis history in SQLite, and manages the conversation state. Runs on Uvicorn.

**AI Layer** — Google Gemini 2.5 Flash. The vision model receives the image and a carefully engineered system prompt that forces structured JSON output — issue name, component, severity, confidence score, safety warning, repair steps, tools needed, follow-up questions. The response gets parsed and rendered directly in the UI.

**Voice** — Browser Web Speech API for speech-to-text input. Browser SpeechSynthesis for reading responses aloud. No external service needed for basic voice functionality.

---

 Project Structure
 AI-quickfix/

├── frontend/

│   ├── src/

│   │   ├── screens/          # HomeScreen, UploadScreen, DiagnosticsScreen, ChatScreen

│   │   ├── components/       # ChatBubble, SafetyWarning, VoiceRecorder, UploadButton

│   │   ├── hooks/            # useVoice (STT + TTS), useCamera

│   │   ├── services/         # api.js — all backend calls in one place

│   │   └── App.jsx           # Tab navigation, global state

│   └── vite.config.js        # Proxy config for backend

│

├── backend/

│   ├── app/

│   │   ├── ai/

│   │   │   ├── llm/          # Gemini integration, prompt engineering, response parsing

│   │   │   ├── vision/       # Image preprocessing, video frame extraction

│   │   │   ├── speech/       # TTS and STT service wrappers

│   │   │   └── safety/       # Severity classification, danger rules

│   │   ├── api/routes/       # /diagnostics, /chat, /upload, /voice endpoints

│   │   ├── services/         # Business logic layer

│   │   ├── database/         # SQLAlchemy models, SQLite

│   │   └── main.py

│   └── requirements.txt

---

## Getting It Running

### What You Need
- Python 3.10 or higher
- Node.js 18 or higher
- A free Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/apikey)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
APP_NAME=FixAI
DEBUG=false
SECRET_KEY=change-this-in-production
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-2.5-flash
DATABASE_URL=sqlite:///./fixai.db
UPLOAD_DIR=uploads
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. The Vite proxy forwards `/api` calls to the backend automatically — no CORS issues.

---

## How a Typical Session Works

1. Open the app and pick a device category
2. Upload a photo of the problem (drag and drop works too)
3. Describe what you're seeing or hearing — optional but helps
4. Select your skill level
5. Hit **Analyze & Diagnose**
6. Read the diagnosis, severity rating, and repair steps
7. Ask follow-up questions in the Chat tab
8. Use voice input if your hands aren't free

---

## Environment Variables Reference

| Variable | What It Does |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `GEMINI_MODEL` | Which Gemini model to use |
| `DATABASE_URL` | Path to the SQLite database |
| `UPLOAD_DIR` | Where uploaded images are stored |
| `SECRET_KEY` | Used for app security |
| `DEBUG` | Set to true for verbose logging |


## Known Limitations

- YOLO object detection and Whisper transcription modules are scaffolded but not active in the current build — the app falls back to Gemini vision and browser speech APIs respectively
- No user authentication — all diagnoses are stored in a single local database
- Gemini API requires billing credits for sustained use

## Built By

**Upputalla Manohar**
[github.com/upputallamanohar](https://github.com/upputallamanohar)
