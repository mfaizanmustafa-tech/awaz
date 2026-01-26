# Control Panel State Persistence Fix

## Problem
When navigating away from the Control Panel page and returning, the page state would reset to default:
- Stream state would show "Off Air" instead of "LIVE"
- Selected show would be cleared
- Stream type would reset to HLS

This happened because React components lose their state when unmounted.

## Solution
Implemented localStorage persistence for critical state:

### 1. Stream State Persistence
- **Save**: When going live, save `awaz_is_live = 'true'` to localStorage
- **Restore**: On component mount, check localStorage and restore stream state
- **Clear**: When going off air, set `awaz_is_live = 'false'`

### 2. Selected Show Persistence
- **Save**: When selecting a show, save full show object to `awaz_current_show`
- **Restore**: After shows are loaded from API, find matching show by ID and restore selection
- **Clear**: When clicking "Change Show" button or going off air, remove from localStorage

### 3. Stream Type Persistence
- **Save**: When switching between HLS/Icecast, save to `awaz_stream_type`
- **Restore**: On component mount, restore stream type from localStorage

## Implementation Details

### localStorage Keys
```javascript
'awaz_is_live'        // 'true' or 'false'
'awaz_current_show'   // JSON stringified show object
'awaz_stream_type'    // 'hls' or 'icecast'
```

### State Restoration Flow
1. Component mounts
2. `useEffect` runs and calls `restoreState()`
3. Restore stream state and stream type immediately
4. Call `loadData()` to fetch channels and shows from API
5. After shows are loaded, find matching show by ID and restore selection
6. Component is now fully restored to previous state

### Key Changes

#### useEffect Hook
```javascript
useEffect(() => {
  const restoreState = () => {
    // Restore stream state
    const savedIsLive = localStorage.getItem('awaz_is_live');
    if (savedIsLive === 'true') {
      setStreamState('live');
    }
    
    // Restore stream type
    const savedStreamType = localStorage.getItem('awaz_stream_type');
    if (savedStreamType === 'hls' || savedStreamType === 'icecast') {
      setStreamType(savedStreamType);
    }
  };
  
  restoreState();
  loadData(); // This also restores selected show
}, []);
```

#### loadData Function
```javascript
// After loading shows from API
const savedShow = localStorage.getItem('awaz_current_show');
if (savedShow) {
  const savedShowData = JSON.parse(savedShow);
  const matchingShow = showsData.find(show => show.id === savedShowData.id);
  if (matchingShow) {
    setSelectedShow(matchingShow);
  }
}
```

#### handleGoLive Function
```javascript
// Save state when going live
setStreamState('live');
localStorage.setItem('awaz_is_live', 'true');
localStorage.setItem('awaz_current_show', JSON.stringify(selectedShow));
localStorage.setItem('awaz_stream_type', streamType);
```

#### Show Selection
```javascript
onClick={() => {
  setSelectedShow(show);
  localStorage.setItem('awaz_current_show', JSON.stringify(show));
}}
```

#### Change Show Button
```javascript
onClick={() => {
  setSelectedShow(null);
  localStorage.removeItem('awaz_current_show');
}}
```

#### Switch Stream Type
```javascript
setStreamType(type);
localStorage.setItem('awaz_stream_type', type);
```

## Testing

### Test Case 1: Go Live and Navigate Away
1. Select a show
2. Click "Go Live"
3. Navigate to another page (e.g., Shows)
4. Navigate back to Control Panel
5. **Expected**: Stream state is "LIVE", show is still selected, stream type is preserved

### Test Case 2: Change Show While Live
1. Go live with a show
2. Click "Change Show" button
3. Select a different show
4. Navigate away and back
5. **Expected**: New show is selected and persisted

### Test Case 3: Go Off Air
1. Go live with a show
2. Click "Off Air"
3. Navigate away and back
4. **Expected**: Stream state is "Off Air", show is cleared

### Test Case 4: Switch Stream Type
1. Switch from HLS to Icecast
2. Navigate away and back
3. **Expected**: Icecast is still selected

## Benefits
- ✅ Seamless user experience - state persists across navigation
- ✅ Stream continues running even when navigating away
- ✅ No need to re-select show after returning to page
- ✅ Stream type preference is remembered
- ✅ Proper cleanup when going off air or changing shows

## Files Modified
- `admin-react/src/app/main/station-owner/control-panel/ControlPanelPage.js`

## Date
January 26, 2026
