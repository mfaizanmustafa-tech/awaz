# Listening Time Feature Implementation

## Overview
Added listening time tracking to the control panel to show how much time users have spent listening to your channel.

## What Was Added

### Backend
1. **New API Endpoint**: `GET /analytics/channels/:channelId/listening-time`
   - Returns total listening time for a channel
   - Supports period filters: `today`, `week`, `month`, or `all_time`
   - Returns formatted time (hours and minutes)
   - Shows total sessions, unique listeners, and average session duration

2. **Analytics Service Method**: `getChannelListeningTime()`
   - Queries the `listening_sessions` table
   - Calculates total listening time from session durations
   - Formats time in human-readable format

### Frontend (Control Panel)
1. **New State Variable**: `totalListeningTime`
2. **New Function**: `loadListeningTime()` - Fetches listening time data from API
3. **Updated Stats Display**: Shows "Listening Time Today" instead of "Total Uptime"

## Current Status

✅ **Backend API is ready** - The endpoint is working and can calculate listening time
✅ **Control Panel displays the data** - Shows listening time in the stats bar
⚠️ **No data yet** - The `listening_sessions` table is empty because the frontend doesn't track sessions yet

## Why It Shows 0h 0m

The listening time shows "0h 0m" because:
1. The `listening_sessions` table in the database is empty
2. The frontend user dashboard doesn't currently create listening session records when users listen to streams
3. No listening sessions = no listening time to calculate

## To Make It Work Fully

The frontend user dashboard needs to be updated to:

1. **Create a listening session** when a user starts playing a stream:
   ```typescript
   POST /listening-sessions
   {
     streamId: string,
     userId: string,
     startTime: Date,
     status: 'active'
   }
   ```

2. **Update the session** periodically (every 30 seconds) to track duration:
   ```typescript
   PATCH /listening-sessions/:id
   {
     durationSeconds: number,
     status: 'active'
   }
   ```

3. **End the session** when the user stops listening:
   ```typescript
   PATCH /listening-sessions/:id
   {
     endTime: Date,
     status: 'completed',
     durationSeconds: finalDuration
   }
   ```

## API Response Example

```json
{
  "channelId": "a42fb49b-7be1-41e8-b9c2-7083ca3d1641",
  "period": "today",
  "totalListeningTime": {
    "hours": 5,
    "minutes": 32,
    "seconds": 19200,
    "formatted": "5h 32m"
  },
  "totalSessions": 45,
  "uniqueListeners": 23,
  "averageSessionDuration": {
    "hours": 0,
    "minutes": 7,
    "seconds": 426,
    "formatted": "0h 7m"
  },
  "activeSessions": 3
}
