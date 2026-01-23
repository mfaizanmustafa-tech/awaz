# Testing Metadata Real-Time Updates

## Quick Test Guide

### Prerequisites
1. Backend server running on `http://localhost:3000`
2. Frontend server running on `http://localhost:4200`
3. Icecast server running on `http://localhost:8000`
4. Butt (broadcasting software) configured and streaming to Icecast

### Test Steps

#### 1. Start the Station Owner Dashboard
1. Open browser and go to `http://localhost:4200`
2. Login as station owner (email: `station@gmail.com`)
3. Navigate to Control Panel
4. Click "Go Live" to start streaming
5. Select a show from the "Available Shows" list
6. Note the show title and host name displayed

#### 2. Open the User Dashboard
1. Open a **new browser tab or window** (or use incognito mode)
2. Go to `http://localhost:4200`
3. Login as a regular user (or guest)
4. Find the station in the list (e.g., "FM Islamabad")
5. Click on the station to select it
6. Click the play button to start listening

#### 3. Test Real-Time Metadata Updates
1. **Keep both tabs visible** (side by side if possible)
2. In the **Station Owner Dashboard**, select a different show from the list
3. **Watch the User Dashboard** - it should update immediately with:
   - New show title
   - New host name (e.g., "RJ faizan" instead of "Station Host")
   - New show type icon/badge

#### 4. Verify in Browser Console
Open the browser console (F12) on the **User Dashboard** tab and look for these logs:

```
📝 Metadata update received: {showTitle: "Sports Talk", hostName: "faizan", hostStageName: "RJ faizan", showType: "sports", ...}
📝 Updating selected station: FM Islamabad
🔄 updateStationMetadata called for: FM Islamabad
📦 Metadata data received: {showTitle: "Sports Talk", hostName: "faizan", ...}
✅ Current show exists: {...}
✅ Updated show title: "Old Title" → "Sports Talk"
✅ Updated host: "Station Host" → "RJ faizan"
📝 Full host object: {stageName: "RJ faizan", name: "faizan"}
✅ Updated show type: "music" → "sports"
🎯 Final station.currentShow state: {...}
✅ Change detection triggered, UI should update now
```

### Expected Results

✅ **Show title updates immediately** when station owner changes show
✅ **Host name updates immediately** (e.g., "RJ faizan" instead of "Station Host")
✅ **Show type updates immediately** (e.g., "Sports" instead of "Music")
✅ **No page refresh required**
✅ **Updates happen within 1-2 seconds** of show selection

### Troubleshooting

#### If metadata doesn't update:

1. **Check WebSocket connection**:
   - Look for `✅ User Dashboard: WebSocket connected` in console
   - If not connected, check backend is running

2. **Check if stream is live**:
   - Station owner must click "Go Live" before metadata updates work
   - Look for "Stream is live, sending metadata update..." in station owner console

3. **Check browser console for errors**:
   - Look for any red error messages
   - Check if WebSocket events are being received

4. **Verify Icecast is streaming**:
   - Open `http://localhost:8000/stream` in browser
   - Should play audio

5. **Check backend logs**:
   - Look for `Metadata updated for channel ...` messages
   - Verify WebSocket gateway is broadcasting events

### Additional Tests

#### Test Multiple Users
1. Open 3+ browser tabs with user dashboard
2. All should receive metadata updates simultaneously
3. Verify listener count updates in real-time

#### Test Show Switching
1. Switch between multiple shows rapidly
2. Verify each update is reflected correctly
3. No stale data should remain

#### Test Stream Stop/Start
1. Stop the stream (Go Off Air)
2. Start again (Go Live)
3. Select a show
4. Verify metadata updates work after restart

## What Was Fixed

### Before Fix
- Metadata was sent via WebSocket ✅
- Metadata was received by frontend ✅
- Component state was updated ✅
- **UI did not update** ❌ (required hard refresh)

### After Fix
- Metadata is sent via WebSocket ✅
- Metadata is received by frontend ✅
- Component state is updated ✅
- **UI updates immediately** ✅ (no refresh needed)

### Technical Details
The fix involved wrapping the metadata update logic in `NgZone.run()` to ensure Angular's change detection is triggered when WebSocket events update the component state. This is necessary because WebSocket events happen outside of Angular's zone.

## Files Modified
- `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`

## Documentation
See `METADATA_REALTIME_UPDATE_FIX.md` for detailed technical documentation.
