# Dual Streaming Quick Start Guide

## 🚀 Setup (One-Time)

### 1. Start the Servers

```bash
# Start all services including Icecast
docker-compose up -d

# Verify services are running
docker ps
```

You should see:
- `awaz-pulse-rtmp` (HLS streaming)
- `awaz-pulse-icecast` (Direct streaming)
- `awaz-pulse-backend`
- `awaz-pulse-mysql`

### 2. Run Database Migration

```bash
# Add stream type support to database
node backend/migration-scripts/add-stream-type-support.js
```

### 3. Access the Control Panel

```
http://localhost:4200/station-owner/control-panel
```

---

## 🎙️ Quick Streaming Guide

### Option 1: HLS Streaming (Better Compatibility)

**When to use:** Web listeners, mobile apps, need recording features

1. **Select HLS in Control Panel**
   - Click "HLS Streaming" button
   - Wait for credentials to load

2. **Setup OBS**
   - Download: https://obsproject.com
   - Settings → Stream → Custom
   - Copy Server URL and Stream Key from control panel
   - Add Audio Input Capture source
   - Click "Start Streaming"

3. **Test Playback**
   ```
   http://localhost:8088/hls/[your-channel-id].m3u8
   ```

**Latency:** 10-30 seconds

---

### Option 2: Icecast Streaming (Lower Latency)

**When to use:** Live talk shows, real-time interaction

1. **Select Icecast in Control Panel**
   - Click "Direct Stream (Icecast)" button
   - Wait for credentials to load

2. **Setup BUTT**
   - Download: https://danielnoethen.de/butt/
   - Settings → Add → Icecast
   - Server: `localhost`
   - Port: `8000`
   - Mount Point: Copy from control panel
   - Password: `awaz_source_2024`
   - Select your microphone
   - Click "Play"

3. **Test Playback**
   ```
   http://localhost:8000/[your-channel-id].mp3
   ```

**Latency:** 2-5 seconds

---

## 🔄 Switching Between Methods

1. Go to Control Panel
2. Click the streaming method you want
3. System automatically:
   - Stops current stream
   - Switches to new method
   - Generates new credentials
4. Update your broadcasting software
5. Start streaming again

**Note:** Only one method can be active at a time per channel.

---

## 🧪 Testing

### Test HLS Stream
```bash
# Using VLC
vlc http://localhost:8088/hls/[channel-id].m3u8

# Using ffplay
ffplay http://localhost:8088/hls/[channel-id].m3u8
```

### Test Icecast Stream
```bash
# Using VLC
vlc http://localhost:8000/[channel-id].mp3

# Using ffplay
ffplay http://localhost:8000/[channel-id].mp3

# Using curl (check if stream is live)
curl -I http://localhost:8000/[channel-id].mp3
```

---

## 📊 Monitoring

### Check Icecast Status
```
http://localhost:8000/admin/
Username: admin
Password: awaz_admin_2024
```

### Check Docker Logs
```bash
# RTMP/HLS logs
docker logs awaz-pulse-rtmp

# Icecast logs
docker logs awaz-pulse-icecast

# Backend logs
docker logs awaz-pulse-backend
```

---

## 🐛 Troubleshooting

### Stream Not Working?

1. **Check if services are running**
   ```bash
   docker ps
   ```

2. **Restart services**
   ```bash
   docker-compose restart rtmp-server icecast
   ```

3. **Check credentials**
   - Reload control panel
   - Click "Load" button to refresh credentials

4. **Test with VLC**
   - Open playback URL in VLC
   - Check for errors

### Can't Switch Methods?

1. Stop your broadcasting software first
2. Wait 10 seconds
3. Try switching again
4. Check browser console for errors

---

## 💡 Tips

- **HLS**: Best for web/mobile, higher latency
- **Icecast**: Best for live shows, lower latency
- Test both methods to see which works better for you
- Keep credentials secure
- Use 128-320 kbps audio bitrate
- Monitor listener counts in control panel

---

## 📚 More Information

- Full documentation: `DUAL_STREAMING_SYSTEM.md`
- OBS Guide: https://obsproject.com/wiki/
- BUTT Guide: https://danielnoethen.de/butt/manual.html
- Icecast Docs: https://icecast.org/docs/

---

**Need Help?** Check the full documentation or contact your system administrator.
