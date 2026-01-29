# Awaz Pulse - Complete Setup Guide

## Quick Start

### 1. Backend (NestJS - Port 3000)
```bash
cd backend
npm install
npm run start:dev
```

### 2. Admin Panel (React/Fuse - Port 4300)
```bash
cd admin-react
npm install
npm start
```

### 3. User Frontend (Angular - Port 4200)
```bash
cd frontend
npm install
npm start
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Awaz Pulse Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Angular - Port 4200)                              │
│  ├─ End-user dashboard (listeners)                           │
│  ├─ Authentication (login/register)                          │
│  └─ Redirects admin/station-owner → React Admin             │
│                                                               │
│  Admin-React (Fuse - Port 4300)                              │
│  ├─ Admin dashboard (full system management)                 │
│  └─ Station Owner dashboard (channel management)             │
│                                                               │
│  Backend (NestJS - Port 3000)                                │
│  ├─ REST API (serves both frontends)                         │
│  ├─ WebSocket (real-time streaming)                          │
│  └─ MySQL Database                                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## User Roles

### 1. End User (Listeners)
- Role: `end_user`
- Access: Listen to stations, participate in polls
- Login redirects to: Angular frontend (port 4200)

### 2. Station Owner
- Role: `station_owner`
- Access: Manage channel, shows, performers, analytics
- Login redirects to: React admin (port 4300)

### 3. Admin
- Role: `admin`
- Access: Full system management
- Login redirects to: React admin (port 4300)

## Database Setup

### MySQL (Production)
```bash
cd backend
npm run db:mysql:start    # Start MySQL with Docker
npm run db:migrate        # Migrate from SQLite to MySQL
```

### SQLite (Development)
Database file: `backend/awaz-pulse.db`
Auto-created on first run with `npm run start:dev`

## Streaming Setup (Icecast)

### Docker Setup
```bash
docker run -d \
  --name icecast \
  -p 8000:8000 \
  -e ICECAST_ADMIN_PASSWORD=admin123 \
  -e ICECAST_SOURCE_PASSWORD=source123 \
  moul/icecast
```

### Configuration
- Admin URL: http://localhost:8000/admin
- Stream URL: http://localhost:8000/stream
- Mount point: `/live`

## Environment Variables

### Backend (.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=awaz_user
DB_PASSWORD=awaz_pass_2024
DB_NAME=awaz_pulse
JWT_SECRET=your_jwt_secret_key_here
RTMP_SERVER_URL=rtmp://localhost:1935/live
HLS_BASE_URL=http://localhost:8088/hls
```

### Admin-React (.env)
```env
PORT=4300
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  adminUrl: 'http://localhost:4300',
  wsUrl: 'ws://localhost:3000'
};
```

## API Endpoints

### Authentication
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- GET `/auth/profile` - Get user profile

### Channels
- POST `/channels` - Create channel (Station Owner)
- GET `/channels` - Get all channels
- GET `/channels/my-channels` - Get owner's channels
- PATCH `/channels/:id/approve` - Approve channel (Admin)

### Shows
- POST `/shows` - Create show
- GET `/shows/channel/:channelId` - Get channel shows
- GET `/shows/live` - Get live shows

### Performers (Hosts/RJs)
- POST `/persons` - Create performer
- GET `/persons/my-persons` - Get owner's performers

### Guests
- POST `/guests` - Create guest
- GET `/guests/my-guests` - Get owner's guests

### Analytics
- GET `/analytics/overview` - Overall analytics
- GET `/analytics/channels/:id` - Channel analytics
- GET `/analytics/realtime` - Real-time data

## Testing Accounts

### Admin
```json
{
  "email": "admin@awazpulse.com",
  "password": "admin123",
  "role": "admin"
}
```

### Station Owner
```json
{
  "email": "station@fm101.com",
  "password": "station123",
  "role": "station_owner",
  "stationName": "FM 101",
  "stationLicense": "LIC-FM101"
}
```

### End User
```json
{
  "email": "listener@gmail.com",
  "password": "listener123",
  "role": "end_user"
}
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4300
lsof -ti:4300 | xargs kill -9
```

### Database Connection Issues
```bash
# Check MySQL status
docker ps | grep mysql

# Restart MySQL
npm run db:mysql:stop
npm run db:mysql:start
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Technology Stack

- **Backend**: NestJS, TypeORM, MySQL/SQLite, JWT, WebSocket
- **Admin**: React 18, Material-UI, Fuse Template, Redux Toolkit
- **Frontend**: Angular 21, Angular Material, RxJS
- **Streaming**: Icecast, RTMP, HLS, WebSocket

## Documentation

- Main README: `README.md`
- Database Schema: `DATABASE_SCHEMA.md`
- This Setup Guide: `SETUP_GUIDE.md`

## Support

For issues or questions, contact the development team.
