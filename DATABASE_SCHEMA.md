# Awaz Pulse Database Schema

This document describes the comprehensive database schema for the Awaz Pulse radio broadcasting platform.

## Entity Relationship Overview

```
Users (Listeners/Station Owners/Admins)
  ↓
Channels (Radio Stations)
  ↓
Streams (Live Audio Streams)
  ↓
Shows (Radio Programs)
  ↓
Performers (RJs/Hosts) ←→ Shows (Many-to-Many via ShowPerformer)
  ↓
Analytics & Interactions
```

## Core Entities

### 1. Users (`users`)
**Purpose**: All system users including listeners, station owners, and administrators.

**Key Fields**:
- `id` (UUID) - Primary key
- `email` (unique) - Login credential
- `username` (unique, optional) - Display name for listeners
- `role` (enum) - end_user, station_owner, admin
- `firstName`, `lastName` - Personal information
- `city`, `country`, `latitude`, `longitude` - Geographic data
- `totalListeningHours` - Accumulated listening time
- `favoriteGenres[]` - Preferred music genres
- `allowLocationTracking` - Privacy setting

**Relationships**:
- One-to-Many: ListeningSessions, UserInteractions, UserPreferences
- One-to-Many: Channels (for station owners)

### 2. Channels (`channels`)
**Purpose**: Radio stations/channels owned by station owners.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` - Channel name (e.g., "FM 101 Karachi")
- `callSign` - Unique identifier (e.g., "FM101")
- `frequency` - Broadcasting frequency (e.g., "101.0 MHz")
- `category` (enum) - music, news, talk, sports, etc.
- `status` (enum) - active, inactive, suspended, pending_approval
- `city`, `country`, `latitude`, `longitude` - Location
- `licenseNumber`, `licenseExpiryDate` - Legal information
- `ownerId` - Foreign key to Users

**Relationships**:
- Many-to-One: User (owner)
- One-to-Many: Streams, ChannelAnalytics

### 3. Streams (`streams`)
**Purpose**: Live audio streams for each channel.

**Key Fields**:
- `id` (UUID) - Primary key
- `name` - Stream name
- `streamUrl` - Direct streaming URL
- `status` (enum) - live, offline, scheduled, maintenance
- `quality` (enum) - low, medium, high, hd
- `bitrate` - Audio quality in kbps
- `currentListeners` - Real-time listener count
- `maxListeners` - Capacity limit
- `currentShowId` - APMP: Currently playing show
- `currentTrack`, `currentArtist` - APMP: Now playing info
- `metadata` (JSON) - Additional APMP data
- `channelId` - Foreign key to Channels

**Relationships**:
- Many-to-One: Channel
- One-to-Many: Shows, StreamAnalytics, ListeningSessions

### 4. Shows (`shows`)
**Purpose**: Individual radio programs/episodes.

**Key Fields**:
- `id` (UUID) - Primary key
- `title` - Show name
- `type` (enum) - music, talk, news, sports, comedy, etc.
- `status` (enum) - scheduled, live, completed, cancelled
- `scheduledStartTime`, `scheduledEndTime` - Planned timing
- `actualStartTime`, `actualEndTime` - Actual timing
- `recurrenceType` (enum) - none, daily, weekly, monthly
- `recurrenceDays[]` - Days of week for recurring shows
- `tags[]` - Searchable tags
- `isInteractive` - Allows calls, polls, etc.
- `rating` - Average user rating (0-5)
- `peakListeners` - Maximum concurrent audience
- `streamId` - Foreign key to Streams

**Relationships**:
- Many-to-One: Stream
- One-to-Many: ShowPerformers, ShowAnalytics, UserInteractions
- Many-to-Many: Persons (via ShowPerformer)

### 5. Persons (`persons`)
**Purpose**: Radio personalities, RJs, hosts, guests.

**Key Fields**:
- `id` (UUID) - Primary key
- `firstName`, `lastName` - Real name
- `stageName` (unique) - Professional name
- `type` (enum) - rj, host, singer, musician, comedian, etc.
- `status` (enum) - active, inactive, retired
- `bio` - Biography
- `experienceYears` - Years in radio
- `specialties[]` - Areas of expertise
- `languages[]` - Spoken languages
- `overallRating` - Average performance rating
- `totalShows` - Career show count
- `createdById` - Station owner who added them

**Relationships**:
- Many-to-One: User (creator)
- One-to-Many: ShowPerformers, PersonAnalytics
- Many-to-Many: Shows (via ShowPerformer)

### 6. ShowPerformers (`show_performers`)
**Purpose**: Junction table linking shows and performers with roles.

**Key Fields**:
- `id` (UUID) - Primary key
- `role` (enum) - host, co_host, guest, producer, technical
- `isPrimary` - Main performer flag
- `orderIndex` - Display order
- `fee` - Payment amount
- `joinedAt`, `leftAt` - Participation timing
- `participationMinutes` - On-air duration
- `showId`, `personId` - Foreign keys

**Relationships**:
- Many-to-One: Show, Person

## Analytics Entities

### 7. ListeningSessions (`listening_sessions`)
**Purpose**: Individual user listening sessions with detailed tracking.

**Key Fields**:
- `id` (UUID) - Primary key
- `startTime`, `endTime` - Session duration
- `durationSeconds` - Total listening time
- `status` (enum) - active, ended, paused
- `deviceType` (enum) - web, mobile, tablet, etc.
- `latitude`, `longitude` - Location data
- `city`, `country` - Geographic info
- `bufferingEvents` - Technical issues count
- `audioQuality` - Stream quality percentage
- `wasInteractive` - User engagement flag
- `userId`, `streamId`, `showId` - Foreign keys

**Relationships**:
- Many-to-One: User, Stream, Show

### 8. ChannelAnalytics (`channel_analytics`)
**Purpose**: Aggregated channel performance metrics.

**Key Fields**:
- `date` - Analytics date
- `period` (enum) - hourly, daily, weekly, monthly
- `totalListeners` - Unique listener count
- `peakConcurrentListeners` - Maximum simultaneous
- `totalListeningMinutes` - Aggregate listening time
- `averageSessionDuration` - Session length average
- `retentionRate` - Listener retention percentage
- `pulseScore` - Overall channel performance score
- `audienceScore`, `engagementScore` - Component scores
- `topCities` (JSON) - Geographic distribution
- `channelId` - Foreign key

**Relationships**:
- Many-to-One: Channel

### 9. ShowAnalytics (`show_analytics`)
**Purpose**: Individual show performance metrics.

**Key Fields**:
- `totalListeners` - Show audience size
- `completionRate` - Percentage who listened to end
- `averageListeningDuration` - How long people stayed
- `totalInteractions` - Engagement count
- `engagementRate` - Interactions per listener
- `showScore` - Performance rating
- `audienceGrowth` - Compared to previous shows
- `viralityScore` - Social sharing metrics
- `listeningPattern` (JSON) - When people joined/left
- `showId` - Foreign key

**Relationships**:
- Many-to-One: Show

### 10. PersonAnalytics (`person_analytics`)
**Purpose**: Performer/RJ performance tracking.

**Key Fields**:
- `date`, `period` - Time period
- `totalShows` - Shows performed
- `averageAudience` - Average listeners per show
- `peakAudience` - Best performance
- `totalFollowers` - Fan count
- `audienceRetention` - How well they keep listeners
- `personScore` - Overall performer rating
- `popularityScore` - Fan engagement metrics
- `consistencyScore` - Reliability rating
- `personId` - Foreign key

**Relationships**:
- Many-to-One: Person

## Interaction Entities

### 11. UserInteractions (`user_interactions`)
**Purpose**: All user engagement activities.

**Key Fields**:
- `type` (enum) - like, comment, share, rating, poll_vote, etc.
- `content` - Comment text, song request, etc.
- `rating` - 1-5 star rating
- `metadata` (JSON) - Additional interaction data
- `interactionTime` - When during show this occurred
- `userId`, `showId`, `streamId`, `personId` - Foreign keys

**Relationships**:
- Many-to-One: User, Show, Stream, Person

### 12. UserPreferences (`user_preferences`)
**Purpose**: User personalization settings.

**Key Fields**:
- `type` (enum) - favorite_channel, favorite_person, etc.
- `value` - Preference value
- `priority` - Importance ranking
- `userId`, `channelId`, `personId` - Foreign keys

**Relationships**:
- Many-to-One: User, Channel, Person

### 13. Polls (`polls`)
**Purpose**: Interactive polls during shows.

**Key Fields**:
- `question` - Poll question
- `type` (enum) - single_choice, multiple_choice, rating
- `options` (JSON) - Available choices
- `status` (enum) - active, closed, scheduled
- `totalVotes` - Vote count
- `results` (JSON) - Vote distribution
- `showId`, `streamId` - Foreign keys

**Relationships**:
- Many-to-One: Show, Stream
- One-to-Many: PollVotes

### 14. PollVotes (`poll_votes`)
**Purpose**: Individual poll responses.

**Key Fields**:
- `selectedOptions[]` - Chosen answers
- `textResponse` - Free text input
- `rating` - Numeric rating
- `userId`, `pollId` - Foreign keys

**Relationships**:
- Many-to-One: User, Poll

## Key Relationships Summary

### Primary Data Flow:
1. **Station Owner** creates **Channel**
2. **Channel** has multiple **Streams**
3. **Stream** broadcasts **Shows**
4. **Shows** feature **Persons** (via ShowPerformer)
5. **Users** listen via **ListeningSessions**
6. **Users** interact via **UserInteractions**
7. All activities generate **Analytics**

### Analytics Hierarchy:
- **Channel** → ChannelAnalytics (overall station performance)
- **Stream** → StreamAnalytics (technical streaming metrics)
- **Show** → ShowAnalytics (program performance)
- **Person** → PersonAnalytics (performer ratings)

### User Engagement:
- **Users** → ListeningSessions (listening behavior)
- **Users** → UserInteractions (engagement activities)
- **Users** → UserPreferences (personalization)
- **Users** → PollVotes (interactive participation)

## APMP (Awaz Pulse Metadata Protocol) Integration

The **Stream** entity includes APMP fields:
- `currentShowId` - Links to active show
- `currentTrack`, `currentArtist` - Now playing info
- `metadata` (JSON) - Extensible metadata

This enables real-time program information and granular analytics tracking.

## Pulse Score Calculation

The Pulse Score is calculated using multiple components:
- **Audience Score**: Listener count and growth
- **Engagement Score**: Interactions and participation
- **Quality Score**: Ratings and retention
- **Consistency Score**: Regular programming and reliability

Each entity (Channel, Show, Person) has its own scoring system for comprehensive performance evaluation.

## Scalability Considerations

1. **Partitioning**: Analytics tables can be partitioned by date
2. **Indexing**: Composite indexes on frequently queried combinations
3. **Archiving**: Old listening sessions can be archived
4. **Caching**: Real-time metrics can be cached for performance
5. **Aggregation**: Pre-calculated analytics for faster reporting

This schema supports the full Awaz Pulse ecosystem from basic streaming to advanced analytics and user engagement features.