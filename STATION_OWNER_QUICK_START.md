# Station Owner Dashboard - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Backend running on `http://localhost:3000`
- React admin running on `http://localhost:3001`
- Station owner user account

### Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - React Admin
cd admin-react
npm start
```

## 🔐 Login

1. Go to `http://localhost:3001`
2. Login with station_owner credentials
3. You'll be redirected to `/station-owner/overview`

## 📍 Navigation

Access these pages from the sidebar:

| Page | URL | Purpose |
|------|-----|---------|
| **Overview** | `/station-owner/overview` | Dashboard with metrics and quick actions |
| **Control Panel** | `/station-owner/control-panel` | Live streaming controls and broadcast management |
| **My Channel** | `/station-owner/my-channel` | Channel settings and information |
| **Shows** | `/station-owner/shows` | Manage radio shows and programs |
| **Hosts** | `/station-owner/performers` | Manage hosts and performers |
| **Guests** | `/station-owner/guests` | Manage show guests |
| **Analytics** | `/station-owner/analytics` | Performance metrics and insights |

## 🎙️ How to Go Live

### Method 1: OBS / RTMP Streaming (Recommended)

1. Go to **Control Panel**
2. Select "OBS / RTMP Stream" as source
3. Click "View Full Details" to see credentials:
   - **RTMP Server**: `rtmp://localhost:1935/live`
   - **Stream Key**: Your unique key
4. Configure OBS Studio:
   - Settings → Stream
   - Service: Custom
   - Server: (paste RTMP server)
   - Stream Key: (paste your key)
5. Click "Start Streaming" in OBS
6. Click "Go Live" in Control Panel

### Method 2: External Stream URL

1. Go to **Control Panel**
2. Select "External Stream URL"
3. Enter your stream URL (e.g., `https://example.com/stream.m3u8`)
4. Select a show (optional)
5. Click "Go Live"

### Method 3: Media Files (Autopilot)

1. Go to **Control Panel**
2. Select "Media Files (Autopilot)"
3. Click "Upload Files" to add audio tracks
4. Select tracks to play
5. Click "Go Live"

## 📊 Quick Actions

### Create a Show
1. Go to **Shows** page
2. Click "Create Show"
3. Fill in:
   - Title
   - Type (Live/Recorded/Podcast)
   - Scheduled time
   - Description
4. Click "Create"

### Add a Host
1. Go to **Hosts** page
2. Click "Add Host"
3. Fill in:
   - Name and stage name
   - Type (Host/DJ/Producer)
   - Experience years
4. Click "Add"

### Add a Guest
1. Go to **Guests** page
2. Click "Add Guest"
3. Fill in:
   - Name and display name
   - Type (Expert/Celebrity/Caller)
   - Contact info
4. Click "Add"

### Edit Channel Info
1. Go to **My Channel** page
2. Click "Edit Channel"
3. Update information
4. Click "Save Changes"

## 📈 View Analytics

1. Go to **Analytics** page
2. Select time range (Daily/Weekly/Monthly)
3. View metrics:
   - Total listeners
   - Likes and engagement
   - Comments
   - Show ratings

## 🎛️ Control Panel Features

### Stream Controls
- **Go Live**: Start broadcasting
- **Pause**: Temporarily pause stream
- **Stop Stream**: End broadcast

### Audio Controls
- **Microphone**: Toggle mic on/off
- **Volume**: Adjust output volume (0-100)

### Live Stats
- Current listeners count
- Stream quality
- Uptime duration

## 🔧 Common Tasks

### Upload Audio Files
1. Control Panel → Select "Media Files"
2. Click "Upload Files"
3. Select MP3 files
4. Files appear in Media Library

### Copy RTMP Credentials
1. Control Panel → Select "OBS / RTMP Stream"
2. Click copy icon next to Server URL or Stream Key
3. Paste in OBS or streaming software

### Schedule a Show
1. Shows → Create Show
2. Set "Scheduled Start Time"
3. Add hosts/performers
4. Save show

### Monitor Performance
1. Overview → View dashboard metrics
2. Analytics → Detailed insights
3. Control Panel → Live stats

## 🎨 UI Features

### Cards & Metrics
- Animated metric cards on Overview
- Color-coded status chips
- Trend indicators with percentages

### Tables
- Sortable columns
- Action buttons (Edit/Delete)
- Pagination (coming soon)

### Dialogs
- Modal forms for create/edit
- Form validation
- Cancel/Save actions

### Responsive Design
- Mobile-friendly layouts
- Adaptive grid system
- Touch-friendly controls

## 🐛 Troubleshooting

### Can't see Station Owner menu?
- Verify your user has `station_owner` role
- Logout and login again
- Check browser console for errors

### API calls failing?
- Ensure backend is running on port 3000
- Check JWT token is valid
- Verify CORS settings

### Streaming not working?
- Check RTMP server is running
- Verify stream credentials
- Test with OBS Studio first

### Pages not loading?
- Clear browser cache
- Check React dev server is running
- Look for console errors

## 📱 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick search (coming soon) |
| `Esc` | Close dialogs |
| `Tab` | Navigate form fields |

## 💡 Tips & Best Practices

1. **Before Going Live**:
   - Test your stream with OBS
   - Check audio levels
   - Select the right show
   - Verify channel status

2. **Content Management**:
   - Create shows in advance
   - Add hosts before scheduling
   - Keep guest list updated
   - Upload media files beforehand

3. **Analytics**:
   - Check daily for trends
   - Monitor listener growth
   - Track show performance
   - Adjust based on insights

4. **Channel Settings**:
   - Keep description updated
   - Use accurate category
   - Maintain contact info
   - Update streaming credentials

## 🎯 Next Steps

1. ✅ Complete your channel profile
2. ✅ Create your first show
3. ✅ Add hosts and guests
4. ✅ Upload some media files
5. ✅ Test streaming with OBS
6. ✅ Go live!
7. ✅ Monitor analytics

## 📞 Support

Need help? Check:
- `STATION_OWNER_REACT_MIGRATION.md` - Full documentation
- Backend API docs
- React admin documentation
- Console logs for errors

---

**Happy Broadcasting! 🎙️📻**
