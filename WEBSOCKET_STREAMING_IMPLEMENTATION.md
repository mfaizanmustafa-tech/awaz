# WebSocket Real-Time Streaming Implementation Guide

## Overview
This guide implements WebSocket-based real-time audio streaming and metadata broadcasting for Awaz Pulse radio platform.

## Architecture

### Components
1. **WebSocket Gateway** (Backend) - Manages real-time connections
2. **Stream Manager Service** - Handles audio streaming logic
3. **Metadata Broadcaster** - Pushes show/track info to all listeners
4. **Frontend WebSocket Client** - Receives real-time updates

### Features
- ✅ Real-time audio streaming from station owner
- ✅ Live metadata updates (show name, host, track info)
- ✅ Synchronized playback across all listeners
- ✅ Live listener count updates
- ✅ Chat/interaction capabilities
- ✅ Stream quality monitoring

## Installation

### Backend Dependencies
```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

### Frontend Dependencies
```bash
cd frontend
npm install socket.io-client
```

## Implementation Steps

### Step 1: Install Dependencies
Run the commands above to install required packages.

### Step 2: Create WebSocket Gateway
Create `backend/src/streaming/streaming.gateway.ts`

### Step 3: Create Stream Manager Service
Create `backend/src/streaming/stream-manager.service.ts`

### Step 4: Create Streaming Module
Create `backend/src/streaming/streaming.module.ts`

### Step 5: Update App Module
Import StreamingModule in `backend/src/app.module.ts`

### Step 6: Create Frontend WebSocket Service
Create `frontend/src/app/services/websocket.service.ts`

### Step 7: Update Station Owner Dashboard
Add live streaming controls to station owner dashboard

### Step 8: Update User Dashboard
Add WebSocket listener to user dashboard for real-time updates

## Usage Flow

### Station Owner Flow
1. Station owner uploads audio or starts live stream
2. Clicks "Go Live" button
3. Backend broadcasts stream URL and metadata to all connected listeners
4. All listeners receive instant notification and can tune in

### End User Flow
1. User opens dashboard and connects to WebSocket
2. Sees live stations with real-time listener counts
3. Clicks play on a live station
4. Receives synchronized audio stream and live metadata updates
5. Sees real-time updates when show/track changes

## WebSocket Events

### Server → Client Events
- `stream:started` - Stream went live
- `stream:stopped` - Stream ended
- `stream:metadata` - Show/track info updated
- `stream:listeners` - Listener count updated
- `stream:quality` - Stream quality metrics
- `chat:message` - Chat message received

### Client → Server Events
- `stream:join` - User joined a stream
- `stream:leave` - User left a stream
- `stream:heartbeat` - Keep connection alive
- `chat:send` - Send chat message
- `interaction:like` - User liked content

## Benefits

### For Station Owners
- Instant broadcast to all listeners
- Real-time listener analytics
- Live interaction with audience
- No delay between upload and broadcast

### For End Users
- Zero-delay streaming
- Live metadata updates
- Synchronized listening experience
- Real-time chat and interactions

### For Admins
- Monitor all active streams
- Real-time platform analytics
- Quick response to issues

## Next Steps
1. Install dependencies
2. Create the files listed above
3. Test with station owner going live
4. Verify end users receive instant updates
5. Add chat and interaction features

## Technical Notes

### Connection Management
- WebSocket connections are maintained per user
- Automatic reconnection on disconnect
- Heartbeat mechanism to detect dead connections

### Scalability
- Can handle thousands of concurrent listeners
- Room-based broadcasting (one room per channel)
- Efficient message broadcasting

### Security
- JWT authentication for WebSocket connections
- Role-based access control
- Rate limiting on events

## Testing Checklist
- [ ] Station owner can go live
- [ ] End users receive instant notification
- [ ] Metadata updates in real-time
- [ ] Listener count updates correctly
- [ ] Audio plays without delay
- [ ] Reconnection works after disconnect
- [ ] Multiple users can listen simultaneously
