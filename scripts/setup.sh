#!/usr/bin/env bash
# FixAI — one-shot setup script
set -e
echo "=== FixAI Setup ==="

# Backend
echo "→ Setting up backend..."
cd "$(dirname "$0")/../backend"
[ ! -f .env ] && cp .env.example .env && echo "  Created .env — add your ANTHROPIC_API_KEY"
python -m venv .venv 2>/dev/null || true
source .venv/bin/activate 2>/dev/null || source .venv/Scripts/activate 2>/dev/null || true
pip install --upgrade pip -q
pip install -r requirements.txt -q
mkdir -p uploads models vector_store
echo "  Backend ready."

# Frontend
echo "→ Setting up frontend..."
cd ../frontend
[ ! -f .env ] && cp .env.example .env
npm install --silent
echo "  Frontend ready."

echo ""
echo "=== Setup complete! ==="
echo "  1. Add ANTHROPIC_API_KEY to backend/.env"
echo "  2. Start backend:  cd backend && uvicorn app.main:app --reload"
echo "  3. Start frontend: cd frontend && npm run dev"
