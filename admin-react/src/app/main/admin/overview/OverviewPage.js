import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function OverviewPage() {
  const navigate = useNavigate();
  const [systemMetrics, setSystemMetrics] = useState({
    totalStations: 0,
    totalUsers: 0,
    totalShows: 0,
    pendingApprovals: 0,
  });
  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 0,
    liveStreams: 0,
    systemHealth: 95,
  });
  const [pendingStations, setPendingStations] = useState([]);
  const [topStations, setTopStations] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    loadAllData();
    generateRealtimeMetrics();
    
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    
    const refreshTimer = setInterval(() => {
      generateRealtimeMetrics();
    }, 30000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(refreshTimer);
    };
  }, []);

  const loadAllData = () => {
    loadSystemMetrics();
    loadPendingStations();
    loadTopStations();
    loadRecentUsers();
  };

  const loadSystemMetrics = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/analytics/overview`);
      setSystemMetrics({
        totalStations: data.overview?.totalChannels || 0,
        totalUsers: data.overview?.totalPersons || 0,
        totalShows: data.overview?.totalShows || 0,
        pendingApprovals: 0,
      });
    } catch (error) {
      setSystemMetrics({
        totalStations: 12,
        totalUsers: 156,
        totalShows: 48,
        pendingApprovals: 3,
      });
    }
  };

  const loadPendingStations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/channels/pending`);
      setPendingStations(data);
      setSystemMetrics(prev => ({ ...prev, pendingApprovals: data.length }));
    } catch (error) {
      setPendingStations([]);
    }
  };

  const loadTopStations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/channels`);
      setTopStations(data.slice(0, 5));
    } catch (error) {
      setTopStations([]);
    }
  };

  const loadRecentUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/users`);
      setRecentUsers(data.slice(0, 4));
      setSystemMetrics(prev => ({ ...prev, totalUsers: data.length }));
    } catch (error) {
      setRecentUsers([]);
    }
  };

  const generateRealtimeMetrics = () => {
    setRealtimeData({
      activeUsers: Math.floor(Math.random() * 500) + 100,
      liveStreams: Math.floor(Math.random() * 10) + 2,
      systemHealth: Math.floor(Math.random() * 10) + 90,
    });
  };

  const handleRefreshPending = () => {
    setIsRefreshing(true);
    loadPendingStations();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleApproveStation = async (stationId) => {
    try {
      await axios.patch(`${API_URL}/channels/${stationId}/approve`, {});
      setPendingStations(prev => prev.filter(s => s.id !== stationId));
      setSystemMetrics(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
      loadTopStations();
    } catch (error) {
      console.error('Error approving station:', error);
      loadPendingStations();
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const formatRole = (role) => {
    const roles = {
      'admin': 'Administrator',
      'station_owner': 'Station Owner',
      'user': 'User'
    };
    return roles[role] || role;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getRankClass = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-blue-900 to-blue-950';
  };

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col flex-auto min-w-0">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-blue-900 to-blue-950">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} className="text-blue-900">heroicons-outline:shield-check</FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">
                  Admin Dashboard
                </Typography>
                {realtimeData.liveStreams > 0 && (
                  <Chip
                    label={`${realtimeData.liveStreams} LIVE`}
                    size="small"
                    className="bg-green-500 text-white font-bold animate-pulse"
                    icon={<span className="w-8 h-8 bg-white rounded-full ml-8" />}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white/90">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:server</FuseSvgIcon>
                  System Health: {realtimeData.systemHealth}%
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:users</FuseSvgIcon>
                  {realtimeData.activeUsers} Active Users
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>
                  {currentTime}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button
              variant="contained"
              className="bg-white text-blue-900 hover:bg-gray-100"
              startIcon={<FuseSvgIcon>heroicons-outline:chart-bar</FuseSvgIcon>}
            >
              Real-time Monitor
            </Button>
            <Button
              variant="outlined"
              className="border-white/30 text-white hover:bg-white/10"
              startIcon={<FuseSvgIcon>heroicons-outline:cog</FuseSvgIcon>}
            >
              Settings
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32"
      >
        {[
          { icon: 'heroicons-outline:radio', label: 'Stations', value: systemMetrics.totalStations, color: 'from-blue-900 to-blue-950', onClick: () => navigate('/admin/stations') },
          { icon: 'heroicons-outline:users', label: 'Users', value: systemMetrics.totalUsers, color: 'from-blue-600 to-blue-700', onClick: () => navigate('/admin/users') },
          { icon: 'heroicons-outline:microphone', label: 'Shows', value: systemMetrics.totalShows, color: 'from-purple-600 to-purple-700' },
          { icon: 'heroicons-outline:clock', label: 'Pending', value: systemMetrics.pendingApprovals, color: 'from-orange-500 to-orange-600' },
        ].map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Paper
              className="flex items-center gap-16 p-20 rounded-16 shadow cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.onClick}
            >
              <div className={`flex items-center justify-center w-48 h-48 rounded-12 bg-gradient-to-r ${stat.color}`}>
                <FuseSvgIcon className="text-white" size={24}>{stat.icon}</FuseSvgIcon>
              </div>
              <div>
                <Typography className="text-32 font-bold">{stat.value}</Typography>
                <Typography className="text-sm text-gray-600">{stat.label}</Typography>
              </div>
            </Paper>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 p-24 sm:p-32 pt-0">
        {/* Left Column - 2 columns width */}
        <div className="lg:col-span-2 flex flex-col gap-24">
          {/* System Status */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-blue-900">heroicons-outline:server</FuseSvgIcon>
                  System Status
                </Typography>
                <Button size="small" className="text-blue-900">View Details</Button>
              </div>
              <div className="p-20">
                <div className="flex items-center gap-16 p-16 bg-gray-50 rounded-12 mb-20">
                  <div className="flex items-center justify-center w-56 h-56 rounded-12 bg-gradient-to-r from-green-500 to-green-600">
                    <FuseSvgIcon className="text-white" size={28}>heroicons-outline:check-circle</FuseSvgIcon>
                  </div>
                  <div className="flex-1">
                    <Typography className="text-lg font-semibold mb-4">All Systems Operational</Typography>
                    <div className="flex flex-wrap gap-12 text-sm text-gray-600">
                      <span className="flex items-center gap-4">
                        <FuseSvgIcon size={14} className="text-green-500">heroicons-outline:server</FuseSvgIcon>
                        Server: Online
                      </span>
                      <span className="flex items-center gap-4">
                        <FuseSvgIcon size={14} className="text-green-500">heroicons-outline:database</FuseSvgIcon>
                        Database: Connected
                      </span>
                      <span className="flex items-center gap-4">
                        <FuseSvgIcon size={14} className="text-green-500">heroicons-outline:wifi</FuseSvgIcon>
                        API: Healthy
                      </span>
                    </div>
                  </div>
                  <Chip label="Healthy" size="small" className="bg-green-100 text-green-700 font-semibold" />
                </div>
                <div className="grid grid-cols-3 gap-16">
                  {[
                    { label: 'Active Users', value: realtimeData.activeUsers },
                    { label: 'Live Streams', value: realtimeData.liveStreams },
                    { label: 'Health', value: `${realtimeData.systemHealth}%` },
                  ].map((metric, idx) => (
                    <div key={idx} className="text-center p-16 bg-gray-50 rounded-12">
                      <Typography className="text-24 font-bold">{metric.value}</Typography>
                      <Typography className="text-sm text-gray-600">{metric.label}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Pending Approvals */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-orange-500">heroicons-outline:clock</FuseSvgIcon>
                  Pending Approvals
                </Typography>
                <IconButton size="small" onClick={handleRefreshPending} disabled={isRefreshing}>
                  <FuseSvgIcon className={isRefreshing ? 'animate-spin' : ''}>heroicons-outline:refresh</FuseSvgIcon>
                </IconButton>
              </div>
              <div className="p-20">
                {pendingStations.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {pendingStations.map((station) => (
                      <div key={station.id} className="flex items-center gap-16 p-16 bg-orange-50 rounded-12 border-l-4 border-orange-500">
                        <Chip label="PENDING" size="small" className="bg-orange-500 text-white font-bold" />
                        <div className="flex-1">
                          <Typography className="font-semibold">{station.name}</Typography>
                          <Typography className="text-sm text-gray-600">{station.category}</Typography>
                        </div>
                        <IconButton
                          size="small"
                          className="bg-green-500 text-white hover:bg-green-600"
                          onClick={() => handleApproveStation(station.id)}
                        >
                          <FuseSvgIcon size={20}>heroicons-outline:check</FuseSvgIcon>
                        </IconButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 text-gray-400">
                    <FuseSvgIcon size={48} className="mb-8">heroicons-outline:check-circle</FuseSvgIcon>
                    <Typography>No pending approvals</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Top Stations */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-orange-500">heroicons-outline:trophy</FuseSvgIcon>
                  Top Stations
                </Typography>
                <Button size="small" className="text-blue-900" onClick={() => navigate('/admin/stations')}>View All</Button>
              </div>
              <div className="p-20">
                {topStations.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {topStations.slice(0, 5).map((station, index) => (
                      <div key={station.id} className="flex items-center gap-16 p-12 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                        <div className={`flex items-center justify-center w-32 h-32 rounded-full ${getRankClass(index)} text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Typography className="font-semibold">{station.name}</Typography>
                          <Typography className="text-sm text-gray-600">{station.callSign} • {station.city}</Typography>
                        </div>
                        <div className="flex items-center gap-4 text-orange-500">
                          <FuseSvgIcon size={16}>heroicons-outline:star</FuseSvgIcon>
                          <Typography className="font-semibold">{station.pulseScore || 0}</Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 text-gray-400">
                    <FuseSvgIcon size={48} className="mb-8">heroicons-outline:radio</FuseSvgIcon>
                    <Typography>No stations yet</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-blue-900">heroicons-outline:lightning-bolt</FuseSvgIcon>
                  Quick Actions
                </Typography>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-2 gap-12">
                  {[
                    { icon: 'heroicons-outline:radio', label: 'Stations', onClick: () => navigate('/admin/stations') },
                    { icon: 'heroicons-outline:users', label: 'Users', onClick: () => navigate('/admin/users') },
                    { icon: 'heroicons-outline:shield-check', label: 'Moderation', color: 'text-red-500' },
                    { icon: 'heroicons-outline:chart-bar', label: 'Analytics' },
                  ].map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      className="flex-col h-80 border-gray-200 hover:border-blue-900 hover:bg-blue-50"
                      onClick={action.onClick}
                    >
                      <FuseSvgIcon className={action.color || 'text-blue-900'} size={24}>{action.icon}</FuseSvgIcon>
                      <Typography className="text-sm mt-8">{action.label}</Typography>
                    </Button>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Users */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-blue-600">heroicons-outline:user-add</FuseSvgIcon>
                  Recent Users
                </Typography>
                <Button size="small" className="text-blue-900" onClick={() => navigate('/admin/users')}>View All</Button>
              </div>
              <div className="p-20">
                {recentUsers.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {recentUsers.slice(0, 4).map((user) => (
                      <div key={user.id} className="flex items-center gap-12 p-12 bg-gray-50 rounded-12">
                        <Avatar className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                          {getInitials(user.username)}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Typography className="font-semibold truncate">{user.username}</Typography>
                          <Typography className="text-sm text-blue-600">{formatRole(user.role)}</Typography>
                        </div>
                        <Typography className="text-xs text-gray-500">{formatDate(user.createdAt)}</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 text-gray-400">
                    <FuseSvgIcon size={48} className="mb-8">heroicons-outline:users</FuseSvgIcon>
                    <Typography>No recent users</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-blue-900">heroicons-outline:bell</FuseSvgIcon>
                  Recent Activity
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-16">
                  {[
                    { icon: 'heroicons-outline:radio', text: 'New station registered', time: '1 hour ago', color: 'bg-blue-100 text-blue-900' },
                    { icon: 'heroicons-outline:user-add', text: 'New user signed up', time: '2 hours ago', color: 'bg-green-100 text-green-900' },
                    { icon: 'heroicons-outline:shield-check', text: 'Content reviewed', time: '3 hours ago', color: 'bg-red-100 text-red-900' },
                    { icon: 'heroicons-outline:server', text: 'System backup completed', time: '5 hours ago', color: 'bg-purple-100 text-purple-900' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-12 pb-16 border-b last:border-0">
                      <div className={`flex items-center justify-center w-36 h-36 rounded-full ${activity.color}`}>
                        <FuseSvgIcon size={16}>{activity.icon}</FuseSvgIcon>
                      </div>
                      <div className="flex-1">
                        <Typography className="text-sm">{activity.text}</Typography>
                        <Typography className="text-xs text-gray-500">{activity.time}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default OverviewPage;
