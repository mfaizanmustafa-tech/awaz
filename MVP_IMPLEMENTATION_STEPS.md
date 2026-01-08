# 🚀 Awaz Pulse MVP - Step-by-Step Implementation

## 📋 Current Status Assessment

### ✅ What You Already Have
- NestJS backend with TypeORM
- Angular frontend with enhanced dashboard
- User authentication system
- Basic channel/show/person entities
- Database management tools

### 🔄 What Needs to Be Added for MVP
- APMP webhook system
- Pulse Score calculation engine
- Real-time metadata updates
- Broadcaster portal
- Geo-fencing and emergency features

## 🏗️ IMPLEMENTATION STEPS

### **STEP 1: Backend - APMP System (Days 1-3)**

#### 1.1 Create APMP Entities
```bash
cd backend/src/entities
```

Create new entity files:

**apmp-metadata.entity.ts**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity('apmp_metadata')
export class ApmpMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Channel)
  channel: Channel;

  @Column()
  channelId: string;

  @Column()
  programName: string;

  @Column()
  rjName: string;

  @Column({
    type: 'enum',
    enum: ['Music', 'Talk', 'News', 'Ad', 'Other'],
    default: 'Music'
  })
  contentBlock: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: false })
  isStale: boolean;

  @Column({ nullable: true })
  songTitle?: string;

  @Column({ nullable: true })
  artist?: string;
}
```

**pulse-score.entity.ts**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('pulse_scores')
@Index(['entityType', 'entityId', 'calculatedAt'])
export class PulseScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['station', 'show', 'rj']
  })
  entityType: string;

  @Column()
  entityId: string;

  @Column('decimal', { precision: 8, scale: 2 })
  score: number;

  @Column()
  acu: number; // Average Concurrent Users

  @Column()
  tsl: number; // Time Spent Listening (seconds)

  @Column()
  engagement: number; // Likes, shares, poll votes

  @Column({ nullable: true })
  city?: string;

  @CreateDateColumn()
  calculatedAt: Date;
}
```

#### 1.2 Create APMP Module and Service
```bash
mkdir backend/src/apmp
cd backend/src/apmp
```

**apmp.module.ts**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApmpController } from './apmp.controller';
import { ApmpService } from './apmp.service';
import { ApmpMetadata } from '../entities/apmp-metadata.entity';
import { PulseScore } from '../entities/pulse-score.entity';
import { Channel } from '../entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApmpMetadata, PulseScore, Channel])],
  controllers: [ApmpController],
  providers: [ApmpService],
  exports: [ApmpService],
})
export class ApmpModule {}
```

**apmp.service.ts**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApmpMetadata } from '../entities/apmp-metadata.entity';
import { PulseScore } from '../entities/pulse-score.entity';
import { Channel } from '../entities/channel.entity';

export interface ApmpUpdateDto {
  programName: string;
  rjName: string;
  contentBlock: 'Music' | 'Talk' | 'News' | 'Ad' | 'Other';
  songTitle?: string;
  artist?: string;
}

@Injectable()
export class ApmpService {
  private readonly logger = new Logger(ApmpService.name);

  constructor(
    @InjectRepository(ApmpMetadata)
    private metadataRepository: Repository<ApmpMetadata>,
    @InjectRepository(PulseScore)
    private pulseScoreRepository: Repository<PulseScore>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
  ) {}

  async updateMetadata(channelId: string, updateData: ApmpUpdateDto): Promise<ApmpMetadata> {
    // Mark previous metadata as stale
    await this.metadataRepository.update(
      { channelId, isStale: false },
      { isStale: true }
    );

    // Create new metadata entry
    const metadata = this.metadataRepository.create({
      channelId,
      ...updateData,
      timestamp: new Date(),
      isStale: false,
    });

    const saved = await this.metadataRepository.save(metadata);
    this.logger.log(`Metadata updated for channel ${channelId}: ${updateData.programName}`);
    
    return saved;
  }

  async getCurrentMetadata(channelId: string): Promise<ApmpMetadata | null> {
    return this.metadataRepository.findOne({
      where: { channelId, isStale: false },
      order: { timestamp: 'DESC' },
    });
  }

  async markStaleMetadata(): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    await this.metadataRepository.update(
      { timestamp: { $lt: thirtyMinutesAgo }, isStale: false },
      { isStale: true }
    );
  }

  async calculatePulseScore(entityType: 'station' | 'show' | 'rj', entityId: string): Promise<number> {
    // This is a simplified calculation - you'll enhance this based on your analytics
    const baseScore = Math.random() * 100; // Replace with real calculation
    
    const pulseScore = this.pulseScoreRepository.create({
      entityType,
      entityId,
      score: baseScore,
      acu: Math.floor(Math.random() * 1000),
      tsl: Math.floor(Math.random() * 3600),
      engagement: Math.floor(Math.random() * 100),
      calculatedAt: new Date(),
    });

    await this.pulseScoreRepository.save(pulseScore);
    return baseScore;
  }
}
```

**apmp.controller.ts**
```typescript
import { Controller, Post, Get, Param, Body, Logger } from '@nestjs/common';
import { ApmpService, ApmpUpdateDto } from './apmp.service';

@Controller('apmp')
export class ApmpController {
  private readonly logger = new Logger(ApmpController.name);

  constructor(private readonly apmpService: ApmpService) {}

  @Post('webhook/:channelId')
  async receiveWebhook(
    @Param('channelId') channelId: string,
    @Body() updateData: ApmpUpdateDto,
  ) {
    this.logger.log(`Received APMP webhook for channel ${channelId}`);
    
    const metadata = await this.apmpService.updateMetadata(channelId, updateData);
    
    // TODO: Broadcast to WebSocket clients
    // this.websocketGateway.broadcastMetadataUpdate(channelId, metadata);
    
    return {
      success: true,
      message: 'Metadata updated successfully',
      timestamp: metadata.timestamp,
    };
  }

  @Get('metadata/:channelId')
  async getCurrentMetadata(@Param('channelId') channelId: string) {
    const metadata = await this.apmpService.getCurrentMetadata(channelId);
    return {
      channelId,
      metadata,
      isLive: metadata && !metadata.isStale,
    };
  }

  @Get('pulse-score/:entityType/:entityId')
  async getPulseScore(
    @Param('entityType') entityType: 'station' | 'show' | 'rj',
    @Param('entityId') entityId: string,
  ) {
    const score = await this.apmpService.calculatePulseScore(entityType, entityId);
    return { entityType, entityId, score };
  }
}
```

#### 1.3 Add WebSocket Support
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

**realtime.gateway.ts**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  @SubscribeMessage('joinChannel')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: string,
  ) {
    client.join(`channel_${channelId}`);
    this.logger.log(`Client ${client.id} joined channel ${channelId}`);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() channelId: string,
  ) {
    client.leave(`channel_${channelId}`);
    this.logger.log(`Client ${client.id} left channel ${channelId}`);
  }

  broadcastMetadataUpdate(channelId: string, metadata: any) {
    this.server.to(`channel_${channelId}`).emit('metadataUpdate', {
      channelId,
      metadata,
      timestamp: new Date(),
    });
  }

  broadcastListenerCount(channelId: string, count: number) {
    this.server.to(`channel_${channelId}`).emit('listenerCountUpdate', {
      channelId,
      count,
      timestamp: new Date(),
    });
  }
}
```

### **STEP 2: Frontend - Real-time Metadata Display (Days 4-6)**

#### 2.1 Install WebSocket Client
```bash
cd frontend
npm install socket.io-client
```

#### 2.2 Create WebSocket Service
**src/app/services/websocket.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  joinChannel(channelId: string): void {
    this.socket.emit('joinChannel', channelId);
  }

  leaveChannel(channelId: string): void {
    this.socket.emit('leaveChannel', channelId);
  }

  onMetadataUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('metadataUpdate', data => observer.next(data));
    });
  }

  onListenerCountUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('listenerCountUpdate', data => observer.next(data));
    });
  }
}
```

#### 2.3 Create APMP Service
**src/app/services/apmp.service.ts**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApmpMetadata {
  id: string;
  channelId: string;
  programName: string;
  rjName: string;
  contentBlock: string;
  timestamp: string;
  isStale: boolean;
  songTitle?: string;
  artist?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApmpService {
  private readonly API_URL = 'http://localhost:3000/apmp';

  constructor(private http: HttpClient) {}

  getCurrentMetadata(channelId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/metadata/${channelId}`);
  }

  sendMetadataUpdate(channelId: string, metadata: any): Observable<any> {
    return this.http.post(`${this.API_URL}/webhook/${channelId}`, metadata);
  }

  getPulseScore(entityType: string, entityId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/pulse-score/${entityType}/${entityId}`);
  }
}
```

### **STEP 3: Enhanced User Dashboard (Days 7-9)**

Update your existing user dashboard to include APMP features:

```typescript
// Add to your existing user-dashboard.component.ts

export class UserDashboardComponent implements OnInit, OnDestroy {
  // ... existing properties ...
  
  // New APMP-related properties
  currentMetadata: { [channelId: string]: ApmpMetadata } = {};
  pulseScores: { [channelId: string]: number } = {};
  userLocation: { city: string; lat: number; lng: number } | null = null;
  localChannels: Channel[] = [];

  constructor(
    // ... existing dependencies ...
    private apmpService: ApmpService,
    private websocketService: WebSocketService,
    private geolocationService: GeolocationService
  ) {}

  ngOnInit(): void {
    // ... existing initialization ...
    this.getUserLocation();
    this.subscribeToRealtimeUpdates();
    this.loadCurrentMetadata();
  }

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            city: 'Karachi', // You'll need a reverse geocoding service
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.loadLocalChannels();
        },
        (error) => {
          console.log('Location access denied, using default');
          this.userLocation = { city: 'Karachi', lat: 24.8607, lng: 67.0011 };
          this.loadLocalChannels();
        }
      );
    }
  }

  loadLocalChannels(): void {
    if (this.userLocation) {
      this.localChannels = this.channels.filter(
        channel => channel.city === this.userLocation?.city
      );
    }
  }

  subscribeToRealtimeUpdates(): void {
    this.websocketService.onMetadataUpdate().subscribe((update) => {
      this.currentMetadata[update.channelId] = update.metadata;
      this.addNotification(
        `${update.metadata.programName} now playing on ${this.getChannelName(update.channelId)}`,
        'info'
      );
    });

    this.websocketService.onListenerCountUpdate().subscribe((update) => {
      const channel = this.channels.find(c => c.id === update.channelId);
      if (channel) {
        channel.listeners = update.count;
      }
    });
  }

  loadCurrentMetadata(): void {
    this.channels.forEach(channel => {
      this.apmpService.getCurrentMetadata(channel.id).subscribe({
        next: (response) => {
          if (response.metadata) {
            this.currentMetadata[channel.id] = response.metadata;
          }
        },
        error: (error) => console.error('Error loading metadata:', error)
      });

      // Load pulse scores
      this.apmpService.getPulseScore('station', channel.id).subscribe({
        next: (response) => {
          this.pulseScores[channel.id] = response.score;
        },
        error: (error) => console.error('Error loading pulse score:', error)
      });
    });
  }

  listenToChannel(channelId: string): void {
    if (this.currentlyPlaying === channelId) {
      this.stopPlaying();
    } else {
      // Leave previous channel
      if (this.currentlyPlaying) {
        this.websocketService.leaveChannel(this.currentlyPlaying);
      }
      
      // Join new channel
      this.websocketService.joinChannel(channelId);
      this.currentlyPlaying = channelId;
      this.isPlaying = true;
      
      const channel = this.channels.find(c => c.id === channelId);
      this.addNotification(
        `🎵 Now playing: ${channel?.name}`,
        'success'
      );
    }
  }

  getCurrentMetadataForChannel(channelId: string): ApmpMetadata | null {
    return this.currentMetadata[channelId] || null;
  }

  getPulseScoreForChannel(channelId: string): number {
    return this.pulseScores[channelId] || 0;
  }

  getChannelName(channelId: string): string {
    const channel = this.channels.find(c => c.id === channelId);
    return channel?.name || 'Unknown Station';
  }
}
```

### **STEP 4: Broadcaster Portal (Days 10-12)**

Create a new broadcaster dashboard component:

```bash
ng generate component dashboards/broadcaster-dashboard
```

This will be your Live Control Panel for APMP updates and analytics.

### **STEP 5: Demo Data & Testing (Days 13-14)**

Create realistic Pakistani radio station data and test all APMP workflows.

## 🎯 Key Features to Demonstrate

1. **Real-time Metadata Updates** - Station updates program info, instantly appears on all listeners
2. **Pulse Score Rankings** - Live leaderboards based on actual listener behavior  
3. **Geo-fenced Discovery** - Local stations appear first based on user location
4. **Emergency Resilience** - Offline mode with cached information
5. **Low-bandwidth Mode** - Optimized for 2G networks

## 📱 Mobile Optimization

Ensure the app works perfectly on mobile devices with:
- Touch-friendly controls
- Offline caching
- Background audio playback
- Lock screen controls

This implementation plan builds directly on your existing codebase while adding the core APMP and Pulse Score innovations that make Awaz Pulse unique!