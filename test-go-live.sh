#!/bin/bash

echo "🔴 Testing Go Live Endpoint"
echo "============================"

# Login as station owner
echo "1. Logging in as station owner..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "station@gmail.com", "password": "password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

# Get channel ID
echo ""
echo "2. Getting channel ID..."
CHANNELS=$(curl -s http://localhost:3000/channels/my-channels \
  -H "Authorization: Bearer $TOKEN")

CHANNEL_ID=$(echo $CHANNELS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CHANNEL_ID" ]; then
    echo "❌ Failed to get channel ID"
    echo "Response: $CHANNELS"
    exit 1
fi

echo "✅ Got channel ID: $CHANNEL_ID"

# Test go-live endpoint
echo ""
echo "3. Testing go-live endpoint..."
GO_LIVE_RESPONSE=$(curl -s -X POST "http://localhost:3000/channels/$CHANNEL_ID/go-live" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "streamType": "icecast",
    "streamUrl": "http://localhost:8000/stream",
    "showTitle": "Test Show"
  }')

echo "Response: $GO_LIVE_RESPONSE"

# Check if successful
if echo "$GO_LIVE_RESPONSE" | grep -q "success"; then
    echo ""
    echo "✅ Go Live endpoint is working!"
else
    echo ""
    echo "❌ Go Live endpoint failed"
fi
