# Awaz Pulse - Radio Broadcasting Platform

Awaz Pulse is a comprehensive digital ecosystem for Pakistan's FM radio industry, featuring role-based authentication, real-time analytics, and the APMP (Awaz Pulse Metadata Protocol) for enhanced radio streaming.

## Project Structure

```
awaz-pulse/
├── backend/          # NestJS API server
├── frontend/         # Angular web application
├── DATABASE_SCHEMA.md # Comprehensive database documentation
└── README.md
```

## Core Entities & Relationships

### 🎯 Main Data Flow
```
Users (Listeners/Station Owners/Admins)
  ↓
Channels (Radio Stations) 
  ↓
Streams (Live Audio Feeds)
  ↓
Shows (Radio Programs)
  ↓
Performers (RJs/Hosts) ←→ Shows (Many-to-Many)
  ↓
Analytics & User Interactions
```

### 📊 Key Database Entities

1. **Users** - All system users with roles and preferences
2. **Channels** - Radio stations owned by station owners
3. **Streams** - Live audio streams with APMP metadata
4. **Shows** - Individual radio programs with scheduling
5. **Persons** - Radio personalities, RJs, hosts, guests
6. **ShowPerformers** - Junction table linking shows and performers
7. **ListeningSessions** - Detailed user listening tracking
8. **Analytics Tables** - Performance metrics for channels, shows, and performers
9. **UserInteractions** - Likes, comments, ratings, polls
10. **Polls & Votes** - Interactive audience engagement

## User Roles

The system supports three distinct user roles:

### 1. End User (Listeners)
- **Role**: `end_user`
- **Access**: Listen to radio stations, participate in polls, search RJs
- **Dashboard**: User-friendly interface for discovering and listening to stations
- **Features**: Personalized recommendations, favorite channels, listening history

### 2. Station Owner
- **Role**: `station_owner`
- **Access**: Manage radio station, view analytics, manage RJ profiles
- **Dashboard**: Comprehensive station management with Pulse Score tracking
- **Required Fields**: Station name, station license
- **Features**: Channel creation, stream management, show scheduling, performer management

### 3. Admin
- **Role**: `admin`
- **Access**: Full system access, user management, system configuration
- **Dashboard**: System-wide analytics and management tools
- **Features**: Channel approval, user management, system analytics

## Getting Started

### Backend (NestJS)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run start:dev
   ```

The backend will run on `http://localhost:3000`

### Frontend (Angular)

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   ng serve --port 4201
   ```

The frontend will run on `http://localhost:4201`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (authenticated)

### Role-based Access
- `GET /auth/admin-only` - Admin only endpoint
- `GET /auth/station-owner-only` - Station owner only endpoint
- `GET /auth/admin-or-station-owner` - Admin or station owner endpoint

### Channels Management
- `POST /channels` - Create new channel (Station Owner)
- `GET /channels` - Get all active channels (Public)
- `GET /channels/my-channels` - Get owner's channels (Station Owner)
- `GET /channels/:id` - Get channel details
- `GET /channels/:id/stats` - Get channel statistics
- `PATCH /channels/:id/approve` - Approve channel (Admin)
- `PATCH /channels/:id/suspend` - Suspend channel (Admin)

## Database Features

### 🎵 APMP (Awaz Pulse Metadata Protocol)
Real-time metadata streaming for enhanced analytics:
- Current show information
- Now playing track and artist
- Extensible JSON metadata
- Program scheduling integration

### 📈 Pulse Score System
Multi-dimensional performance scoring:
- **Audience Score**: Listener count and growth
- **Engagement Score**: Interactions and participation
- **Quality Score**: Ratings and retention
- **Consistency Score**: Regular programming reliability

### 🎯 Advanced Analytics
Comprehensive tracking across multiple dimensions:
- **Channel Analytics**: Station-wide performance metrics
- **Show Analytics**: Individual program performance
- **Person Analytics**: RJ/performer ratings and growth
- **Stream Analytics**: Technical streaming metrics
- **Listening Sessions**: Detailed user behavior tracking

### 🌍 Geographic Intelligence
Location-based features:
- User geolocation tracking (with privacy controls)
- Channel coverage areas
- City-wise listener distribution
- Regional content preferences

### 🎪 Interactive Features
Real-time audience engagement:
- Live polls during shows
- Song requests and dedications
- Call-in show management
- Social sharing and comments
- Rating and review system

## Registration Examples

### Admin User
```json
{
  "email": "admin@awazpulse.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin",
  "city": "Karachi"
}
```

### Station Owner
```json
{
  "email": "station@fm101.com",
  "password": "station123",
  "firstName": "Station",
  "lastName": "Owner",
  "role": "station_owner",
  "stationName": "FM 101 Karachi",
  "stationLicense": "LIC-FM101-KHI",
  "city": "Karachi",
  "phoneNumber": "+92-300-1234567"
}
```

### Channel Creation Example
```json
{
  "name": "FM 101 Karachi",
  "callSign": "FM101",
  "frequency": "101.0 MHz",
  "description": "Karachi's premier music station",
  "city": "Karachi",
  "country": "Pakistan",
  "latitude": 24.8607,
  "longitude": 67.0011,
  "category": "music",
  "licenseNumber": "LIC-FM101-KHI-2024",
  "contactEmail": "info@fm101.com",
  "contactPhone": "+92-21-1234567"
}
```

### End User
```json
{
  "email": "listener@gmail.com",
  "password": "listener123",
  "firstName": "Music",
  "lastName": "Lover",
  "role": "end_user",
  "city": "Lahore"
}
```

## Technology Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: TypeORM with comprehensive entity relationships
- **Authentication**: JWT with Passport strategies
- **Validation**: class-validator with DTOs

### Frontend
- **Framework**: Angular 21 with standalone components
- **UI**: Custom CSS with responsive design
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with role-based guards
- **Forms**: Reactive Forms with validation

## Database Schema Highlights

### Entity Relationships
- **Users** → **Channels** (One-to-Many for Station Owners)
- **Channels** → **Streams** (One-to-Many)
- **Streams** → **Shows** (One-to-Many)
- **Shows** ↔ **Persons** (Many-to-Many via ShowPerformers)
- **Users** → **ListeningSessions** (One-to-Many)
- **All Entities** → **Analytics** (Comprehensive tracking)

### Advanced Features
- **Soft Deletes**: Maintain data integrity
- **Audit Trails**: Created/Updated timestamps
- **Flexible Metadata**: JSON fields for extensibility
- **Geographic Data**: Latitude/longitude support
- **Enum Types**: Structured status and category management

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token expiration (24 hours)
- Role-based route protection
- Input validation and sanitization
- CORS enabled for cross-origin requests
- Privacy controls for location tracking

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Database Management
```bash
# View database schema
cat DATABASE_SCHEMA.md

# Reset database (development only)
rm backend/awaz-pulse.db
npm run start:dev  # Will recreate with synchronize: true
```

## Future Enhancements

1. **Real-time Streaming**: WebRTC integration for live audio
2. **Mobile Applications**: React Native or Ionic apps
3. **AI Recommendations**: Machine learning for content suggestions
4. **Social Features**: User profiles and social interactions
5. **Monetization**: Advertising and subscription systems
6. **Multi-language**: Internationalization support
7. **Advanced Analytics**: Machine learning insights
8. **API Gateway**: Microservices architecture
9. **CDN Integration**: Global content delivery
10. **Blockchain**: Transparent royalty distribution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software developed for Awaz Pulse by GOL Technologies Pvt Ltd.