# 🎵 Quick Streaming Guide - Horror Vibes Show

## Simple 3-Step Process

---

## 📍 You Are Here
✅ You've created a performer  
✅ You've created a show called "Horror Vibes"  
🎯 **Next:** Upload audio and start streaming

---

## Step 1: Upload Audio File (Station Owner)

### On Station Owner Dashboard (`http://localhost:4200/station-owner`)

1. **Find Your Show Section**
   - Look for "Shows" or "My Shows" tab
   - Click on "Horror Vibes" show

2. **Upload Audio**
   - Look for "Upload Audio" or "Add Track" button
   - Click "Choose File" or drag-and-drop
   - Select an MP3, WAV, or OGG file
   - Click "Upload"
   - Wait for success message

**What you'll see:**
```
✅ Track uploaded successfully!
📁 Filename: horror-theme.mp3
⏱️ Duration: 3:45
```

---

## Step 2: Start Streaming (Station Owner)

### Option A: From Show Details

1. After uploading, you'll see your track listed
2. Click **"Play"** or **"Stream This Track"** button
3. Select which stream/channel to broadcast on
4. Click **"Go Live"**

### Option B: From Channel Management

1. Go to **"Channels"** section
2. Find your channel
3. Click **"Manage Streams"**
4. Select a stream
5. Click **"Select Audio Track"**
6. Choose "horror-theme.mp3"
7. Click **"Start Streaming"**

**What you'll see:**
```
🔴 LIVE - Broadcasting on Stream 1
👥 0 listeners
📡 Stream URL: Active
```

---

## Step 3: Listen as End User

### On End User Dashboard (`http://localhost:4200/dashboard`)

1. **Log out** from Station Owner account
2. **Log in** as End User (or register new account)
3. **Browse Channels**
   - Look for "Browse Channels" or "Live Now"
   - Find your station's channel
   - Look for 🔴 LIVE indicator

4. **Play Stream**
   - Click on the channel card
   - Click **"Listen"** or **"Play"** button
   - Audio should start playing!

**What you'll see:**
```
🎵 Now Playing: Horror Vibes
🎤 Performer: [Your Performer Name]
⏯️ [Play/Pause] 🔊 [Volume]
```

---

## 🎯 Quick Test

### Test if Everything Works:

```bash
# 1. Check if audio file was uploaded
ls -la backend/uploads/audio-tracks/

# 2. Check database for your track
node reset-user-password.js --list
# (This shows users, but you can modify it to show tracks)

# 3. Test stream URL directly in browser
# Open: http://localhost:3000/audio-tracks/TRACK_ID/stream
# (Replace TRACK_ID with your actual track ID)
```

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: "Upload button not visible"

**Fix:**
- Make sure you're logged in as Station Owner
- Refresh the page (Ctrl+Shift+R)
- Check if you've selected a show first

### Issue 2: "Audio not playing"

**Fix:**
```bash
# Check if backend is running
curl http://localhost:3000/channels

# Check if file exists
ls backend/uploads/audio-tracks/

# Check browser console (F12) for errors
```

### Issue 3: "Can't find the channel as end user"

**Fix:**
- Make sure channel status is "approved" (not "pending")
- Check if stream is marked as "active"
- Verify you're logged in as end user (not station owner)

---

## 📱 UI Locations

### Station Owner Dashboard:
```
┌─────────────────────────────────────┐
│  Awaz Pulse - Station Owner         │
├─────────────────────────────────────┤
│  📊 Overview                         │
│  📡 Channels                         │
│  🎭 Shows  ← YOU ARE HERE           │
│  👥 Performers                       │
│  📈 Analytics                        │
└─────────────────────────────────────┘

Shows Section:
┌─────────────────────────────────────┐
│  Horror Vibes                        │
│  Status: Scheduled                   │
│  Performer: [Name]                   │
│                                      │
│  [Upload Audio] [Edit] [Delete]     │
│                                      │
│  Uploaded Tracks:                    │
│  🎵 horror-theme.mp3 [Play] [Delete]│
└─────────────────────────────────────┘
```

### End User Dashboard:
```
┌─────────────────────────────────────┐
│  Awaz Pulse - Discover              │
├─────────────────────────────────────┤
│  🏠 Home                             │
│  📻 Browse Channels                  │
│  🔴 Live Now                         │
│  ⭐ Favorites                        │
└─────────────────────────────────────┘

Live Channels:
┌─────────────────────────────────────┐
│  🔴 [Your Station Name]              │
│  📍 [City]                           │
│  🎵 Now Playing: Horror Vibes        │
│  👥 0 listeners                      │
│                                      │
│  [▶️ Listen Now]                     │
└─────────────────────────────────────┘
```

---

## 🎬 Video Tutorial (Text Version)

### Recording 1: Upload Audio
```
1. Click "Shows" tab
2. Click "Horror Vibes"
3. Scroll to "Audio Tracks" section
4. Click "Upload Audio"
5. Select file: horror-theme.mp3
6. Click "Upload"
7. See success message
```

### Recording 2: Start Streaming
```
1. Click uploaded track
2. Click "Stream This"
3. Select channel/stream
4. Click "Go Live"
5. See "🔴 LIVE" indicator
```

### Recording 3: Listen as User
```
1. Log out
2. Log in as end user
3. Click "Browse Channels"
4. Find your channel (look for 🔴)
5. Click "Listen"
6. Enjoy the audio!
```

---

## 💡 Pro Tips

1. **Test with short audio first** (30 seconds) to verify everything works
2. **Use MP3 format** for best compatibility
3. **Check file size** - keep under 50MB for smooth streaming
4. **Monitor listeners** in real-time on station owner dashboard
5. **Check analytics** after streaming to see engagement

---

## 🆘 Still Stuck?

### Debug Checklist:
- [ ] Backend running on port 3000?
- [ ] Frontend running on port 4200?
- [ ] Logged in as correct user type?
- [ ] Channel status is "approved"?
- [ ] Audio file uploaded successfully?
- [ ] Stream status is "active"?
- [ ] Browser console shows no errors?

### Get More Help:
- Check `AUDIO_STREAMING_GUIDE.md` for detailed technical info
- Check backend logs in terminal
- Check browser console (F12)
- Verify database records

---

**Ready to stream? Let's go! 🎉**
