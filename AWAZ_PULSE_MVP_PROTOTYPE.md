# 🎵 Awaz Pulse MVP Prototype - Implementation Plan

## 📋 Overview

Based on your SRS document, we're building a focused MVP that demonstrates:
- **APMP (Awaz Pulse Metadata Protocol)** - Real-time metadata system
- **Pulse Score** - Live ratings based on ACU, TSL, and engagement
- **Unified Radio Platform** - Single app for all Pakistani FM stations
- **Broadcaster Portal** - Station management and analytics

## 🎯 MVP Core Features (From SRS)

### **Must-Have Features**
1. **Listener App**: Browse/play stations, real-time metadata display
2. **APMP System**: Webhook-based live metadata updates
3. **Pulse Score**: Real-time rankings for stations/shows/RJs
4. **Broadcaster Portal**: Station management and analytics
5. **Emergency Mode**: Offline guidelines and low-bandwidth support

### **Key Differentiators**
- First verified digital rating system for Pakistani radio
- Real-time program/RJ identification
- Geo-fenced local station suggestions
- Ultra-low bandwidth "Village Mode"

## 🏗️ Technical Implementation Plan

### **Phase 1: Core Infrastructure (Week 1-2)**

#### Backend Enhancements Needed
```typescript
// 1. APMP Webhook System
@Controller('apmp')
export class ApmpController {
  @Post('webhook/:stationId')
  async receiveMetadata(@Param('stationId') stationId: string, @Body() metadata: ApmpMetadata) {
    // Process real-time metadata updates
    await this.apmpService.updateStationMetadata(stationId, metadata);
    // Trigger real-time updates to listeners
    this.websocketGateway.broadcastMetadataUpdate(stationId, metadata);
  }
}

// 2. Pulse Score Calculation Engine
@Injectable()
export class PulseScoreService {
  calculatePulseScore(stationId: string): Promise<PulseScore> {
    // ACU (Average Concurrent Users)
    // TSL (Time Spent Listening) 
    // Engagement (likes, shares, poll participation)
    return this.analyticsService.computeRealTimeScore(stationId);
  }
}
```

#### New Database Entities
```typescript
// APMP Metadata Entity
@Entity('apmp_metadata')
export class ApmpMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stationId: string;

  @Column()
  programName: string;

  @Column()
  rjName: string;

  @Column()
  contentBlock: string; // Music, Talk, News, Ad

  @Column()
  timestamp: Date;

  @Column({ default: false })
  isStale: boolean; // >30 minutes old
}

// Pulse Score Entity
@Entity('pulse_scores')
export class PulseScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entityType: 'station' | 'show' | 'rj';

  @Column()
  entityId: string;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @Column()
  acu: number; // Average Concurrent Users

  @Column()
  tsl: number; // Time Spent Listening (minutes)

  @Column()
  engagement: number; // Interaction count

  @Column()
  calculatedAt: Date;
}
```

### **Phase 2: Listener Application (Week 2-3)**

#### Enhanced Station Discovery
```typescript
@Component({
  selector: 'app-station-browser',
  template: `
    <div class="station-browser">
      <!-- Geo-fenced Local Stations -->
      <section class="local-stations" *ngIf="localStations.length > 0">
        <h3>📍 Stations Near You ({{ userCity }})</h3>
        <div class="station-grid">
          <div *ngFor="let station of localStations" class="station-card local">
            <div class="station-info">
              <h4>{{ station.name }}</h4>
              <p class="frequency">{{ station.frequency }} FM</p>
              <div class="live-info" *ngIf="station.currentMetadata">
                <span class="program">🎙️ {{ station.currentMetadata.programName }}</span>
                <span class="rj">with {{ station.currentMetadata.rjName }}</span>
              </div>
              <div class="pulse-score">
                <span class="score">{{ station.pulseScore }}</span>
                <span class="label">Pulse Score</span>
              </div>
            </div>
            <div class="station-actions">
              <button class="play-btn" (click)="playStation(station)">
                {{ currentlyPlaying === station.id ? '⏸️' : '▶️' }}
              </button>
              <span class="listeners">{{ station.liveListeners }} listening</span>
            </div>
          </div>
        </div>
      </section>

      <!-- All Stations by City -->
      <section class="all-stations">
        <div class="city-tabs">
          <button *ngFor="let city of cities" 
                  [class.active]="selectedCity === city"
                  (click)="selectCity(city)">
            {{ city }}
          </button>
        </div>
        
        <div class="stations-list">
          <div *ngFor="let station of getStationsByCity(selectedCity)" 
               class="station-row">
            <!-- Station details with real-time metadata -->
          </div>
        </div>
      </section>
    </div>
  `
})
export class StationBrowserComponent {
  localStations: Station[] = [];
  userCity: string;
  selectedCity = 'Karachi';
  cities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi'];
}
```

#### Real-time Metadata Display
```typescript
@Component({
  selector: 'app-now-playing',
  template: `
    <div class="now-playing-widget" *ngIf="currentStation">
      <div class="station-branding">
        <img [src]="currentStation.logo" [alt]="currentStation.name">
        <div class="station-info">
          <h3>{{ currentStation.name }}</h3>
          <p>{{ currentStation.frequency }} FM • {{ currentStation.city }}</p>
        </div>
      </div>
      
      <div class="live-metadata" *ngIf="liveMetadata">
        <div class="program-info">
          <h2>{{ liveMetadata.programName }}</h2>
          <p class="rj-name">with {{ liveMetadata.rjName }}</p>
          <span class="content-type" [ngClass]="liveMetadata.contentBlock.toLowerCase()">
            {{ liveMetadata.contentBlock }}
          </span>
        </div>
        
        <div class="metadata-freshness">
          <span class="last-update">
            Updated {{ getTimeAgo(liveMetadata.timestamp) }}
          </span>
          <span class="freshness-indicator" 
                [ngClass]="{ 'stale': liveMetadata.isStale }">
            {{ liveMetadata.isStale ? '⚠️ Stale' : '🟢 Live' }}
          </span>
        </div>
      </div>

      <div class="pulse-metrics">
        <div class="metric">
          <span class="value">{{ currentStation.liveListeners }}</span>
          <span class="label">Listening Now</span>
        </div>
        <div class="metric">
          <span class="value">{{ currentStation.pulseScore }}</span>
          <span class="label">Pulse Score</span>
        </div>
      </div>
    </div>
  `
})
export class NowPlayingComponent {
  @Input() currentStation: Station;
  liveMetadata: ApmpMetadata;

  ngOnInit() {
    // Subscribe to real-time metadata updates
    this.websocketService.onMetadataUpdate(this.currentStation.id)
      .subscribe(metadata => {
        this.liveMetadata = metadata;
      });
  }
}
```

### **Phase 3: Broadcaster Portal (Week 3-4)**

#### APMP Live Control Panel
```typescript
@Component({
  selector: 'app-live-control-panel',
  template: `
    <div class="live-control-panel">
      <h2>🎙️ Live Control Panel - {{ station.name }}</h2>
      
      <div class="current-status">
        <div class="status-card">
          <h3>Currently Broadcasting</h3>
          <div class="current-info">
            <input [(ngModel)]="currentProgram" placeholder="Program Name" class="program-input">
            <input [(ngModel)]="currentRJ" placeholder="RJ Name" class="rj-input">
            <select [(ngModel)]="currentContentBlock" class="content-select">
              <option value="Music">🎵 Music</option>
              <option value="Talk">💬 Talk</option>
              <option value="News">📰 News</option>
              <option value="Ad">📢 Advertisement</option>
            </select>
          </div>
          <button class="update-btn" (click)="sendLiveUpdate()" [disabled]="isUpdating">
            {{ isUpdating ? 'Updating...' : '📡 Send Live Update' }}
          </button>
        </div>
        
        <div class="quick-actions">
          <h4>Quick Updates</h4>
          <button *ngFor="let preset of quickPresets" 
                  (click)="applyPreset(preset)"
                  class="preset-btn">
            {{ preset.name }}
          </button>
        </div>
      </div>

      <div class="live-metrics">
        <div class="metric-card">
          <h3>{{ liveListeners }}</h3>
          <p>Live Listeners</p>
        </div>
        <div class="metric-card">
          <h3>{{ pulseScore }}</h3>
          <p>Current Pulse Score</p>
        </div>
        <div class="metric-card">
          <h3>{{ ranking }}</h3>
          <p>City Ranking</p>
        </div>
      </div>
    </div>
  `
})
export class LiveControlPanelComponent {
  station: Station;
  currentProgram = '';
  currentRJ = '';
  currentContentBlock = 'Music';
  isUpdating = false;

  quickPresets = [
    { name: 'Morning Show', program: 'Morning Drive', rj: 'RJ Sarah', content: 'Talk' },
    { name: 'Music Block', program: 'Hit Music', rj: 'RJ Ahmed', content: 'Music' },
    { name: 'News Hour', program: 'News Update', rj: 'News Team', content: 'News' }
  ];

  async sendLiveUpdate() {
    this.isUpdating = true;
    try {
      await this.apmpService.sendMetadataUpdate(this.station.id, {
        programName: this.currentProgram,
        rjName: this.currentRJ,
        contentBlock: this.currentContentBlock,
        timestamp: new Date()
      });
      this.showSuccess('Metadata updated successfully!');
    } catch (error) {
      this.showError('Failed to update metadata');
    } finally {
      this.isUpdating = false;
    }
  }
}
```

#### Analytics Dashboard
```typescript
@Component({
  selector: 'app-broadcaster-analytics',
  template: `
    <div class="broadcaster-analytics">
      <div class="analytics-header">
        <h2>📊 {{ station.name }} Analytics</h2>
        <div class="time-selector">
          <button *ngFor="let period of timePeriods" 
                  [class.active]="selectedPeriod === period"
                  (click)="selectPeriod(period)">
            {{ period }}
          </button>
        </div>
      </div>

      <!-- Real-time Pulse Score Ranking -->
      <div class="pulse-ranking">
        <h3>🏆 Live Rankings</h3>
        <div class="ranking-cards">
          <div class="rank-card">
            <h4>Station Rank</h4>
            <div class="rank-display">
              <span class="rank">#{{ stationRank }}</span>
              <span class="context">of {{ totalStations }} in {{ station.city }}</span>
            </div>
          </div>
          <div class="rank-card">
            <h4>Top Show</h4>
            <div class="show-rank">
              <span class="show-name">{{ topShow.name }}</span>
              <span class="rank">#{{ topShow.rank }}</span>
            </div>
          </div>
          <div class="rank-card">
            <h4>Top RJ</h4>
            <div class="rj-rank">
              <span class="rj-name">{{ topRJ.name }}</span>
              <span class="rank">#{{ topRJ.rank }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Listener Analytics -->
      <div class="listener-analytics">
        <div class="chart-container">
          <canvas baseChart
            [data]="listenerChartData"
            [options]="chartOptions"
            type="line">
          </canvas>
        </div>
        
        <div class="metrics-grid">
          <div class="metric">
            <h4>{{ averageConcurrentUsers }}</h4>
            <p>Average Concurrent Users</p>
          </div>
          <div class="metric">
            <h4>{{ averageSessionTime }}min</h4>
            <p>Average Session Time</p>
          </div>
          <div class="metric">
            <h4>{{ totalEngagement }}</h4>
            <p>Total Engagement</p>
          </div>
        </div>
      </div>

      <!-- Geographic Heatmap -->
      <div class="geo-analytics">
        <h3>📍 Listener Geography</h3>
        <div class="city-breakdown">
          <div *ngFor="let cityData of geographicData" class="city-stat">
            <span class="city-name">{{ cityData.city }}</span>
            <div class="listener-bar">
              <div class="bar-fill" [style.width.%]="cityData.percentage"></div>
            </div>
            <span class="listener-count">{{ cityData.listeners }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BroadcasterAnalyticsComponent {
  station: Station;
  selectedPeriod = 'Today';
  timePeriods = ['Today', 'This Week', 'This Month'];
  
  stationRank: number;
  totalStations: number;
  topShow: any;
  topRJ: any;
  
  listenerChartData: any;
  geographicData: any[];
}
```

## 🎯 Implementation Priority

### **Week 1: APMP Foundation**
1. Create APMP webhook endpoints
2. Design metadata database schema
3. Implement real-time WebSocket broadcasting
4. Build basic Pulse Score calculation

### **Week 2: Listener App Core**
1. Station discovery with geo-fencing
2. Real-time metadata display
3. Audio streaming integration
4. Basic pulse score display

### **Week 3: Broadcaster Portal**
1. Live Control Panel for APMP updates
2. Station registration and management
3. Real-time analytics dashboard
4. Pulse Score rankings

### **Week 4: Polish & Demo**
1. Emergency/offline mode
2. Low-bandwidth optimization
3. Mobile responsiveness
4. Demo data and scenarios

## 📊 Demo Scenarios

### **Scenario 1: Real-time Metadata Magic**
1. Station owner updates "Now Playing" via Live Control Panel
2. Metadata instantly appears on all listener apps
3. Pulse Score updates in real-time based on listener response
4. Rankings shift live on broadcaster dashboard

### **Scenario 2: Geo-fenced Discovery**
1. User in Karachi sees local stations first
2. Real-time "Now Playing" info for each station
3. One-tap play with immediate metadata display
4. Live listener counts and Pulse Scores

### **Scenario 3: Emergency Resilience**
1. Internet connection lost
2. App shows cached emergency guidelines
3. Attempts hardware FM tuner fallback
4. Displays offline station information

## 🎪 Key Differentiators to Highlight

1. **First Verified Digital Ratings** - Real ACU/TSL data, not estimates
2. **Real-time Program Identification** - Know exactly what's playing
3. **APMP Protocol** - Open standard for radio metadata
4. **Village Mode** - Works on 2G networks
5. **Emergency Resilience** - Offline guidelines and FM fallback

This focused MVP demonstrates the core innovation while being achievable in 4 weeks!