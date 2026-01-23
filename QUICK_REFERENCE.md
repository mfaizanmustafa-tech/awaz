# Quick Reference - Multi-Channel System

## 🚀 Quick Start

### For Station Owners
1. Login → Sidebar → "New Channel"
2. Create multiple channels (no limit)
3. Go to Control Panel → See all channels
4. Click channel tab → Control that channel
5. Each channel = independent streaming

### For Admins
1. Login → Stations page
2. See "Pending Approvals" panel
3. Click ✓ to approve, ✗ to reject
4. View all channels with owner info

## 📁 File Structure

### Backend
```
backend/src/
├── channels/
│   ├── channels.controller.ts    ← API endpoints
│   ├── channels.service.ts       ← Business logic (UPDATED)
│   └── dto/create-channel.dto.ts
├── entities/
│   └── channel.entity.ts         ← Database schema (has ownerId)
```

### Frontend
```
frontend/src/app/dashboards/
├── station-owner-dashboard/
│   ├── pages/
│   │   ├── control-panel/        ← Multi-channel control (UPDATED)
│   │   └── my-channel/           ← Channel selector (UPDATED)
│   └── services/
│       └── dashboard-navigation.service.ts  ← Channel management (UPDATED)
├── admin-dashboard/
│   └── pages/
│       └── stations/             ← Approval system (UPDATED)
```

## 🔑 Key Changes

### Backend (`channels.service.ts`)
```typescript
// REMOVED: One-channel-per-owner check
// OLD:
if (existingOwnerChannel) {
  throw new ConflictException('You already have a channel');
}

// NEW: No restriction - create unlimited channels
```

### Frontend (`control-panel.component.ts`)
```typescript
// ADDED: Multi-channel support
allChannels: Channel[] = [];
selectedChannel: Channel | null = null;

selectChannelForControl(channel: Channel): void {
  this.selectedChannel = channel;
  // Load channel-specific data
}
```

### Frontend (`dashboard-navigation.service.ts`)
```typescript
// ADDED: Active channel tracking
private _activeChannel$ = new BehaviorSubject<Channel | null>(null);

selectChannel(channelId: string): void {
  const channel = this._myChannels$.value.find(c => c.id === channelId);
  this._activeChannel$.next(channel);
}
```

## 🎯 API Endpoints

### Station Owner
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/channels` | Create channel (no limit) |
| GET | `/channels/my-channels` | Get all owned channels |
| GET | `/channels/:id/streaming-credentials` | Get RTMP credentials |
| POST | `/channels/:id/regenerate-stream-key` | Regenerate stream key |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/channels/pending` | Get pending channels |
| PATCH | `/channels/:id/approve` | Approve channel |
| PATCH | `/channels/:id/reject` | Reject channel (with reason) |
| PATCH | `/channels/:id/suspend` | Suspend channel |

## 💾 Database Schema

```sql
CREATE TABLE channels (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  callSign VARCHAR(255) UNIQUE NOT NULL,
  frequency VARCHAR(255) UNIQUE NOT NULL,
  ownerId VARCHAR(36) NOT NULL,  -- ← Foreign key to users
  status ENUM('active', 'pending_approval', 'suspended', 'rejected'),
  streamKey VARCHAR(255) UNIQUE,
  -- ... other fields
  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔍 Verification Commands

### Check Channel Ownership
```bash
# Node script
node verify-channel-owners.js

# SQL query
mysql -u root -p awaz_pulse < check-channel-owners.sql
```

### Check Specific User's Channels
```sql
SELECT c.name, c.callSign, c.status 
FROM channels c 
WHERE c.ownerId = 'USER_ID';
```

### Count Channels Per Owner
```sql
SELECT u.email, COUNT(c.id) as channel_count
FROM users u
LEFT JOIN channels c ON u.id = c.ownerId
WHERE u.role = 'station_owner'
GROUP BY u.id;
```

## 🎨 UI Components

### Control Panel Layout
```
┌─────────────────────────────────────────┐
│ Hero: Broadcasting Control Center       │
│ - Channel count badge                   │
│ - Live channels count                   │
│ - Total listeners                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Channel Tabs: [FM 101] [FM 105] [City89]│
│ - Click to switch                       │
│ - Active tab highlighted                │
│ - Live indicator on live channels       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Channel Info Bar: FM 101 Karachi        │
│ - Frequency, call sign, city            │
│ - "Your Channel" owner badge            │
│ - Action buttons                        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Control Panel: Stream controls          │
│ - Source tabs (Mic, Link, Files, RTMP)  │
│ - Independent per channel               │
└─────────────────────────────────────────┘
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Can't create 2nd channel | Restart backend (code updated) |
| Channels not showing | Check if approved (not pending) |
| Can't switch channels | Click channel tab directly |
| Same RTMP key for all | Each channel has unique key |
| Owner not showing | Check ownerId in database |

## 📊 Testing Checklist

- [ ] Create multiple channels as station owner
- [ ] See all channels in My Channels page
- [ ] Switch between channels in control panel
- [ ] Each channel has independent playlist
- [ ] Each channel has unique RTMP credentials
- [ ] Admin can see pending channels
- [ ] Admin can approve/reject channels
- [ ] Database shows correct ownerId
- [ ] No orphaned channels in database
- [ ] Foreign key constraint exists

## 🔐 Security

### Ownership Verification
```typescript
// Backend always verifies ownership
if (channel.ownerId !== userId) {
  throw new ForbiddenException('Not your channel');
}
```

### Admin-Only Operations
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async approveChannel(@Param('id') id: string) {
  // Only admins can approve
}
```

## 📝 Logging

### Backend Logs
```typescript
// Channel creation
console.log(`✅ Channel created: ${name} - Owner: ${ownerId}`);

// Channel approval
console.log(`✅ Channel approved: ${name} (${callSign}) - Owner: ${ownerId}`);

// Channel rejection
console.log(`❌ Channel rejected: ${name} - Reason: ${reason}`);
```

### Frontend Logs
```typescript
// Channel selection
console.log(`📻 Selected channel: ${channel.name} (${channel.callSign})`);

// RTMP credentials loaded
console.log(`✅ Loaded credentials for ${channel.name}`);
```

## 🚦 Status Flow

```
PENDING_APPROVAL → ACTIVE (approved by admin)
PENDING_APPROVAL → REJECTED (rejected by admin)
ACTIVE → SUSPENDED (suspended by admin)
SUSPENDED → ACTIVE (reactivated by admin)
```

## 📞 Support

### Documentation Files
- `MULTI_CHANNEL_AND_APPROVAL_SYSTEM.md` - Implementation details
- `CHANNEL_OWNER_ASSOCIATION.md` - Database relationships
- `MULTI_CHANNEL_CONTROL_PANEL.md` - UI design
- `TESTING_GUIDE.md` - Testing procedures
- `QUICK_REFERENCE.md` - This file

### Verification Scripts
- `verify-channel-owners.js` - Node.js verification
- `check-channel-owners.sql` - SQL queries

## 🎯 Key Features

✅ **Unlimited Channels** - No restriction per owner  
✅ **Independent Streaming** - Each channel operates separately  
✅ **Clear Association** - Always know which channel you're controlling  
✅ **Owner Identification** - "Your Channel" badge on all channels  
✅ **Admin Approval** - Proper workflow for new channels  
✅ **Database Integrity** - Foreign keys and constraints  
✅ **Visual Indicators** - Live status, listener counts  
✅ **Responsive Design** - Works on all devices  

## 🔄 Quick Commands

```bash
# Start backend
cd backend && npm run start:dev

# Start frontend
cd frontend && npm start

# Verify database
node verify-channel-owners.js

# Check SQL
mysql -u root -p awaz_pulse < check-channel-owners.sql

# View logs
tail -f backend/logs/app.log
```

---

**Last Updated**: January 2026  
**Version**: 2.0 - Multi-Channel Support
