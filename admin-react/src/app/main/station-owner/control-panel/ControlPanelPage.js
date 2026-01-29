import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import websocketService from '../../../services/websocket.service';
import LiveChatWidget from '../components/LiveChatWidget';

const API_URL = 'http://localhost:3000';

// Mock data for fallback
const mockShows = [
  {
    id: '1',
    title: 'Morning Drive Show',
    type: 'music',
    status: 'scheduled',
    shortDescription: 'Start your day with the best music and entertainment',
    performers: [{ isPrimary: true, person: { stageName: 'RJ Mike', overallRating: '4.5' } }]
  },
  {
    id: '2',
    title: 'Evening Talk',
    type: 'talk',
    status: 'scheduled',
    shortDescription: 'Engaging conversations on current topics',
    performers: [{ isPrimary: true, person: { stageName: 'RJ Sarah', overallRating: '4.8' } }]
  },
  {
    id: '3',
    title: 'Night Beats',
    type: 'music',
    status: 'scheduled',
    shortDescription: 'The best electronic and dance music',
    performers: [{ isPrimary: true, person: { stageName: 'DJ Alex', overallRating: '4.7' } }]
  }
];

function ControlPanelPage() {
  console.log('ControlPanelPage component loaded');
  
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [streamState, setStreamState] = useState('off_air');
  const [streamType, setStreamType] = useState('hls');
  const [currentListeners, setCurrentListeners] = useState(0);
  const [peakListeners, setPeakListeners] = useState(0);
  const [uptime, setUptime] = useState('0h 0m');
  const [totalListeningTime, setTotalListeningTime] = useState('0h 0m');
  const [currentTime, setCurrentTime] = useState('');
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [rtmpCredentials, setRtmpCredentials] = useState(null);
  const [icecastCredentials, setIcecastCredentials] = useState(null);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showIcecastPassword, setShowIcecastPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [switchingStreamType, setSwitchingStreamType] = useState(false);
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState(null);

  const loadData = async () => {
    try {
      console.log('Loading control panel data...');
      const token = localStorage.getItem('jwt_access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // First load channels
      const channelsRes = await axios.get('http://localhost:3000/channels/my-channels', config).catch(() => ({ data: [] }));
      const channelsData = channelsRes.data || [];

      console.log('Loaded channels:', channelsData.length);

      // Then load shows for each channel
      let allShows = [];
      if (channelsData.length > 0) {
        const showsPromises = channelsData.map(channel => 
          axios.get(`http://localhost:3000/shows/channel/${channel.id}`, config)
            .then(res => res.data)
            .catch(() => [])
        );
        const showsArrays = await Promise.all(showsPromises);
        allShows = showsArrays.flat(); // Flatten array of arrays
      }

      const showsData = allShows.length > 0 ? allShows : mockShows;

      console.log('Loaded shows:', showsData.length);
      console.log('📊 Shows data with performers:', showsData.map(s => ({
        id: s.id,
        title: s.title,
        performers: s.performers,
        hasPerformers: !!s.performers && s.performers.length > 0
      })));

      setChannels(channelsData);
      setShows(showsData);
      
      // Restore selected show from localStorage after shows are loaded
      try {
        const savedShow = localStorage.getItem('awaz_current_show');
        console.log('📦 Checking for saved show in localStorage:', savedShow ? 'Found' : 'Not found');
        
        if (savedShow) {
          const savedShowData = JSON.parse(savedShow);
          console.log('📦 Saved show data:', savedShowData);
          console.log('📦 Available shows:', showsData.map(s => ({ id: s.id, title: s.title })));
          
          // Find the matching show in the loaded shows by ID
          const matchingShow = showsData.find(show => show.id === savedShowData.id);
          
          if (matchingShow) {
            setSelectedShow(matchingShow);
            console.log('✅ Restored selected show from loaded data:', matchingShow.title);
          } else {
            console.warn('⚠️ Saved show not found in loaded shows');
            console.warn('⚠️ Looking for ID:', savedShowData.id);
            console.warn('⚠️ Available IDs:', showsData.map(s => s.id));
            localStorage.removeItem('awaz_current_show');
          }
        } else {
          console.log('ℹ️ No saved show in localStorage');
        }
      } catch (error) {
        console.error('❌ Error restoring selected show:', error);
      }

      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
        
        if (channelsData[0].streamKey) {
          const rtmpUrl = channelsData[0].rtmpUrl || 'rtmp://localhost:1935/live';
          setRtmpCredentials({
            rtmpServer: rtmpUrl,
            streamKey: channelsData[0].streamKey,
            hlsPlaybackUrl: channelsData[0].hlsPlaybackUrl || '',
            fullRtmpUrl: `${rtmpUrl}/${channelsData[0].streamKey}`
          });
        }

        // Load listening time data
        loadListeningTime(channelsData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setShows(mockShows);
    } finally {
      setLoading(false);
    }
  };

  const loadListeningTime = async (channelId) => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      const response = await axios.get(
        `${API_URL}/analytics/channels/${channelId}/listening-time?period=today`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.totalListeningTime) {
        setTotalListeningTime(response.data.totalListeningTime.formatted);
        console.log('📊 Total listening time:', response.data.totalListeningTime.formatted);
      }
    } catch (error) {
      console.error('Error loading listening time:', error);
    }
  };

  const handleGoLive = async () => {
    if (!selectedShow) {
      alert('Please select a show first');
      return;
    }

    if (!selectedChannel) {
      alert('No channel selected');
      return;
    }

    setIsGoingLive(true);
    
    try {
      const token = localStorage.getItem('jwt_access_token');
      
      // Get the stream URL based on streaming type
      let streamUrl = '';
      if (streamType === 'icecast') {
        // Icecast stream URL - this is what users will listen to
        streamUrl = icecastCredentials?.streamUrl || 'http://localhost:8000/stream';
        console.log('🎵 Using Icecast stream URL:', streamUrl);
      } else {
        // HLS stream URL
        streamUrl = rtmpCredentials?.hlsPlaybackUrl || selectedChannel.hlsPlaybackUrl;
        console.log('📺 Using HLS stream URL:', streamUrl);
      }
      
      // Extract host information from show
      const hostInfo = getHostName(selectedShow);
      
      console.log('🎭 Show data:', {
        show: selectedShow,
        performers: selectedShow.performers,
        extractedHost: hostInfo
      });
      
      const metadata = {
        showTitle: selectedShow.title,
        showType: selectedShow.type,
        hostStageName: hostInfo,
        streamSource: streamType,
        streamUrl,
        isLive: true,
      };
      
      console.log('🔴 Going LIVE with:', {
        channelId: selectedChannel.id,
        channelName: selectedChannel.name,
        show: selectedShow.title,
        streamType,
        streamUrl,
        metadata
      });
      
      // Update the stream status in the backend
      const response = await axios.post(
        `${API_URL}/channels/${selectedChannel.id}/go-live`,
        { 
          showId: selectedShow.id,
          streamType,
          streamUrl,
          showTitle: selectedShow.title,
          showType: selectedShow.type,
          hostStageName: hostInfo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Backend response:', response.data);
      
      // Store the stream ID for later use
      setCurrentStreamId(response.data.streamId);
      
      // Connect to WebSocket if not already connected
      if (!websocketService.isConnected()) {
        console.log('🔌 Connecting to WebSocket...');
        websocketService.connect();
        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Broadcast metadata via WebSocket to all listeners
      if (websocketService.isConnected()) {
        console.log('📡 Broadcasting metadata via WebSocket');
        
        // Start the stream via WebSocket
        websocketService.startStream(
          selectedChannel.id,
          response.data.streamId,
          metadata
        );
        
        // Also send metadata update
        websocketService.updateMetadata(selectedChannel.id, metadata);
        
        console.log('✅ WebSocket broadcast sent');
      } else {
        console.warn('⚠️ WebSocket not connected, metadata not broadcast');
      }
      
      // Update local state and persist to localStorage
      setStreamState('live');
      localStorage.setItem('awaz_is_live', 'true');
      localStorage.setItem('awaz_current_show', JSON.stringify(selectedShow));
      localStorage.setItem('awaz_stream_type', streamType);
      localStorage.setItem('awaz_stream_id', response.data.streamId);
      
      console.log('💾 Saved to localStorage:', {
        isLive: 'true',
        show: selectedShow.title,
        showId: selectedShow.id,
        streamType
      });
      
      alert(`Now LIVE! Users can listen at: ${streamUrl}`);
      
    } catch (error) {
      console.error('❌ Error starting stream:', error);
      alert('Failed to start stream: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsGoingLive(false);
    }
  };

  // NEW: Function to change show during live streaming
  const handleChangeShowLive = async (newShow) => {
    if (!selectedChannel || streamState !== 'live') {
      // If not live, just select the show normally
      setSelectedShow(newShow);
      localStorage.setItem('awaz_current_show', JSON.stringify(newShow));
      return;
    }

    console.log('🔄 Changing show during LIVE stream:', {
      from: selectedShow?.title,
      to: newShow.title
    });

    try {
      // Update selected show immediately (optimistic update)
      setSelectedShow(newShow);
      localStorage.setItem('awaz_current_show', JSON.stringify(newShow));

      const metadata = {
        showTitle: newShow.title,
        showType: newShow.type,
        hostStageName: getHostName(newShow),
        streamSource: streamType,
        isLive: true,
      };

      // Broadcast metadata update via WebSocket INSTANTLY
      if (websocketService.isConnected()) {
        console.log('📡 Broadcasting show change via WebSocket');
        websocketService.updateMetadata(selectedChannel.id, metadata);
        console.log('✅ Show change broadcast sent');
      }

      // Also update backend (non-blocking)
      const token = localStorage.getItem('jwt_access_token');
      axios.post(
        `${API_URL}/channels/${selectedChannel.id}/update-show`,
        { 
          showId: newShow.id,
          showTitle: newShow.title,
          showType: newShow.type,
          hostStageName: getHostName(newShow),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(() => {
        console.log('✅ Backend updated with new show');
      }).catch(err => {
        console.error('⚠️ Failed to update backend:', err);
      });

      alert(`Show changed to: ${newShow.title}`);
    } catch (error) {
      console.error('❌ Error changing show:', error);
    }
  };

  const handleOffAir = async () => {
    if (!window.confirm('Are you sure you want to go off air?')) return;

    try {
      const token = localStorage.getItem('jwt_access_token');
      
      const response = await axios.post(
        `${API_URL}/channels/${selectedChannel.id}/stop-stream`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Broadcast stop via WebSocket
      if (websocketService.isConnected() && response.data.streamId) {
        console.log('📡 Broadcasting stream stop via WebSocket');
        websocketService.stopStream(selectedChannel.id, response.data.streamId);
      }
      
      setStreamState('off_air');
      localStorage.setItem('awaz_is_live', 'false');
      localStorage.removeItem('awaz_current_show');
      
      console.log('⚫ Going OFF AIR');
    } catch (error) {
      console.error('❌ Error stopping stream:', error);
    }
  };

  const switchStreamingType = async (type) => {
    if (streamType === type) return;

    setSwitchingStreamType(true);
    try {
      const token = localStorage.getItem('jwt_access_token');
      await axios.post(
        `http://localhost:3000/streams/channel/${selectedChannel.id}/switch-type`,
        { streamType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStreamType(type);
      setRtmpCredentials(null);
      setIcecastCredentials(null);
      localStorage.setItem('awaz_stream_type', type);
      console.log(`✅ Switched to ${type} streaming`);
      
      // Auto-load credentials for the new type
      if (type === 'hls') {
        loadStreamingCredentials();
      } else if (type === 'icecast') {
        loadIcecastCredentials();
      }
    } catch (error) {
      console.error('Error switching stream type:', error);
      alert('Failed to switch streaming type');
    } finally {
      setSwitchingStreamType(false);
    }
  };

  const loadIcecastCredentials = async () => {
    if (!selectedChannel) return;

    setLoadingCredentials(true);
    try {
      const token = localStorage.getItem('jwt_access_token');
      const response = await axios.get(
        `http://localhost:3000/streams/channel/${selectedChannel.id}/credentials`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { streamType: 'icecast' }
        }
      );
      setIcecastCredentials({
        serverUrl: response.data.serverUrl || 'http://localhost:8000',
        mountPoint: response.data.mountPoint || '/stream',
        username: response.data.username || 'source',
        password: response.data.password || 'hackme',
        streamUrl: response.data.streamUrl || 'http://localhost:8000/stream'
      });
      console.log('✅ Loaded Icecast credentials');
    } catch (error) {
      console.error('Error loading Icecast credentials:', error);
      // Set default Icecast credentials
      setIcecastCredentials({
        serverUrl: 'http://localhost:8000',
        mountPoint: '/stream',
        username: 'source',
        password: 'hackme',
        streamUrl: 'http://localhost:8000/stream'
      });
    } finally {
      setLoadingCredentials(false);
    }
  };

  const loadStreamingCredentials = async () => {
    if (!selectedChannel) return;

    setLoadingCredentials(true);
    try {
      const token = localStorage.getItem('jwt_access_token');
      const response = await axios.get(
        `http://localhost:3000/channels/${selectedChannel.id}/streaming-credentials`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRtmpCredentials({
        rtmpServer: response.data.rtmpServer,
        streamKey: response.data.streamKey,
        hlsPlaybackUrl: response.data.hlsPlaybackUrl,
        fullRtmpUrl: response.data.fullRtmpUrl
      });
      console.log('✅ Loaded streaming credentials');
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getShowTypeIcon = (type) => {
    const icons = {
      music: 'heroicons-outline:musical-note',
      talk: 'heroicons-outline:chat-bubble-left-right',
      news: 'heroicons-outline:newspaper',
      sports: 'heroicons-outline:trophy',
      comedy: 'heroicons-outline:face-smile',
      educational: 'heroicons-outline:academic-cap',
      religious: 'heroicons-outline:heart',
      call_in: 'heroicons-outline:phone',
      live_event: 'heroicons-outline:calendar',
      podcast: 'heroicons-outline:microphone',
      documentary: 'heroicons-outline:film'
    };
    return icons[type] || 'heroicons-outline:microphone';
  };

  const getHostName = (show) => {
    if (!show) return 'Station Host';
    if (show.performers && show.performers.length > 0) {
      const primaryHost = show.performers.find(p => p.isPrimary) || show.performers[0];
      return primaryHost.person?.stageName || primaryHost.person?.firstName || 'Station Host';
    }
    return 'Station Host';
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    // Restore state from localStorage (except selected show which is restored in loadData)
    const restoreState = () => {
      try {
        // Restore stream state
        const savedIsLive = localStorage.getItem('awaz_is_live');
        if (savedIsLive === 'true') {
          setStreamState('live');
          console.log('🔄 Restored LIVE state from localStorage');
        }
        
        // Restore stream type
        const savedStreamType = localStorage.getItem('awaz_stream_type');
        if (savedStreamType === 'hls' || savedStreamType === 'icecast') {
          setStreamType(savedStreamType);
          console.log('🔄 Restored stream type:', savedStreamType);
        }
      } catch (error) {
        console.error('Error restoring state:', error);
      }
    };
    
    restoreState();
    loadData(); // This will also restore the selected show after shows are loaded
    
    // Initialize WebSocket connection
    console.log('🔌 Initializing WebSocket connection for admin panel');
    websocketService.connect();
    
    // Listen for connection status
    const handleConnection = (data) => {
      console.log('WebSocket connection status:', data.connected);
    };
    websocketService.on('connection', handleConnection);
    
    // Listen for listener count updates
    const handleListenerUpdate = (data) => {
      console.log('👥 Received listener update:', data);
      if (data.channelId === selectedChannel?.id) {
        setCurrentListeners(data.count);
        console.log('👥 Listener count updated for current channel:', data.count);
      }
    };
    websocketService.on('stream:listeners', handleListenerUpdate);
    
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    
    return () => {
      clearInterval(timer);
      websocketService.off('connection', handleConnection);
      websocketService.off('stream:listeners', handleListenerUpdate);
      // Don't disconnect WebSocket here as it might be used by other components
    };
  }, [selectedChannel?.id]); // Add selectedChannel.id as dependency

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-32">
        <div className="text-center">
          <FuseSvgIcon className="animate-spin text-purple-600" size={48}>heroicons-outline:arrow-path</FuseSvgIcon>
          <p className="mt-16 text-gray-600">Loading your channels...</p>
        </div>
      </div>
    );
  }

  if (!selectedChannel || channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-96 h-96 mx-auto mb-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <FuseSvgIcon className="text-purple-600" size={48}>heroicons-outline:radio</FuseSvgIcon>
          </div>
          <h2 className="text-2xl font-bold mb-12">Control Panel Unavailable</h2>
          <p className="text-gray-600 mb-24">You need to create a channel before you can access the broadcasting control panel.</p>
          <button className="px-24 py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
            <FuseSvgIcon size={20} className="mr-8">heroicons-outline:plus</FuseSvgIcon>
            Create Your Channel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-24 sm:p-32 w-full min-h-full">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-24 p-32 rounded-16 bg-gradient-to-r from-purple-800 to-purple-900 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center">
              <FuseSvgIcon className="text-purple-600" size={32}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Broadcasting Control Center</h1>
              <div className="flex items-center gap-16 text-white opacity-90 text-sm">
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:signal</FuseSvgIcon>
                  <span>{streamState === 'live' ? 'Live' : 'Off Air'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:users</FuseSvgIcon>
                  <span>{currentListeners} Listeners</span>
                </div>
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            className="px-20 py-10 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-8"
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrow-path</FuseSvgIcon>
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Channel Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-24 p-24 bg-white rounded-16 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FuseSvgIcon className="text-white" size={24}>heroicons-outline:radio</FuseSvgIcon>
            </div>
            <div>
              <h2 className="text-xl font-bold">{selectedChannel.name}</h2>
              <div className="flex gap-8 mt-4">
                <span className="px-8 py-2 bg-gray-100 text-gray-700 text-xs rounded">
                  {selectedChannel.frequency} MHz
                </span>
                <span className="px-8 py-2 bg-gray-100 text-gray-700 text-xs rounded">
                  {selectedChannel.callSign}
                </span>
                <span className="px-8 py-2 bg-gray-100 text-gray-700 text-xs rounded">
                  {selectedChannel.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12">
            {streamState !== 'live' ? (
              <button
                onClick={handleGoLive}
                disabled={!selectedShow || isGoingLive}
                className="px-32 py-12 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:play-circle</FuseSvgIcon>
                {isGoingLive ? 'Going Live...' : 'Go Live'}
              </button>
            ) : (
              <button
                onClick={handleOffAir}
                className="px-32 py-12 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all flex items-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:stop-circle</FuseSvgIcon>
                Off Air
              </button>
            )}
            <button className="px-20 py-12 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-8">
              <FuseSvgIcon size={20}>heroicons-outline:information-circle</FuseSvgIcon>
              Details
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
        {[
          { label: 'Live Listeners', value: formatNumber(currentListeners), icon: 'heroicons-outline:users', color: 'purple' },
          { label: 'Peak Today', value: formatNumber(peakListeners), icon: 'heroicons-outline:chart-bar', color: 'pink' },
          { label: 'Listening Time Today', value: totalListeningTime, icon: 'heroicons-outline:clock', color: 'blue' },
          { label: 'Stream Status', value: streamState === 'live' ? 'LIVE' : 'OFF AIR', icon: 'heroicons-outline:signal', color: streamState === 'live' ? 'green' : 'gray' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="p-20 bg-white rounded-12 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-4">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
              <div className={`w-48 h-48 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                <FuseSvgIcon className={`text-${stat.color}-600`} size={24}>{stat.icon}</FuseSvgIcon>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Left: Show Selection */}
        <div className="lg:col-span-2 space-y-24">
          {/* Current Show */}
          {selectedShow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-24 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-16 shadow-lg"
            >
              <div className="flex items-center justify-between mb-16">
                <span className={`px-12 py-6 rounded-full text-xs font-bold ${streamState === 'live' ? 'bg-red-500 animate-pulse' : 'bg-white text-purple-600'}`}>
                  {streamState === 'live' ? '🔴 NOW STREAMING' : '✓ READY TO STREAM'}
                </span>
                <span className="text-sm">{currentTime}</span>
              </div>
              <div className="flex items-center gap-16">
                <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center">
                  <FuseSvgIcon className="text-purple-600" size={32}>{getShowTypeIcon(selectedShow.type)}</FuseSvgIcon>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-8">{selectedShow.title}</h3>
                  <div className="flex gap-8 mb-8">
                    <span className="px-8 py-2 bg-white text-purple-600 text-xs rounded">{selectedShow.type}</span>
                    <span className="px-8 py-2 bg-white text-purple-600 text-xs rounded flex items-center gap-4">
                      <FuseSvgIcon size={14}>heroicons-outline:microphone</FuseSvgIcon>
                      RJ {getHostName(selectedShow)}
                    </span>
                  </div>
                  {selectedShow.shortDescription && (
                    <p className="opacity-90 text-sm">{selectedShow.shortDescription}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedShow(null);
                    localStorage.removeItem('awaz_current_show');
                    console.log('🗑️ Cleared selected show');
                  }}
                  className="px-16 py-8 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Change Show
                </button>
              </div>
              {streamState === 'live' && (
                <div className="mt-16 p-12 bg-white bg-opacity-20 rounded-lg text-sm">
                  <FuseSvgIcon size={16} className="inline mr-8">heroicons-outline:information-circle</FuseSvgIcon>
                  Click any show below to switch LIVE - listeners will see the change instantly!
                </div>
              )}
            </motion.div>
          )}

          {/* Show Selection Grid */}
          <div className="p-24 bg-white rounded-16 shadow-lg">
            <div className="flex items-center justify-between mb-24">
              <h3 className="text-xl font-bold flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:tv</FuseSvgIcon>
                Select Show to Stream
              </h3>
              <button className="px-16 py-8 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-8">
                <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                New Show
              </button>
            </div>

            {shows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
                {shows.map((show) => (
                  <motion.div
                    key={show.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChangeShowLive(show)}
                    className={`p-20 rounded-12 cursor-pointer transition-all ${
                      selectedShow?.id === show.id
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-12 mb-12">
                      <div className={`w-40 h-40 rounded-full flex items-center justify-center ${
                        selectedShow?.id === show.id ? 'bg-white' : 'bg-purple-100'
                      }`}>
                        <FuseSvgIcon className={selectedShow?.id === show.id ? 'text-purple-600' : 'text-purple-600'} size={20}>
                          {getShowTypeIcon(show.type)}
                        </FuseSvgIcon>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">{show.title}</h4>
                        <p className="text-xs opacity-75">{show.type}</p>
                      </div>
                      {selectedShow?.id === show.id && (
                        <FuseSvgIcon size={24}>heroicons-outline:check-circle</FuseSvgIcon>
                      )}
                    </div>
                    {show.performers?.[0] && (
                      <p className="text-xs opacity-75 flex items-center gap-4">
                        <FuseSvgIcon size={12}>heroicons-outline:microphone</FuseSvgIcon>
                        {getHostName(show)}
                      </p>
                    )}
                    {streamState === 'live' && selectedShow?.id !== show.id && (
                      <div className="mt-8 text-xs bg-white bg-opacity-20 px-8 py-4 rounded">
                        Click to switch show LIVE
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-48">
                <FuseSvgIcon className="text-gray-400 mx-auto mb-16" size={48}>heroicons-outline:tv</FuseSvgIcon>
                <h4 className="text-lg font-bold mb-8">No Shows Available</h4>
                <p className="text-gray-600 mb-24">Create a show to start streaming</p>
                <button className="px-24 py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <FuseSvgIcon size={20} className="mr-8">heroicons-outline:plus</FuseSvgIcon>
                  Create Your First Show
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Streaming Method & Credentials */}
        <div className="space-y-24">
          {/* Stream Type Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <h3 className="text-lg font-bold mb-16 flex items-center gap-8">
              <FuseSvgIcon size={24}>heroicons-outline:radio</FuseSvgIcon>
              Streaming Method
            </h3>
            <div className="space-y-12">
              <button
                onClick={() => switchStreamingType('hls')}
                disabled={switchingStreamType}
                className={`w-full p-16 rounded-lg text-left transition-all ${
                  streamType === 'hls'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-12">
                  <FuseSvgIcon size={20}>heroicons-outline:video-camera</FuseSvgIcon>
                  <div className="flex-1">
                    <h4 className="font-bold">HLS Streaming</h4>
                    <p className="text-xs opacity-75">Best browser compatibility • 10-30s latency</p>
                  </div>
                  {streamType === 'hls' && <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>}
                </div>
              </button>
              <button
                onClick={() => switchStreamingType('icecast')}
                disabled={switchingStreamType}
                className={`w-full p-16 rounded-lg text-left transition-all ${
                  streamType === 'icecast'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'border-2 border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-12">
                  <FuseSvgIcon size={20}>heroicons-outline:bolt</FuseSvgIcon>
                  <div className="flex-1">
                    <h4 className="font-bold">Icecast Streaming</h4>
                    <p className="text-xs opacity-75">Low latency • 2-5s delay</p>
                  </div>
                  {streamType === 'icecast' && <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>}
                </div>
              </button>
            </div>
            {switchingStreamType && (
              <div className="mt-16 text-center text-sm text-gray-600">
                <FuseSvgIcon className="animate-spin inline-block mr-8" size={16}>heroicons-outline:arrow-path</FuseSvgIcon>
                Switching streaming method...
              </div>
            )}
          </motion.div>

          {/* RTMP Credentials (HLS) */}
          {streamType === 'hls' && rtmpCredentials && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-24 bg-white rounded-16 shadow-lg"
            >
              <h3 className="text-lg font-bold mb-16 flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:key</FuseSvgIcon>
                OBS / RTMP Setup
              </h3>
              <div className="mb-16 p-12 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Use these credentials in OBS Studio or any RTMP streaming software
              </div>
              <div className="space-y-12">
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">RTMP Server URL</label>
                  <div className="flex items-center gap-8">
                    <input
                      type="text"
                      value={rtmpCredentials.rtmpServer}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(rtmpCredentials.rtmpServer)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">Stream Key</label>
                  <div className="flex items-center gap-8">
                    <input
                      type={showStreamKey ? 'text' : 'password'}
                      value={rtmpCredentials.streamKey}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>{showStreamKey ? 'heroicons-outline:eye-slash' : 'heroicons-outline:eye'}</FuseSvgIcon>
                    </button>
                    <button
                      onClick={() => copyToClipboard(rtmpCredentials.streamKey)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Icecast Credentials */}
          {streamType === 'icecast' && icecastCredentials && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-24 bg-white rounded-16 shadow-lg"
            >
              <h3 className="text-lg font-bold mb-16 flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:key</FuseSvgIcon>
                Icecast Server Setup
              </h3>
              <div className="mb-16 p-12 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Use these credentials to configure your Icecast streaming source
              </div>
              <div className="space-y-12">
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">Server URL</label>
                  <div className="flex items-center gap-8">
                    <input
                      type="text"
                      value={icecastCredentials.serverUrl}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(icecastCredentials.serverUrl)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">Mount Point</label>
                  <div className="flex items-center gap-8">
                    <input
                      type="text"
                      value={icecastCredentials.mountPoint}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(icecastCredentials.mountPoint)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">Username</label>
                  <div className="flex items-center gap-8">
                    <input
                      type="text"
                      value={icecastCredentials.username}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(icecastCredentials.username)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">Password</label>
                  <div className="flex items-center gap-8">
                    <input
                      type={showIcecastPassword ? 'text' : 'password'}
                      value={icecastCredentials.password}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => setShowIcecastPassword(!showIcecastPassword)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>{showIcecastPassword ? 'heroicons-outline:eye-slash' : 'heroicons-outline:eye'}</FuseSvgIcon>
                    </button>
                    <button
                      onClick={() => copyToClipboard(icecastCredentials.password)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-4 block">Stream URL (for listeners)</label>
                  <div className="flex items-center gap-8">
                    <input
                      type="text"
                      value={icecastCredentials.streamUrl}
                      readOnly
                      className="flex-1 px-12 py-8 bg-gray-50 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(icecastCredentials.streamUrl)}
                      className="p-8 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <FuseSvgIcon size={16}>heroicons-outline:clipboard</FuseSvgIcon>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Load Credentials Button */}
          {!rtmpCredentials && !icecastCredentials && !loadingCredentials && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="p-24 bg-white rounded-16 shadow-lg text-center"
            >
              <FuseSvgIcon className="text-gray-400 mx-auto mb-16" size={48}>heroicons-outline:key</FuseSvgIcon>
              <h4 className="font-bold mb-8">Load Streaming Credentials</h4>
              <p className="text-sm text-gray-600 mb-16">
                {streamType === 'hls' ? 'Get your RTMP credentials for OBS Studio' : 'Get your Icecast server credentials'}
              </p>
              <button
                onClick={streamType === 'hls' ? loadStreamingCredentials : loadIcecastCredentials}
                className="px-24 py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <FuseSvgIcon size={20} className="mr-8">heroicons-outline:arrow-down-tray</FuseSvgIcon>
                Load Credentials
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Live Chat Widget - Floating */}
      {selectedChannel && <LiveChatWidget channelId={selectedChannel.id} compact />}
    </div>
  );
}

export default ControlPanelPage;
