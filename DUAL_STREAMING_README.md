# 🎙️ Dual Streaming System

## Quick Overview

Awaz Pulse now supports **two streaming methods**:

| Method | Latency | Best For | Compatibility |
|--------|---------|----------|---------------|
| **HLS** | 10-30s | Web/Mobile listeners | ⭐⭐⭐⭐⭐ Excellent |
| **Icecast** | 2-5s | Live shows, real-time | ⭐⭐⭐⭐ Good |

---

## 🚀 Quick Start

### 1. Start Services
```bash
docker-compose up -d
```

### 2. Run Migration
```bash
node backend/migration-scripts/add-stream-type-support.js
```

### 3. Access Control Panel
```
http://localhost:4200/station-owner/control-panel
```

### 4. Choose Your Method
- Click **HLS Streaming** for better compatibility
- Click **Direct Stream (Icecast)** for lower latency

### 5. Start Broadcasting
- **HLS**: Use OBS Studio
- **Icecast**: Use BUTT or OBS

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DUAL_STREAMING_SYSTEM.md](DUAL_STREAMING_SYSTEM.md) | Complete technical documentation |
| [DUAL_STREAMING_QUICK_START.md](DUAL_STREAMING_QUICK_START.md) | Quick setup guide |
| [DUAL_STREAMING_IMPLEMENTATION_SUMMARY.md](DUAL_STREAMING_IMPLEMENTATION_SUMMARY.md) | Implementation details |
| [DUAL_STREAMING_CHECKLIST.md](DUAL_STREAMING_CHECKLIST.md) | Testing and deployment checklist |

---

## 🎯 Key Features

✅ **One-Click Switching** - Switch between HLS and Icecast instantly
✅ **Auto-Stop** - Previous stream stops automatically when switching
✅ **Dual Credentials** - Separate credentials for each method
✅ **Setup Guides** - Built-in guides for OBS and BUTT
✅ **Copy-to-Clipboard** - Easy credential copying
✅ **Visual Feedback** - Clear indication of active method

---

## 🔧 Ports

- **1935** - RTMP ingest (HLS)
- **8088** - HLS playback
- **8000** - Icecast streaming
- **3000** - Backend API
- **4200** - Frontend

---

## 🧪 Test Playback

### HLS
```bash
vlc http://localhost:8088/hls/[channel-id].m3u8
```

### Icecast
```bash
vlc http://localhost:8000/[channel-id].mp3
```

---

## 💡 When to Use Each Method

### Use HLS When:
- Broadcasting to web/mobile users
- Need adaptive bitrate
- Want recording features
- Latency is not critical

### Use Icecast When:
- Hosting live talk shows
- Need real-time listener interaction
- Using traditional radio apps
- Lower latency is important

---

## 🐛 Troubleshooting

### Services Not Running?
```bash
docker-compose restart
docker ps
```

### Can't Switch Methods?
1. Stop your broadcasting software
2. Wait 10 seconds
3. Try again

### Stream Not Working?
```bash
# Check logs
docker logs awaz-pulse-icecast
docker logs awaz-pulse-rtmp
docker logs awaz-pulse-backend
```

---

## 📞 Need Help?

1. Check [DUAL_STREAMING_SYSTEM.md](DUAL_STREAMING_SYSTEM.md) for detailed docs
2. Review [DUAL_STREAMING_QUICK_START.md](DUAL_STREAMING_QUICK_START.md) for setup
3. See [DUAL_STREAMING_CHECKLIST.md](DUAL_STREAMING_CHECKLIST.md) for testing

---

## ✨ What's New

### Added
- Icecast server integration
- Stream type selector in control panel
- Dual credentials system
- Setup guides for both methods
- Auto-stop when switching
- Database migration script

### Modified
- Stream entity (added streamType field)
- Control panel UI
- Stream manager service
- Docker compose configuration

---

**Version:** 1.0.0  
**Status:** ✅ Ready for Production  
**Last Updated:** January 2026
