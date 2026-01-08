# ✅ Streaming Checklist - Horror Vibes

Print this or keep it open while setting up your stream!

---

## Pre-Streaming Setup

### System Check
- [ ] Backend running: `http://localhost:3000` ✅
- [ ] Frontend running: `http://localhost:4200` ✅
- [ ] MySQL database running ✅
- [ ] Logged in as Station Owner ✅

### Content Ready
- [ ] Show created: "Horror Vibes" ✅
- [ ] Performer assigned ✅
- [ ] Audio file ready (MP3/WAV/OGG)
- [ ] Audio file size < 50MB
- [ ] Audio file tested (plays on your computer)

---

## Station Owner: Upload & Stream

### Upload Audio
- [ ] Navigate to `http://localhost:4200/station-owner`
- [ ] Click "Shows" section
- [ ] Find "Horror Vibes" show
- [ ] Click "Upload Audio" or "Add Track"
- [ ] Select audio file
- [ ] Click "Upload" button
- [ ] Wait for success message
- [ ] Verify track appears in list

### Start Streaming
- [ ] Find uploaded track in show details
- [ ] Click "Play" or "Stream" button
- [ ] Select channel/stream to broadcast on
- [ ] Click "Go Live" or "Start Streaming"
- [ ] Verify 🔴 LIVE indicator appears
- [ ] Check stream status shows "active"

### Verify Stream
- [ ] Stream URL is set
- [ ] No error messages
- [ ] Listener count shows "0" (waiting for listeners)

---

## End User: Listen

### Access Stream
- [ ] Log out from Station Owner account
- [ ] Log in as End User (or register)
- [ ] Navigate to `http://localhost:4200/dashboard`
- [ ] Click "Browse Channels" or "Live Now"
- [ ] Find your station's channel
- [ ] Look for 🔴 LIVE indicator

### Play Audio
- [ ] Click on channel card
- [ ] Click "Listen" or "Play" button
- [ ] Audio starts playing
- [ ] Volume control works
- [ ] Play/pause works

### Verify Playback
- [ ] Audio quality is good
- [ ] No buffering issues
- [ ] Can adjust volume
- [ ] Can pause/resume

---

## Troubleshooting Quick Checks

### If Upload Fails:
- [ ] Check: `ls -la backend/uploads/audio-tracks/`
- [ ] Check: File permissions (755)
- [ ] Check: Disk space available
- [ ] Check: Backend logs for errors

### If Stream Doesn't Start:
- [ ] Check: Channel status is "approved"
- [ ] Check: Stream exists for channel
- [ ] Check: Audio track ID is valid
- [ ] Check: Backend API responds

### If Can't Hear Audio:
- [ ] Check: Browser console (F12) for errors
- [ ] Check: Stream URL in network tab
- [ ] Check: File exists in uploads folder
- [ ] Check: Volume not muted
- [ ] Check: Correct audio format

---

## Success Indicators

### Station Owner Side:
```
✅ Track uploaded: horror-theme.mp3
✅ Stream status: 🔴 LIVE
✅ Listeners: 1 (when end user connects)
✅ No errors in console
```

### End User Side:
```
✅ Channel visible in list
✅ 🔴 LIVE indicator showing
✅ Audio playing
✅ Controls working
```

---

## Quick Commands

### Check Backend Status:
```bash
curl http://localhost:3000/channels
```

### Check Uploaded Files:
```bash
ls -la backend/uploads/audio-tracks/
```

### Check Database:
```bash
node reset-user-password.js --list
```

### Restart Services:
```bash
# Backend
cd backend && npm run start:dev

# Frontend
cd frontend && npm start
```

---

## Timeline

### Estimated Time:
- Upload audio: **1-2 minutes**
- Start streaming: **30 seconds**
- End user connects: **30 seconds**
- **Total: ~3 minutes** ⏱️

---

## Notes Section

Use this space to write down:
- Track ID: _______________
- Stream ID: _______________
- Channel ID: _______________
- Issues encountered: _______________
- Solutions tried: _______________

---

## Next Steps After Success

Once streaming works:
- [ ] Test with multiple end users
- [ ] Upload more audio tracks
- [ ] Create playlist
- [ ] Check analytics
- [ ] Monitor listener count
- [ ] Test on mobile device
- [ ] Share stream link with friends

---

**Date:** _______________  
**Time Started:** _______________  
**Time Completed:** _______________  
**Status:** ⬜ In Progress  ⬜ Success  ⬜ Need Help

---

**Good luck with your Horror Vibes stream! 🎃👻🎵**
