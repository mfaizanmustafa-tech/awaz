# Dual Streaming System - HLS & Icecast

## Overview

Awaz Pulse now supports **two streaming methods** that station owners can choose from:

1. **HLS (HTTP Live Streaming)** - Modern, browser-compatible streaming
2. **Icecast Direct Streaming** - Low-latency, traditional radio streaming

Only one method can be active at a time per channel. When you switch methods, the system automatically stops the previous stream.

---

## Streaming Methods Comparison

### HLS Streaming (Default)

**Best For:**
- Web browser listeners
- Mobile app users
- Modern streaming platforms
- Adaptive bitrate streaming

**Advantages:**
- ✅ Works in all modern browsers without plugins
- ✅ Better compatibility across devices
- ✅ Adaptive bitrate (adjusts to connection speed)
- ✅ Industry standard (YouTube, Twitch use this)
- ✅ Better handling of network interruptions

**Disadvantages:**
- ❌ Higher latency (10-30 seconds)
- ❌ More server processing required
- ❌ Creates multiple chunk files

**Technical Details:**
- Protocol: RTMP → HLS conversion
- Format: .m3u8 playlist + .ts chunks
- Latency: 10-30 seconds
- Port: 1935 (RTMP), 8088 (HLS playback)

---

### Icecast Direct Streaming

**Best For:**
- Live talk shows and interviews
- Real-time interaction with listeners
- Traditional radio apps
- Lower latency requirements

**Advantages:**
- ✅ Much lower latency (2-5 seconds)
- ✅ Simpler setup
- ✅ Less server processing
- ✅ Works with traditional radio apps
- ✅ Single continuous stream

**Disadvantages:**
- ❌ May require plugins in some browsers
- ❌ No adaptive bitrate
- ❌ Less resilient to network issues
- ❌ Harder to implement DVR/rewind features

**Technical Details:**
- Protocol: Icecast/Shoutcast
- Format: MP3/AAC continuous stream
- Latency: 2-5 seconds
- Port: 8000

---

## How to Use

### Switching Between Methods

1. Go to **Station Owner Dashboard → Control Panel**
2. Select your channel
3. In the **Streaming Method** card, choose:
   - **HLS Streaming** for better compatibility
   - **Direct Stream (Icecast)** for lower latency
4. Click your preferred method
5. The system will automatically:
   - Stop any active stream
   - Switch to the new method
   - Generate new credentials

### Setting Up HLS Streaming

**Software Needed:** OBS Studio

1. Download OBS from [obsproject.com](https://obsproject.com)
2. Open OBS → Settings → Stream
3. Select "Custom..." service
4. Copy credentials from control panel:
   - **Server URL**: `rtmp://localhost:1935/live`
   - **Stream Key**: Your unique channel key
5. Add audio source (Sources → Audio Input Capture)
6. Click "Start Streaming"

**Playback URL:** `http://localhost:8088/hls/[channel-id].m3u8`

### Setting Up Icecast Streaming

**Software Needed:** BUTT (Broadcast Using This Tool) or OBS

#### Using BUTT (Recommended for Icecast):

1. Download BUTT from [danielnoethen.de/butt](https://danielnoethen.de/butt/)
2. Open BUTT → Settings
3. Main → Add → Icecast
4. Copy credentials from control panel:
   - **Server**: `localhost`
   - **Port**: `8000`
   - **Mount Point**: `/[channel-id].mp3`
   - **Password**: `awaz_source_2024`
5. Audio → Select your microphone
6. Click "Play" to start streaming

#### Using OBS with Icecast:

1. Open OBS → Settings → Stream
2. Select "Custom..." service
3. Server: `icecast://source:awaz_source_2024@localhost:8000/[channel-id].mp3`
4. Add audio source
5. Start streaming

**Playback URL:** `http://localhost:8000/[channel-id].mp3`

---

## Architecture

### System Flow

```
Station Owner's Audio Source
           ↓
    [Broadcasting Software]
    (OBS / BUTT / etc.)
           ↓
    ┌──────┴──────┐
    ↓             ↓
[RTMP Server] [Icecast Server]
    ↓             ↓
[HLS Chunks]  [Direct Stream]
    ↓             ↓
 Listeners     Listeners
```

### Docker Services

```yaml
services:
  rtmp-server:
    - Port 1935: RTMP ingest
    - Port 8088: HLS playback
    
  icecast:
    - Port 8000: Icecast streaming
```

### Database Schema

The `streams` table now includes:
- `streamType`: 'hls' or 'icecast'
- `icecastMountPoint`: Mount point for Icecast streams
- Each channel can have multiple stream entries (one per type)

---

## API Endpoints

### Switch Stream Type
```http
POST /streams/channel/:channelId/switch-type
Body: { "streamType": "hls" | "icecast" }
```

### Get Credentials
```http
GET /streams/channel/:channelId/credentials?streamType=hls
GET /streams/channel/:channelId/credentials?streamType=icecast
```

### Get Active Stream Type
```http
GET /streams/channel/:channelId/active-type
```

---

## Configuration

### Icecast Server Settings

Default credentials (can be changed in docker-compose.yml):
- **Source Password**: `awaz_source_2024`
- **Relay Password**: `awaz_relay_2024`
- **Admin Password**: `awaz_admin_2024`
- **Max Clients**: 1000
- **Max Sources**: 50

### RTMP Server Settings

Configured in `nginx-rtmp.conf`:
- **RTMP Port**: 1935
- **HLS Port**: 8088
- **Chunk Duration**: 2 seconds
- **Playlist Length**: 3 chunks

---

## Troubleshooting

### HLS Stream Not Working

1. Check if RTMP server is running: `docker ps | grep rtmp`
2. Verify OBS is connected (green indicator)
3. Check HLS files are being created: `ls -la /tmp/hls/`
4. Test playback URL in VLC or browser

### Icecast Stream Not Working

1. Check if Icecast is running: `docker ps | grep icecast`
2. Verify credentials are correct
3. Check Icecast admin panel: `http://localhost:8000/admin/`
4. Test playback URL in VLC or browser

### Stream Switching Issues

1. Ensure previous stream is stopped before switching
2. Wait 5-10 seconds after switching
3. Reload credentials after switching
4. Check browser console for errors

---

## Best Practices

### When to Use HLS:
- Web-based listeners
- Mobile app users
- Need adaptive bitrate
- Recording/DVR features needed

### When to Use Icecast:
- Live talk shows
- Real-time listener interaction
- Traditional radio apps
- Lower latency is critical

### General Tips:
- Test both methods before going live
- Keep credentials secure
- Monitor listener counts
- Use appropriate bitrate (128-320 kbps)
- Have a backup streaming method ready

---

## Future Enhancements

Planned features:
- [ ] Low-Latency HLS (LL-HLS) support
- [ ] WebRTC streaming (sub-second latency)
- [ ] Automatic failover between methods
- [ ] Stream quality monitoring
- [ ] Bandwidth usage analytics
- [ ] Multi-bitrate streaming

---

## Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check Docker logs: `docker logs awaz-pulse-rtmp` or `docker logs awaz-pulse-icecast`
4. Contact system administrator

---

**Last Updated:** January 2026
**Version:** 1.0.0
