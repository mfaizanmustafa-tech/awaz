# Dual Streaming System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATION OWNER                               │
│                                                                  │
│  ┌──────────────┐              ┌──────────────┐                │
│  │  OBS Studio  │              │     BUTT     │                │
│  │  (For HLS)   │              │ (For Icecast)│                │
│  └──────┬───────┘              └──────┬───────┘                │
└─────────┼──────────────────────────────┼──────────────────────┘
          │                              │
          │ RTMP Stream                  │ Icecast Stream
          │ (Port 1935)                  │ (Port 8000)
          │                              │
┌─────────▼──────────────────────────────▼──────────────────────┐
│                    AWAZ PULSE BACKEND                          │
│                                                                 │
│  ┌─────────────────┐              ┌─────────────────┐         │
│  │  NGINX-RTMP     │              │    ICECAST      │         │
│  │   Container     │              │   Container     │         │
│  │                 │              │                 │         │
│  │  • Receives     │              │  • Receives     │         │
│  │    RTMP stream  │              │    audio stream │         │
│  │  • Converts to  │              │  • Broadcasts   │         │
│  │    HLS chunks   │              │    directly     │         │
│  │  • Creates      │              │  • Mount points │         │
│  │    .m3u8/.ts    │              │    per channel  │         │
│  │                 │              │                 │         │
│  │  Port: 1935     │              │  Port: 8000     │         │
│  │  HLS: 8088      │              │                 │         │
│  └─────────────────┘              └─────────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────┐         │
│  │         NestJS Backend (Port 3000)               │         │
│  │                                                   │         │
│  │  • Stream Manager Service                        │         │
│  │    - switchStreamType()                          │         │
│  │    - getActiveStreamType()                       │         │
│  │    - Auto-stop logic                             │         │
│  │                                                   │         │
│  │  • Streams Controller                            │         │
│  │    - POST /switch-type                           │         │
│  │    - GET /credentials                            │         │
│  │    - GET /active-type                            │         │
│  │                                                   │         │
│  │  • Database (MySQL)                              │         │
│  │    - streams table                               │         │
│  │    - streamType: 'hls' | 'icecast'              │         │
│  │    - icecastMountPoint                           │         │
│  └──────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              │
┌─────────────────────────────▼──────────────────────────────────┐
│                    ANGULAR FRONTEND                             │
│                      (Port 4200)                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           Control Panel Component                        │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │      Stream Type Selector Card                  │    │ │
│  │  │                                                  │    │ │
│  │  │  ┌──────────────┐      ┌──────────────┐        │    │ │
│  │  │  │ HLS Streaming│      │   Icecast    │        │    │ │
│  │  │  │  10-30s lag  │      │   2-5s lag   │        │    │ │
│  │  │  │   [ACTIVE]   │      │   [Click]    │        │    │ │
│  │  │  └──────────────┘      └──────────────┘        │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │      Credentials Card (Dynamic)                 │    │ │
│  │  │                                                  │    │ │
│  │  │  If HLS:                                        │    │ │
│  │  │    • RTMP Server URL                            │    │ │
│  │  │    • Stream Key                                 │    │ │
│  │  │    • HLS Playback URL                           │    │ │
│  │  │                                                  │    │ │
│  │  │  If Icecast:                                    │    │ │
│  │  │    • Icecast Server                             │    │ │
│  │  │    • Mount Point                                │    │ │
│  │  │    • Source Password                            │    │ │
│  │  │    • Playback URL                               │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │      Setup Guide Card (Dynamic)                 │    │ │
│  │  │                                                  │    │ │
│  │  │  If HLS: OBS Setup Guide                        │    │ │
│  │  │  If Icecast: BUTT Setup Guide                   │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Playback URLs
                              │
┌─────────────────────────────▼──────────────────────────────────┐
│                         LISTENERS                               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Web Browser  │  │ Mobile App   │  │  Radio App   │        │
│  │              │  │              │  │              │        │
│  │ HLS Player   │  │ HLS Player   │  │ Icecast      │        │
│  │ (hls.js)     │  │ (native)     │  │ (direct)     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### HLS Streaming Flow

```
1. Station Owner
   ↓ (Opens OBS)
   ↓ (Configures RTMP settings)
   ↓ (Starts streaming)
   
2. OBS Studio
   ↓ (Sends RTMP stream to rtmp://localhost:1935/live/[channel-id])
   
3. NGINX-RTMP Server
   ↓ (Receives RTMP stream)
   ↓ (Transcodes to HLS)
   ↓ (Creates .m3u8 playlist)
   ↓ (Creates .ts chunks every 2 seconds)
   ↓ (Stores in /tmp/hls/)
   
4. HLS Files Available
   ↓ (Playlist: /hls/[channel-id].m3u8)
   ↓ (Chunks: /hls/[channel-id]-*.ts)
   
5. Listener
   ↓ (Requests http://localhost:8088/hls/[channel-id].m3u8)
   ↓ (Downloads playlist)
   ↓ (Downloads chunks sequentially)
   ↓ (Plays audio with 10-30s delay)
```

### Icecast Streaming Flow

```
1. Station Owner
   ↓ (Opens BUTT)
   ↓ (Configures Icecast settings)
   ↓ (Starts streaming)
   
2. BUTT Software
   ↓ (Encodes audio to MP3/AAC)
   ↓ (Sends to icecast://localhost:8000/[channel-id].mp3)
   
3. Icecast Server
   ↓ (Receives audio stream)
   ↓ (Creates mount point /[channel-id].mp3)
   ↓ (Broadcasts continuously)
   
4. Stream Available
   ↓ (Direct URL: http://localhost:8000/[channel-id].mp3)
   
5. Listener
   ↓ (Connects to http://localhost:8000/[channel-id].mp3)
   ↓ (Receives continuous audio stream)
   ↓ (Plays audio with 2-5s delay)
```

---

## Stream Type Switching Flow

```
1. User Action
   ↓ (Clicks "Direct Stream (Icecast)" button)
   
2. Frontend
   ↓ (Calls switchStreamType('icecast'))
   ↓ (Shows loading indicator)
   
3. Backend API
   ↓ (POST /streams/channel/:id/switch-type)
   ↓ (Receives request)
   
4. Stream Manager Service
   ↓ (Checks for active stream)
   ↓ (Finds HLS stream is LIVE)
   ↓ (Calls stopStream() for HLS)
   ↓ (Updates database: HLS status = OFFLINE)
   ↓ (Clears listeners for HLS)
   
5. Stream Manager Service
   ↓ (Looks for Icecast stream entry)
   ↓ (If not found, creates new stream entry)
   ↓ (Sets streamType = 'icecast')
   ↓ (Sets icecastMountPoint = '/[channel-id].mp3')
   ↓ (Sets streamUrl = 'http://localhost:8000/[channel-id].mp3')
   
6. Backend Response
   ↓ (Returns success with new stream details)
   
7. Frontend
   ↓ (Receives response)
   ↓ (Updates selectedStreamType = 'icecast')
   ↓ (Clears old credentials)
   ↓ (Calls loadStreamingCredentialsByType('icecast'))
   
8. Backend API
   ↓ (GET /streams/channel/:id/credentials?streamType=icecast)
   ↓ (Returns Icecast credentials)
   
9. Frontend
   ↓ (Displays Icecast credentials)
   ↓ (Shows BUTT setup guide)
   ↓ (Hides loading indicator)
   
10. User
    ↓ (Sees new credentials)
    ↓ (Configures BUTT with Icecast settings)
    ↓ (Starts streaming via Icecast)
```

---

## Database Schema

### streams Table

```sql
CREATE TABLE streams (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  streamUrl VARCHAR(255) NOT NULL,
  backupStreamUrl VARCHAR(255),
  
  -- Stream Type (NEW)
  streamType ENUM('hls', 'icecast') DEFAULT 'hls',
  icecastMountPoint VARCHAR(255),
  
  status ENUM('live', 'offline', 'scheduled', 'maintenance') DEFAULT 'offline',
  quality ENUM('low', 'medium', 'high', 'hd') DEFAULT 'medium',
  bitrate INT DEFAULT 128,
  format VARCHAR(50) DEFAULT 'mp3',
  
  currentListeners INT DEFAULT 0,
  maxListeners INT DEFAULT 1000,
  isActive BOOLEAN DEFAULT TRUE,
  isMainStream BOOLEAN DEFAULT FALSE,
  lastOnlineAt DATETIME,
  totalUptime INT DEFAULT 0,
  
  currentShowId VARCHAR(36),
  currentTrack VARCHAR(255),
  currentArtist VARCHAR(255),
  metadata JSON,
  
  channelId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (channelId) REFERENCES channels(id),
  INDEX idx_channel_type (channelId, streamType),
  INDEX idx_status (status)
);
```

### Example Data

```sql
-- Channel ABC123 has two stream entries:

-- HLS Stream
INSERT INTO streams VALUES (
  'stream-hls-1',
  'Radio Station - HLS',
  NULL,
  'http://localhost:8088/hls/ABC123.m3u8',
  NULL,
  'hls',           -- streamType
  NULL,            -- icecastMountPoint
  'offline',
  'medium',
  128,
  'mp3',
  0, 1000, TRUE, TRUE,
  NULL, 0, NULL, NULL, NULL, NULL,
  'ABC123',
  NOW(), NOW()
);

-- Icecast Stream
INSERT INTO streams VALUES (
  'stream-ice-1',
  'Radio Station - Icecast',
  NULL,
  'http://localhost:8000/ABC123.mp3',
  NULL,
  'icecast',       -- streamType
  '/ABC123.mp3',   -- icecastMountPoint
  'offline',
  'medium',
  128,
  'mp3',
  0, 1000, TRUE, FALSE,
  NULL, 0, NULL, NULL, NULL, NULL,
  'ABC123',
  NOW(), NOW()
);
```

---

## Component Interaction

### Frontend Components

```
ControlPanelComponent
├── Properties
│   ├── selectedStreamType: 'hls' | 'icecast'
│   ├── switchingStreamType: boolean
│   ├── rtmpCredentials: RtmpCredentials | null
│   └── icecastCredentials: any | null
│
├── Methods
│   ├── switchStreamType(type)
│   │   └── Calls API to switch stream type
│   │
│   ├── loadStreamingCredentialsByType(type)
│   │   └── Loads credentials for selected type
│   │
│   └── getStreamTypeDescription(type)
│       └── Returns description for UI
│
└── Template Sections
    ├── Stream Type Selector Card
    │   ├── HLS Option Button
    │   └── Icecast Option Button
    │
    ├── Credentials Card (Conditional)
    │   ├── HLS Credentials (if selectedStreamType === 'hls')
    │   └── Icecast Credentials (if selectedStreamType === 'icecast')
    │
    └── Setup Guide Card (Conditional)
        ├── OBS Guide (if selectedStreamType === 'hls')
        └── BUTT Guide (if selectedStreamType === 'icecast')
```

### Backend Services

```
StreamManagerService
├── switchStreamType(channelId, newType)
│   ├── Find active stream
│   ├── Stop active stream if exists
│   ├── Find or create stream with new type
│   └── Return new stream
│
├── getActiveStreamType(channelId)
│   ├── Query database for LIVE stream
│   └── Return streamType or null
│
└── isStreamTypeActive(channelId, streamType)
    ├── Get active type
    └── Compare with requested type

StreamsController
├── POST /streams/channel/:id/switch-type
│   ├── Validate request
│   ├── Call StreamManagerService.switchStreamType()
│   └── Return success response
│
├── GET /streams/channel/:id/credentials
│   ├── Get or create stream for requested type
│   ├── Generate credentials based on type
│   └── Return credentials object
│
└── GET /streams/channel/:id/active-type
    ├── Call StreamManagerService.getActiveStreamType()
    └── Return active type info
```

---

## Security Considerations

### Credentials Protection
```
┌─────────────────────────────────────────┐
│  Frontend (Browser)                     │
│  • Credentials displayed to owner only  │
│  • Password fields masked by default    │
│  • Copy-to-clipboard for easy use       │
└─────────────────┬───────────────────────┘
                  │ HTTPS (in production)
┌─────────────────▼───────────────────────┐
│  Backend API                             │
│  • JWT authentication required           │
│  • Role-based access (STATION_OWNER)    │
│  • Credentials only for owned channels   │
└─────────────────┬───────────────────────┘
                  │ Internal network
┌─────────────────▼───────────────────────┐
│  Streaming Servers                       │
│  • RTMP: Stream key validation           │
│  • Icecast: Source password required     │
│  • Mount points per channel              │
└──────────────────────────────────────────┘
```

---

## Performance Considerations

### HLS
- **CPU**: Higher (transcoding required)
- **Memory**: Moderate (chunk buffering)
- **Disk**: Higher (stores .ts files)
- **Network**: Moderate (chunked delivery)

### Icecast
- **CPU**: Lower (direct streaming)
- **Memory**: Lower (minimal buffering)
- **Disk**: Lower (no file storage)
- **Network**: Continuous (constant bitrate)

---

## Scalability

### Current Setup (Single Server)
```
┌──────────────────────────────────────┐
│  Single Docker Host                  │
│  ├── NGINX-RTMP (HLS)               │
│  ├── Icecast                         │
│  ├── Backend                         │
│  ├── MySQL                           │
│  └── Frontend                        │
│                                      │
│  Supports: ~100-500 concurrent       │
│            listeners per stream      │
└──────────────────────────────────────┘
```

### Future Scaling (Multi-Server)
```
┌─────────────────────────────────────────────┐
│  Load Balancer                              │
└─────┬───────────────────────────────────────┘
      │
      ├─────────────┬─────────────┬───────────┐
      │             │             │           │
┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐     │
│ RTMP      │ │ RTMP     │ │ RTMP     │     │
│ Server 1  │ │ Server 2 │ │ Server 3 │     │
└───────────┘ └──────────┘ └──────────┘     │
                                              │
┌─────▼─────┐ ┌────▼─────┐ ┌────▼─────┐     │
│ Icecast   │ │ Icecast  │ │ Icecast  │     │
│ Server 1  │ │ Server 2 │ │ Server 3 │     │
└───────────┘ └──────────┘ └──────────┘     │
                                              │
      └─────────────┬─────────────────────────┘
                    │
              ┌─────▼─────┐
              │  Backend  │
              │  Cluster  │
              └─────┬─────┘
                    │
              ┌─────▼─────┐
              │  Database │
              │  Cluster  │
              └───────────┘
```

---

**Last Updated:** January 2026
**Version:** 1.0.0
