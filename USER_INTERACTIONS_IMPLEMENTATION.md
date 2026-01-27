# User Interactions Implementation Plan

## Overview
Implement real-time user interactions (comments, likes, ratings, watch time) that flow from users to station owners.

---

## Part 1: Enhanced Metadata (Station Owner → User)

### Current Status
✅ Already sending:
- Show title
- Show type
- Host name
- Live status

### Missing (To Add):
- ❌ Show description
- ❌ Host/Guest full details (names, bios, photos)
- ❌ Show duration
- ❌ Show tags

### Implementation

#### 1.1 Update Station Owner Metadata Sending
**File**: `frontend/src/app/dashboards/station-owner-dashboard/pages/control-panel/control-panel.component.ts`

```typescript
private sendMetadataUpdate(): void {
  if (this.channel) {
    const hostName = this.getHostName(this.currentShow);
    
    // Get hosts and guests from show
    const hosts = this.currentShow?.performers
      ?.filter(p => p.role === 'host' || p.isPrimary)
      .map(p => ({
        id: p.person.id,
        name: p.person.firstName + ' ' + p.person.lastName,
        stageName: p.person.stageName,
        bio: p.person.bio,
        photo: p.person.profileImageUrl
      })) || [];
    
    const guests = this.currentShow?.performers
      ?.filter(p => p.role === 'guest')
      .map(p => ({
        id: p.person.id,
        name: p.person.firstName + ' ' + p.person.lastName,
        stageName: p.person.stageName,
        bio: p.person.bio,
        photo: p.person.profileImageUrl
      })) || [];
    
    this.webSocketService.updateMetadata(this.channel.id, {
      // Existing fields
      showTitle: this.currentShow?.title,
      showType: this.currentShow?.type,
      hostName: hostName,
      hostStageName: hostName,
      isLive: this.streamState === 'live',
      
      // NEW FIELDS
      showDescription: this.currentShow?.shortDescription || this.currentShow?.description,
      showDuration: this.currentShow?.duration,
      showTags: this.currentShow?.tags || [],
      hosts: hosts,
      guests: guests,
      showId: this.currentShow?.id,
      
      // Track info (if playing media)
      trackName: this.currentTrack?.originalName,
      artistName: this.currentTrack?.originalName ? 'Now Playing' : undefined,
      streamSource: this.streamSource,
    });
  }
}
```

#### 1.2 Update User Dashboard to Receive Enhanced Metadata
**File**: `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`

```typescript
private updateStationMetadata(station: Channel, data: any): void {
  // Existing updates...
  
  // NEW: Update show description
  if (data.showDescription) {
    station.currentShow.description = data.showDescription;
  }
  
  // NEW: Update show duration
  if (data.showDuration) {
    station.currentShow.duration = data.showDuration;
  }
  
  // NEW: Update show tags
  if (data.showTags) {
    station.currentShow.tags = data.showTags;
  }
  
  // NEW: Update hosts list
  if (data.hosts && data.hosts.length > 0) {
    station.currentShow.hosts = data.hosts;
  }
  
  // NEW: Update guests list
  if (data.guests && data.guests.length > 0) {
    station.currentShow.guests = data.guests;
  }
  
  // NEW: Store show ID for interactions
  if (data.showId) {
    station.currentShow.id = data.showId;
  }
}
```

---

## Part 2: User Interactions (User → Station Owner)

### Features to Implement

1. **Comments** - Users can comment on live shows
2. **Likes** - Users can like the current show
3. **Ratings** - Users can rate shows (1-5 stars)
4. **Watch Time** - Track how long users listen
5. **Current Viewers** - Real-time listener count

### Database Schema (Already Exists!)

#### `user_interactions` Table
```sql
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY,
  type ENUM('like', 'comment', 'share', 'rating', 'poll_vote'),
  content TEXT,  -- For comments
  rating INTEGER,  -- For ratings (1-5)
  metadata JSON,
  interactionTime TIMESTAMP,
  userId UUID REFERENCES users(id),
  showId UUID REFERENCES shows(id),
  streamId UUID REFERENCES streams(id),
  personId UUID REFERENCES persons(id),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

#### `listening_sessions` Table (Already Exists!)
```sql
CREATE TABLE listening_sessions (
  id UUID PRIMARY KEY,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  durationSeconds INTEGER,
  status ENUM('active', 'ended', 'paused'),
  userId UUID REFERENCES users(id),
  streamId UUID REFERENCES streams(id),
  showId UUID REFERENCES shows(id),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

---

## Implementation Steps

### Step 1: Backend API Endpoints

#### 1.1 Create Interactions Controller
**File**: `backend/src/interactions/interactions.controller.ts`

```typescript
@Controller('interactions')
export class InteractionsController {
  
  // Submit a comment
  @Post('comment')
  @UseGuards(JwtAuthGuard)
  async submitComment(
    @Body() dto: { showId: string; content: string },
    @CurrentUser() user: User
  ) {
    return this.interactionsService.createComment(user.id, dto.showId, dto.content);
  }
  
  // Like a show
  @Post('like')
  @UseGuards(JwtAuthGuard)
  async likeShow(
    @Body() dto: { showId: string },
    @CurrentUser() user: User
  ) {
    return this.interactionsService.createLike(user.id, dto.showId);
  }
  
  // Rate a show
  @Post('rating')
  @UseGuards(JwtAuthGuard)
  async rateShow(
    @Body() dto: { showId: string; rating: number },
    @CurrentUser() user: User
  ) {
    return this.interactionsService.createRating(user.id, dto.showId, dto.rating);
  }
  
  // Get interactions for a show
  @Get('show/:showId')
  async getShowInteractions(@Param('showId') showId: string) {
    return this.interactionsService.getShowInteractions(showId);
  }
  
  // Get interaction stats for a show
  @Get('show/:showId/stats')
  async getShowStats(@Param('showId') showId: string) {
    return this.interactionsService.getShowStats(showId);
  }
}
```

#### 1.2 Create Interactions Service
**File**: `backend/src/interactions/interactions.service.ts`

```typescript
@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(UserInteraction)
    private interactionRepository: Repository<UserInteraction>,
    @InjectRepository(ListeningSession)
    private sessionRepository: Repository<ListeningSession>,
  ) {}
  
  async createComment(userId: string, showId: string, content: string) {
    const interaction = this.interactionRepository.create({
      type: 'comment',
      content,
      userId,
      showId,
      interactionTime: new Date(),
    });
    
    return this.interactionRepository.save(interaction);
  }
  
  async createLike(userId: string, showId: string) {
    // Check if already liked
    const existing = await this.interactionRepository.findOne({
      where: { userId, showId, type: 'like' }
    });
    
    if (existing) {
      // Unlike
      await this.interactionRepository.remove(existing);
      return { liked: false };
    }
    
    // Like
    const interaction = this.interactionRepository.create({
      type: 'like',
      userId,
      showId,
      interactionTime: new Date(),
    });
    
    await this.interactionRepository.save(interaction);
    return { liked: true };
  }
  
  async createRating(userId: string, showId: string, rating: number) {
    // Check if already rated
    const existing = await this.interactionRepository.findOne({
      where: { userId, showId, type: 'rating' }
    });
    
    if (existing) {
      // Update rating
      existing.rating = rating;
      return this.interactionRepository.save(existing);
    }
    
    // New rating
    const interaction = this.interactionRepository.create({
      type: 'rating',
      rating,
      userId,
      showId,
      interactionTime: new Date(),
    });
    
    return this.interactionRepository.save(interaction);
  }
  
  async getShowInteractions(showId: string) {
    return this.interactionRepository.find({
      where: { showId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100, // Limit to recent 100
    });
  }
  
  async getShowStats(showId: string) {
    const [comments, likes, ratings, sessions] = await Promise.all([
      this.interactionRepository.count({ where: { showId, type: 'comment' } }),
      this.interactionRepository.count({ where: { showId, type: 'like' } }),
      this.interactionRepository.find({ where: { showId, type: 'rating' } }),
      this.sessionRepository.find({ where: { showId, status: 'active' } }),
    ]);
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    
    return {
      comments: comments,
      likes: likes,
      ratings: ratings.length,
      averageRating: avgRating.toFixed(1),
      currentViewers: sessions.length,
    };
  }
}
```

### Step 2: WebSocket Events for Real-Time Updates

#### 2.1 Update Streaming Gateway
**File**: `backend/src/streaming/streaming.gateway.ts`

```typescript
@WebSocketGateway({ cors: true })
export class StreamingGateway {
  
  // NEW: Handle user comment
  @SubscribeMessage('user-comment')
  async handleUserComment(
    @MessageBody() data: { channelId: string; showId: string; userId: string; content: string }
  ) {
    // Save to database
    await this.interactionsService.createComment(data.userId, data.showId, data.content);
    
    // Broadcast to station owner
    this.server.to(`channel-${data.channelId}-owner`).emit('new-comment', {
      showId: data.showId,
      userId: data.userId,
      content: data.content,
      timestamp: new Date().toISOString()
    });
    
    // Broadcast to all users (for live chat)
    this.server.to(`channel-${data.channelId}`).emit('new-comment', {
      showId: data.showId,
      content: data.content,
      timestamp: new Date().toISOString()
    });
  }
  
  // NEW: Handle user like
  @SubscribeMessage('user-like')
  async handleUserLike(
    @MessageBody() data: { channelId: string; showId: string; userId: string }
  ) {
    const result = await this.interactionsService.createLike(data.userId, data.showId);
    
    // Get updated stats
    const stats = await this.interactionsService.getShowStats(data.showId);
    
    // Broadcast to station owner
    this.server.to(`channel-${data.channelId}-owner`).emit('interaction-stats', stats);
  }
  
  // NEW: Handle user rating
  @SubscribeMessage('user-rating')
  async handleUserRating(
    @MessageBody() data: { channelId: string; showId: string; userId: string; rating: number }
  ) {
    await this.interactionsService.createRating(data.userId, data.showId, data.rating);
    
    // Get updated stats
    const stats = await this.interactionsService.getShowStats(data.showId);
    
    // Broadcast to station owner
    this.server.to(`channel-${data.channelId}-owner`).emit('interaction-stats', stats);
  }
  
  // NEW: Track listening session
  @SubscribeMessage('start-listening')
  async handleStartListening(
    @MessageBody() data: { channelId: string; showId: string; userId: string; streamId: string }
  ) {
    // Create listening session
    const session = await this.sessionsService.startSession(
      data.userId,
      data.streamId,
      data.showId
    );
    
    // Get updated viewer count
    const stats = await this.interactionsService.getShowStats(data.showId);
    
    // Broadcast to station owner
    this.server.to(`channel-${data.channelId}-owner`).emit('interaction-stats', stats);
    
    return { sessionId: session.id };
  }
  
  // NEW: End listening session
  @SubscribeMessage('stop-listening')
  async handleStopListening(
    @MessageBody() data: { sessionId: string; channelId: string; showId: string }
  ) {
    await this.sessionsService.endSession(data.sessionId);
    
    // Get updated viewer count
    const stats = await this.interactionsService.getShowStats(data.showId);
    
    // Broadcast to station owner
    this.server.to(`channel-${data.channelId}-owner`).emit('interaction-stats', stats);
  }
}
```

### Step 3: User Dashboard UI Components

#### 3.1 Add Interaction Panel to User Dashboard
**File**: `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.html`

```html
<!-- Interaction Panel (when station is selected) -->
<div *ngIf="selectedStation" class="interaction-panel">
  
  <!-- Show Info -->
  <div class="show-info">
    <h3>{{ selectedStation.currentShow?.title }}</h3>
    <p>{{ selectedStation.currentShow?.description }}</p>
    
    <!-- Hosts -->
    <div class="hosts" *ngIf="selectedStation.currentShow?.hosts">
      <h4>Hosts:</h4>
      <div *ngFor="let host of selectedStation.currentShow.hosts" class="host-card">
        <img [src]="host.photo" [alt]="host.stageName">
        <span>{{ host.stageName }}</span>
      </div>
    </div>
    
    <!-- Guests -->
    <div class="guests" *ngIf="selectedStation.currentShow?.guests">
      <h4>Guests:</h4>
      <div *ngFor="let guest of selectedStation.currentShow.guests" class="guest-card">
        <img [src]="guest.photo" [alt]="guest.stageName">
        <span>{{ guest.stageName }}</span>
      </div>
    </div>
  </div>
  
  <!-- Interaction Stats -->
  <div class="interaction-stats">
    <div class="stat">
      <i class="fas fa-eye"></i>
      <span>{{ interactionStats.currentViewers }} watching</span>
    </div>
    <div class="stat">
      <i class="fas fa-heart"></i>
      <span>{{ interactionStats.likes }} likes</span>
    </div>
    <div class="stat">
      <i class="fas fa-star"></i>
      <span>{{ interactionStats.averageRating }} rating</span>
    </div>
    <div class="stat">
      <i class="fas fa-comment"></i>
      <span>{{ interactionStats.comments }} comments</span>
    </div>
  </div>
  
  <!-- Like Button -->
  <button (click)="toggleLike()" [class.liked]="hasLiked">
    <i class="fas fa-heart"></i>
    {{ hasLiked ? 'Liked' : 'Like' }}
  </button>
  
  <!-- Rating -->
  <div class="rating-input">
    <span>Rate this show:</span>
    <div class="stars">
      <i *ngFor="let star of [1,2,3,4,5]" 
         class="fas fa-star" 
         [class.filled]="star <= userRating"
         (click)="rateShow(star)"></i>
    </div>
  </div>
  
  <!-- Comments -->
  <div class="comments-section">
    <h4>Comments</h4>
    
    <!-- Comment Input -->
    <div class="comment-input">
      <input [(ngModel)]="newComment" placeholder="Add a comment...">
      <button (click)="submitComment()">Send</button>
    </div>
    
    <!-- Comments List -->
    <div class="comments-list">
      <div *ngFor="let comment of comments" class="comment">
        <strong>{{ comment.user.username }}</strong>
        <p>{{ comment.content }}</p>
        <span class="time">{{ comment.createdAt | date:'short' }}</span>
      </div>
    </div>
  </div>
  
</div>
```

#### 3.2 Add Interaction Logic to User Dashboard Component
**File**: `frontend/src/app/dashboards/user-dashboard/user-dashboard.component.ts`

```typescript
export class UserDashboardComponent {
  // NEW: Interaction properties
  interactionStats = {
    currentViewers: 0,
    likes: 0,
    comments: 0,
    ratings: 0,
    averageRating: 0
  };
  
  hasLiked = false;
  userRating = 0;
  newComment = '';
  comments: any[] = [];
  listeningSessionId: string | null = null;
  
  ngOnInit() {
    // Existing code...
    
    // NEW: Subscribe to interaction stats
    this.websocketService.interactionStats$.subscribe(stats => {
      this.interactionStats = stats;
      this.cdr.detectChanges();
    });
    
    // NEW: Subscribe to new comments
    this.websocketService.newComment$.subscribe(comment => {
      this.comments.unshift(comment);
      this.cdr.detectChanges();
    });
  }
  
  // NEW: Start listening session
  startPlayback(station: Channel) {
    // Existing playback code...
    
    // Track listening session
    if (station.currentShow?.id) {
      this.websocketService.startListening(
        station.id,
        station.currentShow.id,
        station.streams[0].id
      ).subscribe(response => {
        this.listeningSessionId = response.sessionId;
      });
    }
    
    // Load interaction stats
    this.loadInteractionStats(station.currentShow?.id);
  }
  
  // NEW: Stop listening session
  stopPlayback() {
    // Existing stop code...
    
    if (this.listeningSessionId) {
      this.websocketService.stopListening(
        this.listeningSessionId,
        this.selectedStation.id,
        this.selectedStation.currentShow?.id
      );
      this.listeningSessionId = null;
    }
  }
  
  // NEW: Toggle like
  toggleLike() {
    if (!this.selectedStation?.currentShow?.id) return;
    
    this.websocketService.likeShow(
      this.selectedStation.id,
      this.selectedStation.currentShow.id
    );
    
    this.hasLiked = !this.hasLiked;
  }
  
  // NEW: Rate show
  rateShow(rating: number) {
    if (!this.selectedStation?.currentShow?.id) return;
    
    this.userRating = rating;
    
    this.websocketService.rateShow(
      this.selectedStation.id,
      this.selectedStation.currentShow.id,
      rating
    );
  }
  
  // NEW: Submit comment
  submitComment() {
    if (!this.newComment.trim() || !this.selectedStation?.currentShow?.id) return;
    
    this.websocketService.submitComment(
      this.selectedStation.id,
      this.selectedStation.currentShow.id,
      this.newComment
    );
    
    this.newComment = '';
  }
  
  // NEW: Load interaction stats
  loadInteractionStats(showId: string) {
    this.http.get(`${this.API_URL}/interactions/show/${showId}/stats`)
      .subscribe(stats => {
        this.interactionStats = stats;
      });
    
    // Load comments
    this.http.get(`${this.API_URL}/interactions/show/${showId}`)
      .subscribe((interactions: any[]) => {
        this.comments = interactions.filter(i => i.type === 'comment');
      });
  }
}
```

### Step 4: Station Owner Dashboard - View Interactions

#### 4.1 Add Interactions Panel to Control Panel
**File**: `admin-react/src/app/main/station-owner/control-panel/ControlPanelPage.js`

```jsx
// NEW: Interaction stats state
const [interactionStats, setInteractionStats] = useState({
  currentViewers: 0,
  likes: 0,
  comments: 0,
  ratings: 0,
  averageRating: 0
});
const [recentComments, setRecentComments] = useState([]);

// NEW: Subscribe to interaction updates
useEffect(() => {
  if (!selectedChannel) return;
  
  // Join owner room
  const socket = io('http://localhost:3000');
  socket.emit('join-owner-room', { channelId: selectedChannel.id });
  
  // Listen for interaction stats
  socket.on('interaction-stats', (stats) => {
    setInteractionStats(stats);
  });
  
  // Listen for new comments
  socket.on('new-comment', (comment) => {
    setRecentComments(prev => [comment, ...prev].slice(0, 50));
  });
  
  return () => {
    socket.disconnect();
  };
}, [selectedChannel]);

// Render interaction panel
<div className="interaction-panel">
  <h3>Live Interactions</h3>
  
  <div className="stats-grid">
    <div className="stat-card">
      <FuseSvgIcon>heroicons-outline:eye</FuseSvgIcon>
      <span className="value">{interactionStats.currentViewers}</span>
      <span className="label">Current Viewers</span>
    </div>
    
    <div className="stat-card">
      <FuseSvgIcon>heroicons-outline:heart</FuseSvgIcon>
      <span className="value">{interactionStats.likes}</span>
      <span className="label">Likes</span>
    </div>
    
    <div className="stat-card">
      <FuseSvgIcon>heroicons-outline:star</FuseSvgIcon>
      <span className="value">{interactionStats.averageRating}</span>
      <span className="label">Rating</span>
    </div>
    
    <div className="stat-card">
      <FuseSvgIcon>heroicons-outline:chat-bubble-left</FuseSvgIcon>
      <span className="value">{interactionStats.comments}</span>
      <span className="label">Comments</span>
    </div>
  </div>
  
  <div className="recent-comments">
    <h4>Recent Comments</h4>
    {recentComments.map((comment, index) => (
      <div key={index} className="comment">
        <strong>{comment.userId}</strong>
        <p>{comment.content}</p>
        <span>{new Date(comment.timestamp).toLocaleTimeString()}</span>
      </div>
    ))}
  </div>
</div>
```

---

## Summary of Changes

### Backend
1. ✅ Create `InteractionsController` with endpoints for comments, likes, ratings
2. ✅ Create `InteractionsService` to handle database operations
3. ✅ Update `StreamingGateway` with WebSocket events for real-time interactions
4. ✅ Create `SessionsService` to track listening sessions

### Frontend - User Dashboard
1. ✅ Add interaction panel UI (like, rate, comment)
2. ✅ Display show details (description, hosts, guests)
3. ✅ Track listening sessions
4. ✅ Send interactions via WebSocket
5. ✅ Display real-time stats

### Frontend - Station Owner Dashboard
1. ✅ Display real-time interaction stats
2. ✅ Show live comments feed
3. ✅ Display current viewer count
4. ✅ Show likes and ratings

### Database
- ✅ Already has `user_interactions` table
- ✅ Already has `listening_sessions` table
- No schema changes needed!

---

## Implementation Priority

### Phase 1 (High Priority)
1. Current viewers count
2. Comments system
3. Likes

### Phase 2 (Medium Priority)
4. Ratings
5. Watch time tracking

### Phase 3 (Low Priority)
6. Advanced analytics
7. Interaction history

---

## Estimated Timeline
- Backend API: 2-3 hours
- WebSocket events: 1-2 hours
- User UI: 3-4 hours
- Station Owner UI: 2-3 hours
- Testing: 2 hours

**Total: 10-14 hours**

---

This is a comprehensive feature that will significantly enhance user engagement!
