# Testing Guide - Multi-Channel System

## Overview
This guide helps you test the multi-channel support and channel approval system.

## Prerequisites
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:4200`
- Database (MySQL/SQLite) with tables created
- At least one admin user and one station owner user

## Test Scenarios

### 1. Station Owner - Create Multiple Channels

#### Test Steps:
1. **Login as Station Owner**
   - Navigate to: `http://localhost:4200/auth/login`
   - Email: `owner@example.com`
   - Password: Your password

2. **Create First Channel**
   - Click "New Channel" in sidebar Quick Actions
   - Fill in form:
     - Name: `FM 101 Karachi`
     - Call Sign: `FM101`
     - Frequency: `101.0`
     - Category: `Music`
     - Language: `Urdu`
     - City: `Karachi`
   - Click "Create Channel"
   - ✅ Should show success message
   - ✅ Channel status should be "Pending Approval"

3. **Create Second Channel**
   - Click "New Channel" again (should be available now!)
   - Fill in form:
     - Name: `FM 105 Karachi`
     - Call Sign: `FM105`
     - Frequency: `105.0`
     - Category: `Talk`
     - Language: `English`
     - City: `Karachi`
   - Click "Create Channel"
   - ✅ Should create successfully (no "one channel limit" error)

4. **Create Third Channel**
   - Repeat with different details
   - ✅ Should work without restrictions

#### Expected Results:
- ✅ Can create unlimited channels
- ✅ Each channel has unique ID
- ✅ Each channel associated with your user ID
- ✅ All channels show in "My Channels" page

### 2. Admin - View and Approve Pending Channels

#### Test Steps:
1. **Login as Admin**
   - Navigate to: `http://localhost:4200/auth/login`
   - Email: `admin@example.com`
   - Password: Your password

2. **Navigate to Stations Page**
   - Click "Stations" in admin sidebar
   - URL: `http://localhost:4200/admin/stations`

3. **View Pending Approvals Panel**
   - Look at right sidebar
   - ✅ Should see "Pending Approvals" section
   - ✅ Should show count badge (e.g., "3")
   - ✅ Each pending channel should show:
     - Channel name
     - Call sign and category
     - Owner name
     - Owner email
     - Submission date (relative time)

4. **Approve a Channel**
   - Click green checkmark button
   - ✅ Should show confirmation dialog
   - Confirm approval
   - ✅ Channel should disappear from pending list
   - ✅ Channel should appear in main stations list as "Active"
   - ✅ Backend should log: `✅ Channel approved: FM 101 (FM101) - Owner: {ownerId}`

5. **Reject a Channel**
   - Click red X button
   - ✅ Should prompt for rejection reason
   - Enter reason: "Frequency conflict"
   - ✅ Channel should disappear from pending list
   - ✅ Channel status should be "Rejected"
   - ✅ Backend should log: `❌ Channel rejected: FM 105 (FM105) - Reason: Frequency conflict`

#### Expected Results:
- ✅ Can see all pending channels
- ✅ Can see owner information
- ✅ Can approve/reject with proper validation
- ✅ Real-time updates in UI
- ✅ Proper error messages if operation fails

### 3. Station Owner - Multi-Channel Control Panel

#### Test Steps:
1. **Login as Station Owner** (with approved channels)

2. **Navigate to Control Panel**
   - Click "Control Panel" in sidebar
   - URL: `http://localhost:4200/station-owner/control-panel`

3. **Verify Multi-Channel View**
   - ✅ Hero header should show:
     - "Broadcasting Control Center"
     - Channel count badge (e.g., "3 Channels")
     - Live channels count
     - Total listeners
   - ✅ Should see channel selector tabs
   - ✅ Each tab should show:
     - Channel icon
     - Channel name
     - Frequency and call sign
     - Status badge (Off Air / Live)
     - Listener count (if live)

4. **Select Different Channels**
   - Click on "FM 101" tab
   - ✅ Tab should highlight with green border
   - ✅ Info bar should show "FM 101 Karachi"
   - ✅ Should see "Your Channel" owner badge
   - ✅ Shows should load for FM 101
   
   - Click on "FM 105" tab
   - ✅ Tab should switch to FM 105
   - ✅ Info bar should update to "FM 105 Karachi"
   - ✅ Shows should load for FM 105
   - ✅ Previous channel (FM 101) should become inactive

5. **Test Independent Streaming**
   - Select "FM 101"
   - Go to "Media Files" tab
   - Upload audio files
   - ✅ Playlist should be for FM 101 only
   
   - Switch to "FM 105"
   - ✅ Playlist should be empty (independent)
   - Upload different files
   - ✅ FM 105 should have its own playlist
   
   - Switch back to "FM 101"
   - ✅ Original playlist should still be there

6. **Test RTMP Credentials**
   - Select "FM 101"
   - Go to "OBS / RTMP" tab
   - Click "Load Credentials"
   - ✅ Should show unique stream key for FM 101
   - ✅ Should show RTMP URL
   - ✅ Should show HLS playback URL
   
   - Switch to "FM 105"
   - Go to "OBS / RTMP" tab
   - Click "Load Credentials"
   - ✅ Should show DIFFERENT stream key for FM 105
   - ✅ Each channel has unique credentials

#### Expected Results:
- ✅ Can see all owned channels
- ✅ Can switch between channels easily
- ✅ Each channel has independent controls
- ✅ Clear visual indication of selected channel
- ✅ Owner badge shows on all channels
- ✅ Separate playlists per channel
- ✅ Unique RTMP credentials per channel

### 4. Database Verification

#### Test Steps:
1. **Run Verification Script**
   ```bash
   node verify-channel-owners.js
   ```

2. **Check Output**
   - ✅ Should show "No orphaned channels"
   - ✅ Should list all channels with owner info
   - ✅ Should show channels per owner count
   - ✅ Should verify foreign key constraint

3. **Run SQL Queries**
   ```bash
   mysql -u root -p awaz_pulse < check-channel-owners.sql
   ```

4. **Verify Results**
   - ✅ All channels have valid ownerId
   - ✅ Owner information is correct
   - ✅ Multiple channels per owner work
   - ✅ Foreign key constraint exists

#### Expected Results:
- ✅ Database integrity maintained
- ✅ All channels properly associated
- ✅ No orphaned records
- ✅ Foreign keys working

## API Testing

### Test with cURL or Postman

#### 1. Get My Channels
```bash
curl -X GET http://localhost:3000/channels/my-channels \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: Array of all channels owned by user

#### 2. Create Channel
```bash
curl -X POST http://localhost:3000/channels \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FM 101 Karachi",
    "callSign": "FM101",
    "frequency": "101.0",
    "category": "music",
    "language": "urdu",
    "city": "Karachi"
  }'
```
**Expected**: Created channel with status "pending_approval"

#### 3. Get Pending Channels (Admin)
```bash
curl -X GET http://localhost:3000/channels/pending \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```
**Expected**: Array of pending channels with owner info

#### 4. Approve Channel (Admin)
```bash
curl -X PATCH http://localhost:3000/channels/CHANNEL_ID/approve \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```
**Expected**: Channel with status "active"

#### 5. Reject Channel (Admin)
```bash
curl -X PATCH http://localhost:3000/channels/CHANNEL_ID/reject \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Frequency conflict"}'
```
**Expected**: Channel with status "rejected"

## Common Issues & Solutions

### Issue 1: "One channel per owner" error
**Solution**: Backend code has been updated. Restart backend server.

### Issue 2: Can't see "New Channel" button
**Solution**: 
- Check sidebar Quick Actions
- Check My Channel page (hero section)
- Refresh browser (Cmd+Shift+R)

### Issue 3: Channels not showing in control panel
**Solution**:
- Verify channels are approved (not pending)
- Check browser console for errors
- Verify API endpoint: `/channels/my-channels`

### Issue 4: Can't switch between channels
**Solution**:
- Click directly on channel tab
- Check if selectedChannel is updating
- Verify navigationService.selectChannel() is called

### Issue 5: RTMP credentials same for all channels
**Solution**:
- Each channel should have unique streamKey
- Check database: `SELECT id, name, streamKey FROM channels`
- Regenerate stream key if needed

## Success Criteria

### Station Owner
- ✅ Can create multiple channels (no limit)
- ✅ Can see all channels in My Channels page
- ✅ Can switch between channels in control panel
- ✅ Each channel has independent streaming
- ✅ Each channel has unique RTMP credentials
- ✅ Clear indication of which channel is selected

### Admin
- ✅ Can see all pending channels
- ✅ Can see owner information for each channel
- ✅ Can approve channels
- ✅ Can reject channels with reason
- ✅ Real-time updates after approval/rejection
- ✅ Proper error handling

### Database
- ✅ All channels have ownerId
- ✅ Foreign key constraint exists
- ✅ No orphaned channels
- ✅ Multiple channels per owner supported
- ✅ Cascade delete works

### UI/UX
- ✅ Clear visual indicators
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Proper error messages
- ✅ Loading states
- ✅ Confirmation dialogs

## Performance Testing

### Load Test
1. Create 10 channels for one owner
2. Navigate to control panel
3. ✅ Should load quickly
4. ✅ Tabs should be scrollable
5. ✅ Switching should be instant

### Concurrent Streaming
1. Start stream on Channel 1
2. Switch to Channel 2
3. Start stream on Channel 2
4. ✅ Both should stream independently
5. ✅ Listener counts should be separate
6. ✅ No interference between channels

## Reporting Issues

If you find any issues, please report with:
1. User role (admin/station owner)
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser console errors
6. Network tab errors
7. Screenshots

## Next Steps

After successful testing:
1. ✅ Deploy to staging environment
2. ✅ Test with real users
3. ✅ Monitor database performance
4. ✅ Add email notifications
5. ✅ Add audit logging
6. ✅ Add analytics per channel
