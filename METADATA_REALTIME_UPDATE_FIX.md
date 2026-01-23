# Metadata Real-Time Update Fix

## Problem
The user dashboard was not updating the host name and show metadata in real-time when the station owner changed the show from the control panel. The metadata was being sent via WebSocket and received by the frontend, but the UI was not reflecting the changes until a hard refresh.

## Root Cause
Angular's change detection was not being triggered when WebSocket events updated the component state. This is a common issue with asynchronous operations that happen outside of Angular's zone.

## Solution Implemented

### 1. Added NgZone and ChangeDetectorRef
**File**: `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`

- Imported `NgZone` and `ChangeDetectorRef` from `@angular/core`
- Injected both services into the component constructor

```typescript
import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';

constructor(
  private authService: AuthService,
  private http: HttpClient,
  private websocketService: WebSocketService,
  private hlsPlayerService: HlsPlayerService,
  private ngZone: NgZone,
  private cdr: ChangeDetectorRef
) { ... }
```

### 2. Wrapped Metadata Updates in NgZone.run()
Wrapped the metadata subscription callback in `ngZone.run()` to ensure Angular's change detection is triggered:

```typescript
const metadataSub = this.websocketService.metadataUpdate$.subscribe(data => {
  console.log('📝 Metadata update received:', data);
  
  // Wrap in NgZone to ensure Angular change detection runs
  this.ngZone.run(() => {
    // Update the currently playing/selected station
    if (this.selectedStation) {
      console.log('📝 Updating selected station:', this.selectedStation.name);
      this.updateStationMetadata(this.selectedStation, data);
    }
    
    // Also update the station in the main list
    const stationInList = this.channels.find((s: Channel) => s.id === this.currentlyPlaying);
    if (stationInList && stationInList.id !== this.selectedStation?.id) {
      console.log('📝 Updating station in list:', stationInList.name);
      this.updateStationMetadata(stationInList, data);
    }
    
    // Also update in channels array
    const channelInList = this.channels.find(c => c.id === this.selectedStation?.id);
    if (channelInList && channelInList.id !== this.selectedStation?.id) {
      console.log('📝 Updating channel in list:', channelInList.name);
      this.updateStationMetadata(channelInList, data);
    }
    
    // Force change detection
    this.cdr.detectChanges();
    console.log('✅ Change detection triggered, UI should update now');
  });
});
```

### 3. Enhanced Logging in updateStationMetadata()
Added comprehensive logging to track metadata updates:

```typescript
private updateStationMetadata(station: Channel, data: any): void {
  console.log('🔄 updateStationMetadata called for:', station.name);
  console.log('📦 Metadata data received:', data);
  
  // Create or update current show info
  if (!station.currentShow) {
    console.log('⚠️ No currentShow, creating new one');
    station.currentShow = {
      id: '',
      title: '',
      type: 'music' as any,
      host: { name: '', stageName: '' },
      startTime: new Date().toISOString(),
      duration: 0
    };
  } else {
    console.log('✅ Current show exists:', station.currentShow);
  }
  
  // Update show info with detailed logging
  if (data.showTitle) {
    const oldTitle = station.currentShow.title;
    station.currentShow.title = data.showTitle;
    console.log(`✅ Updated show title: "${oldTitle}" → "${data.showTitle}"`);
  }
  
  if (data.hostStageName || data.hostName) {
    const oldHost = station.currentShow.host.stageName;
    station.currentShow.host = {
      stageName: data.hostStageName || data.hostName || '',
      name: data.hostName || ''
    };
    console.log(`✅ Updated host: "${oldHost}" → "${station.currentShow.host.stageName}"`);
    console.log('📝 Full host object:', station.currentShow.host);
  }
  
  if (data.showType) {
    const oldType = station.currentShow.type;
    station.currentShow.type = data.showType as any;
    console.log(`✅ Updated show type: "${oldType}" → "${data.showType}"`);
  }
  
  console.log('🎯 Final station.currentShow state:', station.currentShow);
  // ... rest of the method
}
```

## How It Works

1. **Station Owner Changes Show**: When the station owner selects a show in the control panel, `selectShow()` is called
2. **Metadata Sent**: If the stream is live, `sendMetadataUpdate()` is automatically called
3. **WebSocket Broadcast**: The backend receives the metadata and broadcasts it to all listeners via `stream:metadata` event
4. **Frontend Receives**: The user dashboard's WebSocket service receives the event and emits it via `metadataUpdate$` observable
5. **NgZone Triggers Update**: The subscription callback runs inside `ngZone.run()`, ensuring Angular's change detection is triggered
6. **UI Updates**: The host name, show title, and other metadata are updated in real-time without page refresh

## Testing

To test the fix:

1. Open the station owner dashboard and go to the control panel
2. Start a live stream (go live)
3. Select a show from the shows list
4. Open the user dashboard in another browser tab/window
5. Play the station
6. Switch between different shows in the control panel
7. **Expected Result**: The user dashboard should update the show title and host name in real-time without refreshing

## Console Logs to Monitor

When metadata updates, you should see these logs in the browser console:

```
📝 Metadata update received: {showTitle: "...", hostName: "...", ...}
📝 Updating selected station: FM Islamabad
🔄 updateStationMetadata called for: FM Islamabad
📦 Metadata data received: {showTitle: "...", hostName: "...", ...}
✅ Current show exists: {...}
✅ Updated show title: "Old Title" → "New Title"
✅ Updated host: "Old Host" → "RJ faizan"
📝 Full host object: {stageName: "RJ faizan", name: "faizan"}
✅ Updated show type: "music" → "sports"
🎯 Final station.currentShow state: {...}
✅ Change detection triggered, UI should update now
```

## Files Modified

- `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`
  - Added NgZone and ChangeDetectorRef imports
  - Injected NgZone and ChangeDetectorRef in constructor
  - Wrapped metadata subscription in ngZone.run()
  - Enhanced logging in updateStationMetadata()
  - Fixed Show interface to include required fields (startTime, duration)

## Related Files (Already Working)

- `frontend/src/app/dashboards/station-owner-dashboard/pages/control-panel/control-panel.component.ts`
  - `selectShow()` method calls `sendMetadataUpdate()` when stream is live
  - `getHostName()` method extracts host name from show performers
  
- `frontend/src/app/services/websocket.service.ts`
  - `updateMetadata()` method sends metadata to backend
  - Listens to `stream:metadata` event and emits via `metadataUpdate$` observable
  
- `backend/src/streaming/streaming.gateway.ts`
  - `handleUpdateMetadata()` method broadcasts metadata to all channel listeners

## Benefits

✅ Real-time metadata updates without page refresh
✅ Improved user experience
✅ Consistent with live streaming expectations
✅ Better debugging with comprehensive logging
✅ Proper Angular change detection handling
