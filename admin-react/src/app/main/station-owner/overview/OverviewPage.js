import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

// Mock data for fallback
const mockChannel = {
  id: '1',
  name: 'Awaz Pulse FM',
  callSign: 'APFM',
  frequency: '98.5',
  city: 'Mumbai',
  status: 'active',
  category: 'Music',
  description: 'Your pulse on the best music',
  streams: [],
  totalListeners: 0
};

const mockShows = [
  { id: '1', title: 'Morning Drive', type: 'music', status: 'scheduled', performers: [{ person: { stageName: 'RJ Mike' } }] },
  { id: '2', title: 'Evening Talk', type: 'talk', status: 'completed', performers: [{ person: { stageName: 'RJ Sarah' } }] },
  { id: '3', title: 'Night Beats', type: 'music', status: 'scheduled', performers: [{ person: { stageName: 'DJ Alex' } }] }
];

const mockHosts = [
  { id: '1', stageName: 'RJ Mike', type: 'host', overallRating: '4.5' },
  { id: '2', stageName: 'RJ Sarah', type: 'host', overallRating: '4.8' },
  { id: '3', stageName: 'DJ Alex', type: 'host', overallRating: '4.7' }
];

function OverviewPage() {
  console.log('OverviewPage component loaded');
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [metrics, setMetrics] = useState({
    totalChannels: 0,
    totalShows: 0,
    totalListeners: 0,
    activeStreams: 0,
    hostsCount: 0,
    guestsCount: 0,
    systemHealth: 100
  });
  const [channel, setChannel] = useState(null);
  const [recentShows, setRecentShows] = useState([]);
  const [topHosts, setTopHosts] = useState([]);
  const [liveShows, setLiveShows] = useState([]);

  const loadDashboardData = async () => {
    try {
      console.log('Loading overview dashboard data...');
      const token = localStorage.getItem('jwt_access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [channelsRes, showsRes, hostsRes, guestsRes] = await Promise.all([
        axios.get('http://localhost:3000/channels/my-channels', config).catch(() => ({ data: [mockChannel] })),
        axios.get('http://localhost:3000/shows', config).catch(() => ({ data: mockShows })),
        axios.get('http://localhost:3000/persons', config).catch(() => ({ data: mockHosts })),
        axios.get('http://localhost:3000/guests', config).catch(() => ({ data: [] }))
      ]);

      const channelsData = channelsRes.data || [mockChannel];
      const showsData = showsRes.data || mockShows;
      const hostsData = hostsRes.data || mockHosts;
      const guestsData = guestsRes.data || [];

      console.log('Loaded data:', {
        channels: channelsData.length,
        shows: showsData.length,
        hosts: hostsData.length,
        guests: guestsData.length
      });

      if (channelsData.length > 0) {
        setChannel(channelsData[0]);
        setMetrics({
          totalChannels: channelsData.length,
          totalShows: showsData.length,
          totalListeners: channelsData[0].totalListeners || 0,
          activeStreams: channelsData[0].streams?.filter(s => s.status === 'live').length || 0,
          hostsCount: hostsData.length,
          guestsCount: guestsData.length,
          systemHealth: 100
        });
      }

      setRecentShows(showsData.slice(0, 5));
      setTopHosts(hostsData.slice(0, 5));
      setLiveShows(showsData.filter(s => s.status === 'live'));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data on error
      setChannel(mockChannel);
      setRecentShows(mockShows);
      setTopHosts(mockHosts);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatStatus = (status) => {
    const statusMap = {
      active: 'Active',
      pending: 'Pending',
      suspended: 'Suspended',
      inactive: 'Inactive'
    };
    return statusMap[status] || status;
  };

  const getShowTypeIcon = (type) => {
    const icons = {
      music: 'heroicons-outline:musical-note',
      talk: 'heroicons-outline:chat-bubble-left-right',
      news: 'heroicons-outline:newspaper',
      sports: 'heroicons-outline:trophy',
      comedy: 'heroicons-outline:face-smile',
      podcast: 'heroicons-outline:microphone'
    };
    return icons[type] || 'heroicons-outline:microphone';
  };

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-32">
        <div className="text-center">
          <FuseSvgIcon className="animate-spin text-blue-600" size={48}>heroicons-outline:arrow-path</FuseSvgIcon>
          <p className="mt-16 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-24 sm:p-32 w-full min-h-full">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-24 p-32 rounded-16 bg-gradient-to-r from-blue-800 to-blue-900 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center">
              <FuseSvgIcon className="text-blue-600" size={32}>heroicons-outline:chart-bar</FuseSvgIcon>
            </div>
            <div>
              <div className="flex items-center gap-12 mb-4">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                {liveShows.length > 0 && (
                  <span className="px-12 py-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-4">
                    <span className="w-8 h-8 bg-white rounded-full animate-pulse"></span>
                    {liveShows.length} LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-16 text-white opacity-90 text-sm">
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:radio</FuseSvgIcon>
                  <span>{channel ? channel.name : 'No Channel'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:signal</FuseSvgIcon>
                  <span>{metrics.systemHealth}% Health</span>
                </div>
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>
                  <span>{currentTime}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-12">
            {channel ? (
              <button
                onClick={() => navigate('/station-owner/control-panel')}
                className="px-24 py-12 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:play</FuseSvgIcon>
                Go Live
              </button>
            ) : (
              <button
                className="px-24 py-12 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                Create Channel
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
        {[
          { label: 'My Channel', value: channel ? '1' : '0', icon: 'heroicons-outline:radio', color: 'blue', onClick: () => navigate('/station-owner/my-channel') },
          { label: 'Total Shows', value: metrics.totalShows, icon: 'heroicons-outline:microphone', color: 'purple', onClick: () => navigate('/station-owner/shows') },
          { label: 'Hosts', value: metrics.hostsCount, icon: 'heroicons-outline:user-circle', color: 'green', onClick: () => navigate('/station-owner/performers') },
          { label: 'Guests', value: metrics.guestsCount, icon: 'heroicons-outline:user-group', color: 'orange', onClick: () => navigate('/station-owner/guests') }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={stat.onClick}
            className="p-20 bg-white rounded-12 shadow hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-4">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
              <div className={`w-48 h-48 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                <FuseSvgIcon className={`text-${stat.color}-600`} size={24}>{stat.icon}</FuseSvgIcon>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-24">
          {/* Channel Status Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <div className="flex items-center justify-between mb-20">
              <h3 className="text-xl font-bold flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:radio</FuseSvgIcon>
                Channel Status
              </h3>
              {channel && (
                <button
                  onClick={() => navigate('/station-owner/my-channel')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View Details →
                </button>
              )}
            </div>

            {channel ? (
              <div>
                <div className="p-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-12 mb-16">
                  <div className="flex items-center gap-16 mb-16">
                    <div className="w-56 h-56 rounded-full bg-blue-600 flex items-center justify-center">
                      <FuseSvgIcon className="text-white" size={28}>heroicons-outline:radio</FuseSvgIcon>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900">{channel.name}</h4>
                      <div className="flex gap-12 mt-4 text-sm text-gray-600">
                        <span className="flex items-center gap-4">
                          <FuseSvgIcon size={14}>heroicons-outline:signal</FuseSvgIcon>
                          {channel.frequency} MHz
                        </span>
                        <span className="flex items-center gap-4">
                          <FuseSvgIcon size={14}>heroicons-outline:tag</FuseSvgIcon>
                          {channel.callSign}
                        </span>
                        <span className="flex items-center gap-4">
                          <FuseSvgIcon size={14}>heroicons-outline:map-pin</FuseSvgIcon>
                          {channel.city}
                        </span>
                      </div>
                    </div>
                    <span className={`px-16 py-8 rounded-full text-sm font-bold ${
                      channel.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {formatStatus(channel.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-16">
                  <div className="text-center p-16 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.totalListeners)}</p>
                    <p className="text-sm text-gray-600 mt-4">Live Listeners</p>
                  </div>
                  <div className="text-center p-16 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{metrics.activeStreams}</p>
                    <p className="text-sm text-gray-600 mt-4">Active Streams</p>
                  </div>
                  <div className="text-center p-16 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{metrics.systemHealth}%</p>
                    <p className="text-sm text-gray-600 mt-4">Health</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-48">
                <div className="w-96 h-96 mx-auto mb-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FuseSvgIcon className="text-gray-400" size={48}>heroicons-outline:radio</FuseSvgIcon>
                </div>
                <h4 className="text-lg font-bold mb-8">No Channel Yet</h4>
                <p className="text-gray-600 mb-20">Create your radio channel to start broadcasting</p>
                <button className="px-24 py-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FuseSvgIcon size={20} className="mr-8">heroicons-outline:plus</FuseSvgIcon>
                  Create Channel
                </button>
              </div>
            )}
          </motion.div>

          {/* Live Shows Panel */}
          {liveShows.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-24 bg-white rounded-16 shadow-lg"
            >
              <div className="flex items-center justify-between mb-20">
                <h3 className="text-xl font-bold flex items-center gap-8">
                  <FuseSvgIcon size={24}>heroicons-outline:play-circle</FuseSvgIcon>
                  Live Shows
                </h3>
                <button
                  onClick={loadDashboardData}
                  className="p-8 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FuseSvgIcon size={20}>heroicons-outline:arrow-path</FuseSvgIcon>
                </button>
              </div>
              <div className="space-y-12">
                {liveShows.map((show) => (
                  <div key={show.id} className="flex items-center gap-16 p-16 bg-red-50 border-2 border-red-200 rounded-lg">
                    <span className="px-12 py-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-4">
                      <span className="w-8 h-8 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold">{show.title}</h4>
                      <p className="text-sm text-gray-600">{show.type}</p>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                      <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                      <span>{show.viewCount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Shows Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <div className="flex items-center justify-between mb-20">
              <h3 className="text-xl font-bold flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:clock</FuseSvgIcon>
                Recent Shows
              </h3>
              <button
                onClick={() => navigate('/station-owner/shows')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </button>
            </div>

            {recentShows.length > 0 ? (
              <div className="space-y-12">
                {recentShows.map((show) => (
                  <div
                    key={show.id}
                    onClick={() => navigate('/station-owner/shows')}
                    className="flex items-center gap-16 p-16 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={`w-40 h-40 rounded-full bg-purple-100 flex items-center justify-center`}>
                      <FuseSvgIcon className="text-purple-600" size={20}>{getShowTypeIcon(show.type)}</FuseSvgIcon>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{show.title}</h4>
                      <p className="text-sm text-gray-600">{show.type} • {show.status}</p>
                    </div>
                    <span className={`px-12 py-4 rounded-full text-xs font-bold ${
                      show.status === 'live' ? 'bg-red-100 text-red-700' :
                      show.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {show.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <FuseSvgIcon className="text-gray-400 mx-auto mb-12" size={48}>heroicons-outline:microphone</FuseSvgIcon>
                <p className="text-gray-600 mb-16">No shows yet</p>
                <button
                  onClick={() => navigate('/station-owner/shows')}
                  className="px-20 py-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Show
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-24">
          {/* Quick Actions Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-20">Quick Actions</h3>
            <div className="space-y-12">
              <button
                onClick={() => navigate('/station-owner/control-panel')}
                className="w-full px-20 py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:play-circle</FuseSvgIcon>
                Control Panel
              </button>
              <button
                onClick={() => navigate('/station-owner/shows')}
                className="w-full px-20 py-16 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:calendar</FuseSvgIcon>
                Manage Shows
              </button>
              <button
                onClick={() => navigate('/station-owner/performers')}
                className="w-full px-20 py-16 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:users</FuseSvgIcon>
                Manage Hosts
              </button>
              <button
                onClick={() => navigate('/station-owner/analytics')}
                className="w-full px-20 py-16 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-8"
              >
                <FuseSvgIcon size={20}>heroicons-outline:chart-bar</FuseSvgIcon>
                View Analytics
              </button>
            </div>
          </motion.div>

          {/* Top Hosts Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <div className="flex items-center justify-between mb-20">
              <h3 className="text-xl font-bold">Top Hosts</h3>
              <button
                onClick={() => navigate('/station-owner/performers')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </button>
            </div>

            {topHosts.length > 0 ? (
              <div className="space-y-12">
                {topHosts.map((host) => (
                  <div
                    key={host.id}
                    onClick={() => navigate('/station-owner/performers')}
                    className="flex items-center gap-12 p-12 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {host.stageName?.[0] || 'H'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{host.stageName}</h4>
                      <p className="text-xs text-gray-600">{host.type}</p>
                    </div>
                    <span className="px-8 py-4 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                      {(Number(host.overallRating) || 0).toFixed(1)}★
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32">
                <FuseSvgIcon className="text-gray-400 mx-auto mb-12" size={40}>heroicons-outline:user-circle</FuseSvgIcon>
                <p className="text-sm text-gray-600 mb-16">No hosts yet</p>
                <button
                  onClick={() => navigate('/station-owner/performers')}
                  className="px-16 py-8 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Host
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
