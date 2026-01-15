# RTMP Streaming Setup Guide for Awaz Pulse

## Overview

This guide explains how to set up RTMP streaming with OBS Studio for your Awaz Pulse radio station.

## Architecture

```
[OBS Studio] → [RTMP Server (port 1935)] → [HLS Conversion] → [Listeners (port 8088)]
     ↓                    ↓                       ↓
  Broadcaster         Nginx-RTMP              Web Players
```

## Quick Start

### 1. Start the RTMP Server

```bash
# Start all services including RTMP server
docker-compose up -d rtmp-server

# Or start everything
docker-compose up -d
```

### 2. Get Your Streaming Credentials

1. Log in to your Station Owner dashboard
2. Go to **Control Panel**
3. Click the **OBS / RTMP** tab
4. Click **Load Credentials** to see your:
   - Server URL: `rtmp://localhost:1935/live` (or your production URL)
   - Stream Key: Your unique key (keep this secret!)

### 3. Configure OBS Studio

1. Open OBS Studio
2. Go to **Settings → Stream**
3. Set **Service** to "Custom..."
4. Enter:
   - **Server**: `rtmp://localhost:1935/live`
   - **Stream Key**: Your stream key from the dashboard
5. Click **OK**

### 4. Configure Audio (for Radio)

1. In OBS, click **+** under Sources
2. Add **Audio Input Capture** (for microphone)
3. Add **Audio Output Capture** (for music/system audio)
4. Adjust levels in the Audio Mixer

### 5. Start Streaming

1. Click **Start Streaming** in OBS
2. Your stream will be available at:
   - HLS: `http://localhost:8088/hls/YOUR_STREAM_KEY.m3u8`

## Production Setup

### Update Environment Variables

Edit `backend/.env`:

```env
# Production URLs (update for your domain)
PUBLIC_RTMP_URL=rtmp://stream.yourdomain.com/live
PUBLIC_HLS_URL=http://stream.yourdomain.com/hls
```

### DNS Configuration

Point `stream.yourdomain.com` to your server's IP address.

### Firewall Rules

Open these ports:
- **1935** (TCP) - RTMP ingest
- **8088** (TCP) - HLS playback (or 80/443 with reverse proxy)

## Playback URLs

After streaming starts, listeners can access:

| Format | URL |
|--------|-----|
| HLS (recommended) | `http://localhost:8088/hls/STREAM_KEY.m3u8` |
| Direct RTMP | `rtmp://localhost:1935/live/STREAM_KEY` |

### Embed in HTML

```html
<video controls>
  <source src="http://localhost:8088/hls/YOUR_STREAM_KEY.m3u8" type="application/x-mpegURL">
</video>
```

Or use a player like HLS.js:

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="player"></video>
<script>
  const video = document.getElementById('player');
  const hls = new Hls();
  hls.loadSource('http://localhost:8088/hls/YOUR_STREAM_KEY.m3u8');
  hls.attachMedia(video);
</script>
```

## Troubleshooting

### Stream Not Starting

1. Check if RTMP server is running:
   ```bash
   docker-compose ps rtmp-server
   ```

2. Check logs:
   ```bash
   docker-compose logs rtmp-server
   ```

3. Verify OBS settings match your credentials exactly

### No Audio

1. In OBS, check Audio Mixer levels
2. Ensure audio sources are not muted
3. Check "Advanced Audio Properties" for correct routing

### High Latency

- HLS has 10-30 second latency by default
- For lower latency, consider using RTMP directly or WebRTC

### Stream Key Compromised

1. Go to Control Panel → OBS/RTMP tab
2. Click **Regenerate Stream Key**
3. Update OBS with the new key

## Security Best Practices

1. **Never share your stream key publicly**
2. Regenerate keys periodically
3. Use HTTPS for HLS playback in production
4. Consider IP whitelisting for RTMP ingest

## Files Modified

- `docker-compose.yml` - Added RTMP server service
- `nginx-rtmp.conf` - RTMP server configuration
- `backend/src/entities/channel.entity.ts` - Added streaming credentials
- `backend/src/channels/channels.service.ts` - Generate/regenerate stream keys
- `backend/src/channels/channels.controller.ts` - API endpoints for credentials
- `frontend/.../control-panel.component.ts` - OBS/RTMP UI panel
- `backend/.env` - RTMP configuration variables
