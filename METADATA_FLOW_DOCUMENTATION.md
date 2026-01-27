# Metadata Flow: Station Owner → User Dashboard

## Overview
This document explains what metadata is sent by the station owner and what the user receives and displays.

---

## 📤 STATION OWNER SIDE (Sender)

### Location
`frontend/src/app/dashboards/station-owner-dashboard/pages/control-panel/control-panel.component.ts`

### Function: `sendMetadataUpdate()`

### Metadata Sent
```typescript
{
  showTitle: string,           // e.g., "English ka show"
  showType: string,            // e.g., "news", "music", "talk"
  hostName: string,            // e.g., "RJ Station Host"
  hostStageName: string,       // e.g., "RJ Station Host"
  trackName?: string,          // e.g., "Song Title" (optional)
  artistName?: string,         // e.g., "Now Playing" (optional)
  streamSource: string,        // e.g., "media_files", "live_mic", "obs_rtmp"
  isLive: boolean             // true/false
}
```

### When Metadata is Sent
1. **When going live** - `notifyStreamStart()`
2. **When show is selected** - `selectShow()`
3. **When track changes** - `playTrack()`
4. **When stream URL updates** - `updateStreamUrlForUsers()`
5. **On page restore** - When returning to control panel and stream is live

### Example Metadata Sent
```javascript
{
  showTitle: "English ka show",
  showType: "news",
  hostName: "RJ Station Host",
  hostStageName: "RJ Station Host",
  trackName: undefined,
  artistName: undefined,
  streamSource: "obs_rtmp",
  isLive: true
}
```

---

## 📥 USER SIDE (Receiver)

### Location
`frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`

### Function: `updateStationMetadata()`

### Metadata Received & Processed
```typescript
{
  showTitle: string,           // → Updates station.currentShow.title
  showType: string,            // → Updates station.currentShow.type
  hostName: string,            // → Updates station.currentShow.host.name
  hostStageName: string,       // → Updates station.currentShow.host.stageName
  trackName?: string,          // → Shows notification "Now playing: {trackName}"
  trackId?: string,            // → Updates stream URL to /audio-tracks/{trackId}/stream
  isLive: boolean             // → Updates station.isLive
}
```

### What User Sees
The metadata updates these UI elements:

1. **Show Title** - Displayed prominently on the station card
   ```
   "English ka show"
   ```

2. **Show Type** - Shown as a badge/tag
   ```
   [news] or [music] or [talk]
   ```

3. **Host Name** - Displayed with microphone icon
   ```
   🎤 RJ Station Host
   ```

4. **Live Badge** - Shows when `isLive: true`
   ```
   🔴 NOW STREAMING
   ```

5. **Track Name** (if playing media files)
   ```
   "Now playing: Song Title"
   ```

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STATION OWNER SIDE                        │
│                  (Control Panel Component)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1. User selects show
                              │    "English ka show"
                              │
                              ▼
                    ┌──────────────────┐
                    │  selectShow()    │
                    │  - Saves show    │
                    │  - Sends metadata│
                    └──────────────────┘
                              │
                              │ 2. User clicks "Go Live"
                              │
                              ▼
                    ┌──────────────────┐
                    │   goLive()       │
                    │  - Updates DB    │
                    │  - Sends metadata│
                    └──────────────────┘
                              │
                              │ 3. WebSocket sends metadata
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │      WebSocket Service (Backend)        │
        │   streaming.gateway.ts                  │
        │                                         │
        │   @SubscribeMessage('metadata-update')  │
        └────────────────────────────────────────┘
                              │
                              │ 4. Broadcasts to all users
                              │    listening to this channel
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        USER SIDE                             │
│                  (User Dashboard Component)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 5. Receives metadata
                              │
                              ▼
                ┌──────────────────────────────┐
                │  metadataUpdate$.subscribe() │
                │  - Receives metadata         │
                └──────────────────────────────┘
                              │
                              │ 6. Updates station info
                              │
                              ▼
                ┌──────────────────────────────┐
                │  updateStationMetadata()     │
                │  - Updates show title        │
                │  - Updates host name         │
                │  - Updates show type         │
                │  - Updates live status       │
                └──────────────────────────────┘
                              │
                              │ 7. UI updates automatically
                              │
                              ▼
                    ┌──────────────────┐
                    │   USER SEES:     │
                    │                  │
                    │ 🔴 NOW STREAMING │
                    │ English ka show  │
                    │ [news]           │
                    │ 🎤 RJ Station    │
                    │    Host          │
                    └──────────────────┘
```

---

## 📊 Metadata Mapping Table

| Station Owner Sends | User Receives | User Displays |
|---------------------|---------------|---------------|
| `showTitle: "English ka show"` | `station.currentShow.title` | **"English ka show"** (Large text) |
| `showType: "news"` | `station.currentShow.type` | **[news]** (Badge) |
| `hostName: "RJ Station Host"` | `station.currentShow.host.name` | **🎤 RJ Station Host** |
| `hostStageName: "RJ Station Host"` | `station.currentShow.host.stageName` | **RJ Station Host** (Primary display) |
| `isLive: true` | `station.isLive` | **🔴 NOW STREAMING** (Badge) |
| `trackName: "Song Title"` | Notification | **"Now playing: Song Title"** (Toast) |
| `trackId: "abc123"` | `station.streamUrl` | Updates audio source URL |

---

## 🔍 Current Implementation Status

### ✅ Working
- Show title updates in real-time
- Host name updates correctly
- Show type displays properly
- Live status badge shows/hides correctly
- Track changes trigger notifications

### ⚠️ Important Notes

1. **Host Name Priority**: The system uses `hostStageName` first, falls back to `hostName`
   ```typescript
   station.currentShow.host = {
     stageName: data.hostStageName || data.hostName || '',
     name: data.hostName || ''
   };
   ```

2. **Show Type**: Must be one of the valid types:
   - `music`, `talk`, `news`, `sports`, `comedy`, `educational`, 
   - `religious`, `call_in`, `live_event`, `podcast`, `documentary`

3. **Track Updates**: When playing media files, each track change sends:
   - `trackId` - Used to update stream URL
   - `trackName` - Shown in notification

4. **Stream Source**: Indicates how the station is streaming:
   - `live_mic` - Using microphone
   - `stream_link` - External stream URL
   - `media_files` - Playing uploaded tracks
   - `obs_rtmp` - Using OBS/RTMP

---

## 🧪 Testing Metadata Flow

### Test 1: Show Selection
1. Station owner selects "English ka show"
2. Check user dashboard shows: **"English ka show"**
3. Check console logs: `📝 Updated show title`

### Test 2: Host Name
1. Station owner's show has host "RJ Mike"
2. Check user dashboard shows: **🎤 RJ Mike**
3. Check console logs: `📝 Updated host`

### Test 3: Live Status
1. Station owner clicks "Go Live"
2. Check user dashboard shows: **🔴 NOW STREAMING**
3. Check console logs: `✅ Metadata update complete`

### Test 4: Track Change (Media Files)
1. Station owner plays a track
2. Check user receives notification: **"Now playing: {trackName}"**
3. Check audio switches to new track URL

---

## 📝 Console Logs for Debugging

### Station Owner Side
```
📡 Metadata update sent: {
  showTitle: "English ka show",
  hostName: "RJ Station Host",
  showType: "news",
  isLive: true
}
```

### User Side
```
📝 Metadata update received: { showTitle: "English ka show", ... }
🔄 updateStationMetadata called for: NEWS
✅ Updated show title: "" → "English ka show"
✅ Updated host: "" → "RJ Station Host"
✅ Updated show type: "music" → "news"
🎯 Final station.currentShow state: { title: "English ka show", ... }
✅ Metadata update complete for NEWS
```

---

## 🔧 WebSocket Events

### Event Name
`metadata-update`

### Backend Handler
`backend/src/streaming/streaming.gateway.ts`

```typescript
@SubscribeMessage('metadata-update')
handleMetadataUpdate(
  @MessageBody() data: { channelId: string; metadata: any }
) {
  // Broadcasts to all users listening to this channel
  this.server.to(`channel-${data.channelId}`).emit('metadata-update', {
    channelId: data.channelId,
    ...data.metadata,
    timestamp: new Date().toISOString()
  });
}
```

---

## 📅 Last Updated
January 26, 2026

## 🔗 Related Files
- Station Owner: `frontend/src/app/dashboards/station-owner-dashboard/pages/control-panel/control-panel.component.ts`
- User Dashboard: `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`
- WebSocket Service: `frontend/src/app/services/websocket.service.ts`
- Backend Gateway: `backend/src/streaming/streaming.gateway.ts`
