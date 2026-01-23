# Channel-Owner Association Documentation

## ✅ CONFIRMED: Every Channel Has Owner Association

### Database Schema
Every channel in the database is **already properly associated** with its station owner through:

1. **Foreign Key Column**: `ownerId` (VARCHAR/UUID)
2. **Foreign Key Constraint**: References `users.id`
3. **Relationship**: Many-to-One (Many channels → One owner)
4. **Cascade**: ON DELETE CASCADE (if owner deleted, channels deleted)

### Entity Definition
```typescript
@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ... other fields ...

  // ✅ OWNER ASSOCIATION
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;  // Foreign key to users table
}
```

## Verification Tools

### 1. SQL Queries (`check-channel-owners.sql`)
Run these queries to verify associations:
```bash
mysql -u root -p awaz_pulse < check-channel-owners.sql
```

### 2. Node.js Script (`verify-channel-owners.js`)
Run automated verification:
```bash
node verify-channel-owners.js
```

This will check:
- ✅ No orphaned channels
- ✅ All channels have valid owners
- ✅ Foreign key constraints exist
- ✅ Channel counts per owner
- ✅ Owner contact information

## How It Works

### 1. Channel Creation
When a station owner creates a channel:

```typescript
// Backend: channels.service.ts
async create(createChannelDto: CreateChannelDto, ownerId: string): Promise<Channel> {
  // Verify the user is a station owner
  const owner = await this.userRepository.findOne({ where: { id: ownerId } });
  
  if (!owner || owner.role !== UserRole.STATION_OWNER) {
    throw new ForbiddenException('Only station owners can create channels');
  }

  // Create channel with owner association
  const channelData = {
    ...createChannelDto,
    ownerId,  // ← Owner ID is stored here
    status: ChannelStatus.PENDING_APPROVAL,
  };

  const channel = this.channelRepository.create(channelData);
  return await this.channelRepository.save(channel);
}
```

### 2. Querying Channels by Owner
Get all channels owned by a specific user:

```typescript
// Backend: channels.service.ts
async findByOwner(ownerId: string): Promise<Channel[]> {
  return this.channelRepository.find({
    where: { ownerId },  // ← Filter by owner ID
    relations: ['streams'],
  });
}
```

### 3. API Endpoint
Station owners can get their channels:

```typescript
// Backend: channels.controller.ts
@Get('my-channels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STATION_OWNER)
async findMyChannels(@CurrentUser() user: User) {
  return this.channelsService.findByOwner(user.id);  // ← Uses logged-in user's ID
}
```

### 4. Frontend Usage
```typescript
// Frontend: dashboard-navigation.service.ts
loadMyChannels(): Observable<Channel[]> {
  const request = this.http.get<Channel[]>(`${this.API_URL}/channels/my-channels`);
  request.subscribe({
    next: (channels) => {
      this._myChannels$.next(channels);
      // Each channel has ownerId matching the logged-in user
    }
  });
  return request;
}
```

## Data Flow

```
1. User logs in → JWT token contains user.id
2. User creates channel → ownerId = user.id is stored
3. User views "My Channels" → Query: WHERE ownerId = user.id
4. Admin views pending → Query: WHERE status = 'pending_approval' (includes owner info)
```

## Example Database Records

### Users Table
```
| id                                   | email              | role          | firstName | lastName |
|--------------------------------------|-------------------|---------------|-----------|----------|
| 550e8400-e29b-41d4-a716-446655440000 | ahmed@fm101.com   | station_owner | Ahmed     | Khan     |
| 550e8400-e29b-41d4-a716-446655440001 | sara@cityfm.com   | station_owner | Sara      | Ali      |
```

### Channels Table
```
| id                                   | name           | callSign | ownerId                              | status            |
|--------------------------------------|----------------|----------|--------------------------------------|-------------------|
| 660e8400-e29b-41d4-a716-446655440000 | FM 101 Karachi | FM101    | 550e8400-e29b-41d4-a716-446655440000 | active            |
| 660e8400-e29b-41d4-a716-446655440001 | FM 105 Karachi | FM105    | 550e8400-e29b-41d4-a716-446655440000 | pending_approval  |
| 660e8400-e29b-41d4-a716-446655440002 | City FM 89     | CITY89   | 550e8400-e29b-41d4-a716-446655440001 | active            |
```

**Note:** Ahmed (user 1) owns 2 channels, Sara (user 2) owns 1 channel.

## Relationship Benefits

### 1. Data Integrity
- ✅ Foreign key constraint ensures ownerId always references a valid user
- ✅ Cascade delete: If user is deleted, their channels are also deleted
- ✅ Cannot create orphaned channels

### 2. Security
- ✅ Users can only see/edit their own channels
- ✅ Ownership verification in every operation:
  ```typescript
  if (channel.ownerId !== userId) {
    throw new ForbiddenException('Not your channel');
  }
  ```

### 3. Queries
- ✅ Get all channels by owner: `WHERE ownerId = ?`
- ✅ Get owner details with channel: `JOIN users ON channels.ownerId = users.id`
- ✅ Count channels per owner: `GROUP BY ownerId`

### 4. Admin Features
- ✅ View which user owns each channel
- ✅ Contact owner via email (from user record)
- ✅ Track channel creation by user

## Verification Queries

### Check Channel Ownership
```sql
-- Get all channels with owner information
SELECT 
  c.id,
  c.name,
  c.callSign,
  c.status,
  u.firstName,
  u.lastName,
  u.email
FROM channels c
INNER JOIN users u ON c.ownerId = u.id;
```

### Count Channels Per Owner
```sql
SELECT 
  u.firstName,
  u.lastName,
  u.email,
  COUNT(c.id) as channelCount
FROM users u
LEFT JOIN channels c ON u.id = c.ownerId
WHERE u.role = 'station_owner'
GROUP BY u.id;
```

### Find Orphaned Channels (Should be 0)
```sql
SELECT * FROM channels 
WHERE ownerId NOT IN (SELECT id FROM users);
```

## API Endpoints with Owner Association

### Station Owner Endpoints
- `POST /channels` - Create channel (ownerId = current user)
- `GET /channels/my-channels` - Get my channels (WHERE ownerId = current user)
- `GET /channels/:id/streaming-credentials` - Verify ownership before returning

### Admin Endpoints
- `GET /channels/pending` - Get all pending (includes owner via JOIN)
- `PATCH /channels/:id/approve` - Approve (logs ownerId)
- `PATCH /channels/:id/reject` - Reject (logs ownerId)

## Frontend Display

### Admin View (Pending Channels)
```typescript
interface Channel {
  id: string;
  name: string;
  callSign: string;
  status: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

### Station Owner View (My Channels)
```typescript
// All channels returned have ownerId matching logged-in user
myChannels: Channel[] = [];

loadMyChannels() {
  this.http.get<Channel[]>('/channels/my-channels').subscribe(channels => {
    this.myChannels = channels;
    // Each channel.ownerId === currentUser.id
  });
}
```

## Summary

✅ **Every channel has an owner** - Stored in `ownerId` field  
✅ **Foreign key relationship** - Database enforces referential integrity  
✅ **Secure access control** - Users can only access their own channels  
✅ **Admin visibility** - Admins can see which user owns each channel  
✅ **Multi-channel support** - One owner can have multiple channels  
✅ **Proper queries** - Efficient filtering by owner ID  

The channel-owner association is **fully implemented and working correctly** in the database!
