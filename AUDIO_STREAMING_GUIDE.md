# 🎵 Audio Streaming Guide - Awaz Pulse

## Complete Guide: From Upload to Playback

This guide explains how to stream audio from the Station Owner dashboard to End Users.

---

## 📋 Table of Contents

1. [Station Owner: Upload Audio](#station-owner-upload-audio)
2. [Station Owner: Start Streaming](#station-owner-start-streaming)
3. [End User: Listen to Stream](#end-user-listen-to-stream)
4. [Technical Architecture](#technical-architecture)
5. [Troubleshooting](#troubleshooting)

---

## 🎤 Station Owner: Upload Audio

### Step 1: Navigate to Your Show

1. Log in as **Station Owner** at `http://localhost:4200/station-owner`
2. Go to the **"Shows"** section
3. Find your show **"Horror Vibes"**
4. Click on the show to view details

### Step 2: Upload Audio Files

In the show details, you should see an **"Upload Audio"** section:

1. Click **"Choose File"** or drag and drop an audio file
2. Supported formats: MP3, WAV, OGG, M4A
3. Click **"Upload"** button
4. Wait for the upload to complete
5. You'll see the uploaded track in the list

**API Endpoint Used:**
```
POST http://localhost:3000/audio-tracks/upload
```

**What Happens:**
- File is uploaded to `backend/uploads/audio-tracks/`
- Database record is created in `audio_tracks` table
- File is linked to your show

---

## 📡 Station Owner: Start Streaming

### Step 3: Assign Audio to Stream

1. Go to your **Channel** (the one associated with your show)
2. Find the **Stream** you want to use
3. Look for **"Select Audio Track"** or **"Start Streaming"** option
4. Select the uploaded audio track
5. Click **"Start Stream"** or **"Go Live"**

**API Endpoint Used:**
```
POST http://localhost:3000/channels/streams/:streamId/play
Body: { "trackId": "your-audio-track-id" }
```

**What Happens:**
- Stream status changes to "active"
- Stream URL is updated to point to your audio file
- Stream becomes available to end users

---

## 🎧 End User: Listen to Stream

### Step 4: End User Access

1. Log in as **End User** at `http://localhost:4200/dashboard`
2. Browse available channels
3. Find the channel with your show
4. Click **"Listen"** or **"Play"** button

**Audio Stream URL:**
```
http://localhost:3000/audio-tracks/{track-id}/stream
```

**What Happens:**
- Frontend fetches the stream URL from the channel
- Audio player loads the stream
- User can play, pause, adjust volume
- Listening session is tracked in the database

---

## 🏗️ Technical Architecture

### Backend Components

#### 1. Audio Tracks Module
**Location:** `backend/src/audio-tracks/`

**Key Files:**
- `audio-tracks.controller.ts` - Handles upload and streaming endpoints
- `audio-tracks.service.ts` - Business logic for audio management
- `audio-track.entity.ts` - Database model

**Endpoints:**
```typescript
POST   /audio-tracks/upload          // Upload audio file
GET    /audio-tracks/show/:showId    // Get tracks for a show
GET    /audio-tracks/:id/stream      // Stream audio file
DELETE /audio-tracks/:id             // Delete audio track
```

#### 2. Channels Module
**Location:** `backend/src/channels/`

**Key Method:**
```typescript
async playStream(streamId: string, trackId: string)
```

This method:
- Finds the stream by ID
- Finds the audio track by ID
- Updates stream URL to point to the audio file
- Changes stream status to "active"

#### 3. File Storage
**Location:** `backend/uploads/audio-tracks/`

Files are stored with unique names:
```
{timestamp}-{random-number}-{original-filename}
```

### Frontend Components

#### 1. Station Owner Dashboard
**Location:** `frontend/src/app/dashboards/station-owner-dashboard/`

**Features:**
- Upload audio files
- View uploaded tracks
- Assign tracks to streams
- Start/stop streaming

#### 2. User Dashboard
**Location:** `frontend/src/app/dashboards/user-dashboard/`

**Features:**
- Browse available channels
- View live shows
- Play audio streams
- Track listening history

### Database Schema

#### audio_tracks Table
```sql
CREATE TABLE audio_tracks (
  id VARCHAR(36) PRIMARY KEY,
  showId VARCHAR(36),
  filename VARCHAR(255),
  originalName VARCHAR(255),
  fileUrl VARCHAR(500),
  mimeType VARCHAR(100),
  fileSize INT,
  duration INT,
  uploadedAt DATETIME,
  FOREIGN KEY (showId) REFERENCES shows(id)
);
```

#### streams Table
```sql
CREATE TABLE streams (
  id VARCHAR(36) PRIMARY KEY,
  channelId VARCHAR(36),
  name VARCHAR(255),
  streamUrl VARCHAR(500),
  status ENUM('active', 'inactive', 'maintenance'),
  currentListeners INT DEFAULT 0,
  quality VARCHAR(50),
  isMainStream BOOLEAN,
  FOREIGN KEY (channelId) REFERENCES channels(id)
);
```

---

## 🔧 Current Implementation Status

### ✅ What's Working

1. **Audio Upload**
   - File upload to server
   - Database record creation
   - File storage management

2. **Stream Management**
   - Create streams for channels
   - Update stream URLs
   - Track stream status

3. **Audio Streaming**
   - HTTP streaming endpoint
   - File streaming with proper headers
   - Support for range requests (seeking)

### ⚠️ What Needs Implementation

Based on the code review, here's what might need to be added or verified:

1. **Frontend Audio Player**
   - HTML5 audio player component
   - Play/pause controls
   - Volume control
   - Progress bar

2. **Stream Assignment UI**
   - UI to select audio track for a stream
   - Button to start/stop streaming
   - Visual feedback for active streams

3. **End User Stream Discovery**
   - List of available live streams
   - Channel browsing with live indicators
   - Audio player integration

---

## 🚀 Quick Start Workflow

### For Station Owners:

```bash
# 1. Create a show (already done - "Horror Vibes")
# 2. Upload audio file
curl -X POST http://localhost:3000/audio-tracks/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/audio.mp3" \
  -F "showId=YOUR_SHOW_ID"

# 3. Start streaming
curl -X POST http://localhost:3000/channels/streams/STREAM_ID/play \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"trackId": "AUDIO_TRACK_ID"}'
```

### For End Users:

```bash
# 1. Get available channels
curl http://localhost:3000/channels

# 2. Play stream (in browser or audio player)
# Open: http://localhost:3000/audio-tracks/TRACK_ID/stream
```

---

## 🐛 Troubleshooting

### Issue: "Cannot upload audio file"

**Possible Causes:**
1. Upload directory doesn't exist
2. No write permissions
3. File size too large

**Solution:**
```bash
# Create upload directory
mkdir -p backend/uploads/audio-tracks

# Set permissions
chmod 755 backend/uploads/audio-tracks

# Check file size limit in backend
# Look for multer configuration in audio-tracks.controller.ts
```

### Issue: "Stream not playing"

**Possible Causes:**
1. Stream URL not set correctly
2. Audio file doesn't exist
3. CORS issues

**Solution:**
```bash
# Check if file exists
ls -la backend/uploads/audio-tracks/

# Check stream URL in database
# Use mysql-database-manager.js or check directly

# Verify CORS settings in backend/src/main.ts
```

### Issue: "No audio tracks showing"

**Possible Causes:**
1. Upload failed silently
2. Database connection issue
3. Show ID mismatch

**Solution:**
```bash
# Check database for audio tracks
node backend/mysql-database-manager.js
# Then query: SELECT * FROM audio_tracks;

# Check backend logs for errors
# Look at the terminal where backend is running
```

---

## 📊 Monitoring & Analytics

### Track Listening Sessions

The system tracks:
- Who is listening
- When they started
- How long they listened
- Which show/channel

**Database Table:** `listening_sessions`

### View Analytics

Station owners can see:
- Total listeners
- Peak listening times
- Popular shows
- Listener engagement

**Endpoint:** `GET /analytics/channels/:channelId`

---

## 🎯 Next Steps

### Recommended Enhancements:

1. **Live Streaming**
   - Implement WebRTC or HLS for live broadcasts
   - Add real-time chat during shows
   - Enable live call-ins

2. **Playlist Management**
   - Create playlists of audio tracks
   - Auto-play next track
   - Shuffle and repeat modes

3. **Audio Processing**
   - Extract audio duration automatically
   - Generate waveforms
   - Add audio effects

4. **Mobile Support**
   - Responsive audio player
   - Background playback
   - Offline downloads

---

## 📞 Need Help?

If you encounter issues:

1. Check backend logs (terminal where `npm run start:dev` is running)
2. Check frontend console (F12 in browser)
3. Verify database records using `mysql-database-manager.js`
4. Check file permissions in `uploads/audio-tracks/`

---

## 🔗 Related Files

- Backend Audio Module: `backend/src/audio-tracks/`
- Frontend Station Dashboard: `frontend/src/app/dashboards/station-owner-dashboard/`
- Frontend User Dashboard: `frontend/src/app/dashboards/user-dashboard/`
- Database Schema: `DATABASE_SCHEMA.md`
- API Documentation: `TECHNICAL_ARCHITECTURE.md`

---

**Last Updated:** January 8, 2026
**Version:** 1.0.0
