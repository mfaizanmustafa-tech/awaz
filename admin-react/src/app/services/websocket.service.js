import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.API_URL = 'http://localhost:3000';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
  }

  // Connect to WebSocket server
  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(`${this.API_URL}/streaming`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Admin WebSocket connected:', this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0; // Reset on successful connection
      this.notifyListeners('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Admin WebSocket disconnected:', reason);
      this.connected = false;
      this.notifyListeners('connection', { connected: false });
      
      // Auto-reconnect if disconnected unexpectedly
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        console.log('🔄 Server disconnected, attempting to reconnect...');
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
      this.notifyListeners('connection', { connected: false, failed: true });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
    });

    // Stream events
    this.socket.on('stream:started', (data) => {
      console.log('🎵 Stream started:', data);
      this.notifyListeners('stream:started', data);
    });

    this.socket.on('stream:stopped', (data) => {
      console.log('⏹️ Stream stopped:', data);
      this.notifyListeners('stream:stopped', data);
    });

    this.socket.on('stream:metadata', (data) => {
      console.log('📝 Metadata updated:', data);
      this.notifyListeners('stream:metadata', data);
    });

    this.socket.on('stream:listeners', (data) => {
      console.log('👥 Listener count updated:', data);
      this.notifyListeners('stream:listeners', data);
    });
  }

  // Start streaming (station owner)
  startStream(channelId, streamId, metadata) {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    console.log(`🎙️ Starting stream: ${channelId}`, metadata);
    this.socket.emit('stream:start', { channelId, streamId, metadata });
  }

  // Stop streaming (station owner)
  stopStream(channelId, streamId) {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    console.log(`⏹️ Stopping stream: ${channelId}`);
    this.socket.emit('stream:stop', { channelId, streamId });
  }

  // Update stream metadata (station owner)
  updateMetadata(channelId, metadata) {
    if (!this.socket?.connected) {
      console.error('WebSocket not connected');
      return;
    }

    console.log(`📝 Updating metadata for: ${channelId}`, metadata);
    this.socket.emit('stream:update-metadata', { channelId, metadata });
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id;
  }

  // Subscribe to events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Unsubscribe from events
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // Notify all listeners of an event
  notifyListeners(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => callback(data));
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
