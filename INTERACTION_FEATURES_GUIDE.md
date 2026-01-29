# Stream Interaction Features Guide

## Overview
The Awaz Pulse platform now includes comprehensive interaction features that allow listeners to engage with live streams through likes, ratings, and comments. All interaction data is stored and available to station owners for analytics and engagement tracking.

## Features Implemented

### 1. **Like Button** ❤️
- Users can like/unlike streams with a single click
- Real-time like counter updates
- Animated heart icon with pulse effect
- Persistent like status (stored in database)

### 2. **Rating System** ⭐
- 5-star rating system
- Optional feedback text (up to 500 characters)
- Average rating calculation
- Rating distribution analytics
- Users can update their ratings

### 3. **Live Comments** 💬
- Real-time comment posting
- User avatars with initials
- Comment timestamps with "time ago" format
- Delete own comments
- Pinned comments feature (for station owners)
- Auto-scrolling comment list
- Character limit (500 characters)

## API Endpoints

### Likes
```
POST   /interactions/like/:channelId          - Toggle like
GET    /interactions/like/:channelId/count    - Get likes count
GET    /interactions/like/:channelId/status   - Get user like status
GET    /interactions/like/:channelId/list     - Get all likes (owner only)
```

### Comments
```
POST   /interactions/comment/:channelId       - Add comment
GET    /interactions/comment/:channelId       - Get comments (public)
DELETE /interactions/comment/:commentId       - Delete own comment
PATCH  /interactions/comment/:commentId/pin   - Pin/unpin comment (owner only)
GET    /interactions/comment/:channelId/all   - Get all comments (owner only)
```

### Ratings
```
POST   /interactions/rating/:channelId              - Add/update rating
GET    /interactions/rating/:channelId/average      - Get average rating
GET    /interactions/rating/:channelId/count        - Get ratings count
GET    /interactions/rating/:channelId/user         - Get user's rating
GET    /interactions/rating/:channelId/list         - Get all ratings (owner only)
GET    /interactions/rating/:channelId/distribution - Get rating distribution
```

### Analytics (Station Owner)
```
GET    /interactions/stats/:channelId    - Get interaction statistics
GET    /interactions/recent/:channelId   - Get recent interactions
```

## Database Schema

### stream_likes
```sql
- id (UUID, Primary Key)
- channel_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- show_id (UUID, Optional)
- created_at (Timestamp)
- UNIQUE(channel_id, user_id)
```

### stream_comments
```sql
- id (UUID, Primary Key)
- channel_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- user_name (String)
- comment (Text)
- show_id (UUID, Optional)
- likes (Integer, Default: 0)
- is_pinned (Boolean, Default: false)
- is_approved (Boolean, Default: true)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### stream_ratings
```sql
- id (UUID, Primary Key)
- channel_id (UUID, Foreign Key)
- user_id (UUID, Foreign Key)
- show_id (UUID, Optional)
- rating (Integer, 1-5)
- feedback (Text, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)
- UNIQUE(channel_id, user_id)
```

## Station Owner Dashboard Integration

### Viewing Interaction Data

Station owners can access interaction data through the following endpoints:

#### 1. **Interaction Statistics**
```javascript
GET /interactions/stats/:channelId

Response:
{
  "totalLikes": 1250,
  "totalComments": 487,
  "totalRatings": 342,
  "averageRating": 4.35,
  "ratingDistribution": {
    "1": 5,
    "2": 12,
    "3": 45,
    "4": 120,
    "5": 160
  }
}
```

#### 2. **Recent Interactions**
```javascript
GET /interactions/recent/:channelId?limit=20

Response:
{
  "recentComments": [...],
  "recentRatings": [...],
  "recentLikes": [...]
}
```

#### 3. **All Comments**
```javascript
GET /interactions/comment/:channelId/all

Response: [
  {
    "id": "uuid",
    "userName": "John Doe",
    "comment": "Great show!",
    "isPinned": false,
    "createdAt": "2026-01-28T10:00:00Z",
    "user": { ... }
  },
  ...
]
```

#### 4. **All Ratings with Feedback**
```javascript
GET /interactions/rating/:channelId/list

Response: [
  {
    "id": "uuid",
    "rating": 5,
    "feedback": "Excellent content and presentation!",
    "createdAt": "2026-01-28T10:00:00Z",
    "user": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  ...
]
```

## Frontend UI Components

### Interaction Buttons
Located below the player controls:
- **Like Button**: Heart icon with counter
- **Rating Button**: Star icon with average rating
- **Comment Button**: Comment icon with comment count

### Comments Section
- **Comment Input**: Text input with user avatar and send button
- **Comments List**: Scrollable list with:
  - User avatars
  - User names
  - Timestamps
  - Comment text
  - Delete button (for own comments)
  - Pinned badge (for pinned comments)

### Rating Modal
- **Star Selection**: 5 interactive stars
- **Rating Label**: Dynamic label (Poor, Fair, Good, Very Good, Excellent)
- **Feedback Textarea**: Optional feedback text
- **Submit/Cancel Buttons**

## Styling Features

### Futuristic Design Elements
- Glassmorphism effects
- Neon glow animations
- Smooth transitions
- Hover effects with depth
- Animated icons
- Gradient backgrounds
- Pulse animations

### Responsive Design
- Mobile-friendly layout
- Touch-optimized buttons
- Adaptive comment section
- Scrollable lists

## Usage Examples

### For Listeners

#### Like a Stream
1. Click the heart button below the player
2. Button animates and changes color
3. Like count increments

#### Rate a Stream
1. Click the star button
2. Modal opens with 5 stars
3. Click desired rating (1-5 stars)
4. Optionally add feedback
5. Click "Submit Rating"

#### Post a Comment
1. Type comment in the input field
2. Press Enter or click send button
3. Comment appears at the top of the list

### For Station Owners

#### View Interaction Stats
```javascript
// In your station owner dashboard
const stats = await fetch('/interactions/stats/YOUR_CHANNEL_ID');
console.log(stats);
```

#### Pin Important Comments
```javascript
// Pin a comment to highlight it
await fetch('/interactions/comment/COMMENT_ID/pin', {
  method: 'PATCH'
});
```

#### Export Ratings Data
```javascript
// Get all ratings for analysis
const ratings = await fetch('/interactions/rating/YOUR_CHANNEL_ID/list');
// Process ratings data for reports
```

## Security Features

1. **Authentication Required**: All write operations require JWT authentication
2. **User Ownership**: Users can only delete their own comments
3. **Owner Privileges**: Only channel owners can pin comments
4. **Input Validation**: 
   - Comment length limited to 500 characters
   - Rating must be between 1-5
   - Feedback limited to 500 characters
5. **SQL Injection Protection**: TypeORM parameterized queries
6. **XSS Protection**: Input sanitization

## Performance Optimizations

1. **Database Indexing**: Unique constraints on user-channel pairs
2. **Pagination**: Limit parameter for large datasets
3. **Caching**: Consider implementing Redis for frequently accessed data
4. **Lazy Loading**: Comments load on demand
5. **Debouncing**: Prevent rapid-fire submissions

## Future Enhancements

### Planned Features
- [ ] Comment replies/threading
- [ ] Comment reactions (emoji)
- [ ] Comment moderation dashboard
- [ ] Real-time comment updates via WebSocket
- [ ] Comment notifications
- [ ] User reputation system
- [ ] Spam detection
- [ ] Comment search and filtering
- [ ] Export interaction data to CSV/Excel
- [ ] Interaction analytics dashboard
- [ ] Sentiment analysis on comments
- [ ] Trending comments
- [ ] Comment highlights/best of

### Analytics Enhancements
- [ ] Engagement rate calculation
- [ ] Peak interaction times
- [ ] User retention metrics
- [ ] Comment sentiment trends
- [ ] Rating trends over time
- [ ] Comparative analytics (vs other channels)

## Troubleshooting

### Common Issues

**Issue**: Comments not appearing
- **Solution**: Check authentication token, verify channel ID

**Issue**: Like button not working
- **Solution**: Ensure user is logged in, check network requests

**Issue**: Rating modal not opening
- **Solution**: Check for JavaScript errors, verify modal state

**Issue**: Cannot delete comment
- **Solution**: Verify user owns the comment, check permissions

## Testing

### Manual Testing Checklist
- [ ] Like/unlike functionality
- [ ] Rating submission
- [ ] Comment posting
- [ ] Comment deletion
- [ ] Pin comment (owner)
- [ ] View statistics
- [ ] Load comments on station select
- [ ] Real-time updates

### API Testing
```bash
# Test like endpoint
curl -X POST http://localhost:3000/interactions/like/CHANNEL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test comment endpoint
curl -X POST http://localhost:3000/interactions/comment/CHANNEL_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Test comment"}'

# Test rating endpoint
curl -X POST http://localhost:3000/interactions/rating/CHANNEL_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5, "feedback": "Excellent!"}'
```

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs in browser console
3. Verify authentication tokens
4. Check database connections
5. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: January 28, 2026  
**Author**: Awaz Pulse Development Team
