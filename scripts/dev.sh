#!/bin/bash

# Finding Sweetie - Start Services
# This script starts all services for development

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Starting Finding Sweetie services..."

# Start backend in background
echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Start AI service in background
echo "Starting AI service..."
cd ai-service
source venv/bin/activate
python -m uvicorn src.main:app --reload --port 8000 &
AI_PID=$!
deactivate
cd ..

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=== Services Started ==="
echo "Backend PID: $BACKEND_PID"
echo "AI Service PID: $AI_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C and stop all services
trap "echo 'Stopping services...'; kill $BACKEND_PID $AI_PID $FRONTEND_PID; exit" INT

# Wait for all background processes
wait
