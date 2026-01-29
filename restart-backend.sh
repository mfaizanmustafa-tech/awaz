#!/bin/bash

echo "🔄 Restarting backend server..."

# Kill existing backend process
pkill -f "nest start"

# Wait a moment
sleep 2

# Start backend in background
cd backend
npm run start:dev > backend.log 2>&1 &

echo "✅ Backend server restarted!"
echo "📝 Logs are being written to backend/backend.log"
echo ""
echo "To view logs: tail -f backend/backend.log"
