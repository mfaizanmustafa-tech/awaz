import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function AnalyticsPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [currentTime, setCurrentTime] = useState('');
  const [analytics, setAnalytics] = useState({
    totalListeners: 45000,
    totalListeningHours: 125000,
    averageSessionDuration: 45,
    peakConcurrentListeners: 3500,
    totalChannels: 25,
    activeChannels: 18,
    totalShows: 150,
    completedShows: 120,
  });

  const weeklyData = [
    { day: 'Mon', listeners: 65, sessions: 45 },
    { day: 'Tue', listeners: 75, sessions: 55 },
    { day: 'Wed', listeners: 85, sessions: 65 },
    { day: 'Thu', listeners: 70, sessions: 50 },
    { day: 'Fri', listeners: 90, sessions: 70 },
    { day: 'Sat', listeners: 100, sessions: 80 },
    { day: 'Sun', listeners: 95, sessions: 75 },
  ];

  const categoryData = [
    { label: 'Music', percentage: 40, color: '#3b82f6' },
    { label: 'Talk', percentage: 24, color: '#8b5cf6' },
    { label: 'News', percentage: 16, color: '#22c55e' },
    { label: 'Sports', percentage: 12, color: '#f59e0b' },
    { label: 'Religious', percentage: 8, color: '#ef4444' },
  ];

  const regionData = [
    { name: 'Karachi', percentage: 35, color: '#3b82f6' },
    { name: 'Lahore', percentage: 25, color: '#8b5cf6' },
    { name: 'Islamabad', percentage: 20, color: '#22c55e' },
    { name: 'Peshawar', percentage: 12, color: '#f59e0b' },
    { name: 'Other', percentage: 8, color: '#94a3b8' },
  ];

  const topPerformers = [
    { name: 'FM 101 Karachi', type: 'Channel', listeners: 15420, engagement: 78 },
    { name: 'Morning Show', type: 'Show', listeners: 12350, engagement: 72 },
    { name: 'City FM 89', type: 'Channel', listeners: 11200, engagement: 68 },
    { name: 'Evening Drive', type: 'Show', listeners: 9800, engagement: 65 },
    { name: 'Radio Pakistan', type: 'Channel', listeners: 8900, engagement: 62 },
  ];

  useEffect(() => {
    loadAnalytics();
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(clockTimer);
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/analytics/overview`);
      if (data?.overview) {
        setAnalytics((prev) => ({ ...prev, ...data.overview }));
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getActivationRate = () => Math.round((analytics.activeChannels / analytics.totalChannels) * 100);
  const getAvgListenersPerChannel = () => Math.round(analytics.totalListeners / analytics.activeChannels);
  const getCompletionRate = () => Math.round((analytics.completedShows / analytics.totalShows) * 100);

  const getTrendClass = (trendPositive) => {
    if (trendPositive === true) return 'bg-green-100 text-green-700';
    if (trendPositive === false) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getRankClass = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-indigo-500';
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-indigo-500 to-indigo-600">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} className="text-indigo-500">heroicons-outline:chart-bar</FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Analytics Dashboard</Typography>
                <Chip label="+15% Growth" size="small" className="bg-green-500/20 text-green-200 font-bold" icon={<FuseSvgIcon size={16} className="text-green-200">heroicons-outline:arrow-up</FuseSvgIcon>} />
              </div>
              <div className="flex flex-wrap gap-12 text-white/90">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:calendar</FuseSvgIcon>
                  {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>
                  Last updated: {currentTime}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="bg-white/10 text-white border-white/30 rounded-12 h-40" sx={{ '& .MuiSelect-icon': { color: 'white' } }}>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
            <Button variant="contained" className="bg-white text-indigo-500 hover:bg-gray-100" startIcon={<FuseSvgIcon>heroicons-outline:download</FuseSvgIcon>}>
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:users', label: 'Total Listeners', value: formatNumber(analytics.totalListeners), color: 'from-blue-600 to-blue-700', trend: '+15%', trendPositive: true },
          { icon: 'heroicons-outline:clock', label: 'Listening Hours', value: formatNumber(analytics.totalListeningHours), color: 'from-purple-600 to-purple-700', trend: '+22%', trendPositive: true },
          { icon: 'heroicons-outline:lightning-bolt', label: 'Avg Session', value: `${analytics.averageSessionDuration}m`, color: 'from-green-600 to-green-700', trend: '0%', trendPositive: null },
          { icon: 'heroicons-outline:user-group', label: 'Peak Concurrent', value: formatNumber(analytics.peakConcurrentListeners), color: 'from-orange-500 to-orange-600', trend: '+8%', trendPositive: true },
        ].map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Paper className="relative flex items-center gap-16 p-20 rounded-16 shadow">
              <div className={`flex items-center justify-center w-48 h-48 rounded-12 bg-gradient-to-r ${stat.color}`}>
                <FuseSvgIcon className="text-white" size={24}>{stat.icon}</FuseSvgIcon>
              </div>
              <div className="flex-1">
                <Typography className="text-32 font-bold">{stat.value}</Typography>
                <Typography className="text-sm text-gray-600">{stat.label}</Typography>
              </div>
              <Chip 
                label={stat.trend} 
                size="small" 
                className={`absolute top-16 right-16 font-semibold ${getTrendClass(stat.trendPositive)}`} 
              />
            </Paper>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-24 p-24 sm:p-32 pt-0">
        {/* Left Column - 3 columns width */}
        <div className="lg:col-span-3 flex flex-col gap-24">
          {/* Listener Trends Chart */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-indigo-500">heroicons-outline:chart-bar</FuseSvgIcon>
                  Listener Trends
                </Typography>
                <div className="flex gap-16">
                  <span className="flex items-center gap-4 text-sm">
                    <span className="w-10 h-10 rounded-full bg-indigo-500" />
                    Listeners
                  </span>
                  <span className="flex items-center gap-4 text-sm">
                    <span className="w-10 h-10 rounded-full bg-indigo-200" />
                    Sessions
                  </span>
                </div>
              </div>
              <div className="p-20">
                <div className="flex items-end justify-between h-200 gap-8">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 gap-8">
                      <div className="flex items-end gap-4 h-160">
                        <div className="w-20 bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-4" style={{ height: `${day.listeners}%` }} />
                        <div className="w-20 bg-gradient-to-t from-indigo-200 to-indigo-100 rounded-t-4" style={{ height: `${day.sessions}%` }} />
                      </div>
                      <Typography className="text-xs text-gray-600">{day.day}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Geographic Distribution */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-indigo-500">heroicons-outline:globe</FuseSvgIcon>
                  Geographic Distribution
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-16">
                  {regionData.map((region, idx) => (
                    <div key={idx} className="flex flex-col gap-8">
                      <div className="flex justify-between">
                        <Typography className="font-medium">{region.name}</Typography>
                        <Typography className="font-semibold text-indigo-500">{region.percentage}%</Typography>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${region.percentage}%`, background: region.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Top Performers */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-orange-500">heroicons-outline:trophy</FuseSvgIcon>
                  Top Performers
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center gap-16 p-12 bg-gray-50 rounded-12">
                      <div className={`flex items-center justify-center w-32 h-32 rounded-full ${getRankClass(index)} text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Typography className="font-semibold">{performer.name}</Typography>
                        <Typography className="text-sm text-gray-600">{performer.type}</Typography>
                      </div>
                      <div className="flex flex-col items-end gap-4">
                        <Typography className="font-semibold text-indigo-500">{formatNumber(performer.listeners)}</Typography>
                        <div className="w-60 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${performer.engagement}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column - 2 columns width */}
        <div className="lg:col-span-2 flex flex-col gap-24">
          {/* Category Distribution */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-indigo-500">heroicons-outline:chart-pie</FuseSvgIcon>
                  Categories
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex items-center justify-center mb-20">
                  <div className="relative w-120 h-120">
                    <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#3b82f6 0% 40%, #8b5cf6 40% 64%, #22c55e 64% 80%, #f59e0b 80% 92%, #ef4444 92% 100%)` }} />
                    <div className="absolute inset-20 bg-white rounded-full flex flex-col items-center justify-center">
                      <Typography className="text-24 font-bold">{analytics.totalChannels}</Typography>
                      <Typography className="text-xs text-gray-600">Channels</Typography>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-12">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-12">
                      <span className="w-12 h-12 rounded-4" style={{ background: cat.color }} />
                      <Typography className="flex-1 text-sm">{cat.label}</Typography>
                      <Typography className="font-semibold text-indigo-500">{cat.percentage}%</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Channel Performance */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-indigo-500">heroicons-outline:radio</FuseSvgIcon>
                  Channel Stats
                </Typography>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-2 gap-12">
                  {[
                    { label: 'Total', value: analytics.totalChannels },
                    { label: 'Active', value: analytics.activeChannels },
                    { label: 'Rate', value: `${getActivationRate()}%` },
                    { label: 'Avg/Ch', value: getAvgListenersPerChannel() },
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center p-16 bg-gray-50 rounded-12">
                      <Typography className="text-24 font-bold text-indigo-500">{stat.value}</Typography>
                      <Typography className="text-xs text-gray-600">{stat.label}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Show Performance */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-indigo-500">heroicons-outline:microphone</FuseSvgIcon>
                  Show Stats
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Total Shows', value: analytics.totalShows },
                    { label: 'Completed', value: analytics.completedShows },
                    { label: 'Completion Rate', value: `${getCompletionRate()}%`, highlight: true },
                    { label: 'Avg Duration', value: '45 min' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex justify-between p-12 bg-gray-50 rounded-8">
                      <Typography className="text-sm text-gray-600">{stat.label}</Typography>
                      <Typography className={`font-semibold ${stat.highlight ? 'text-indigo-500' : 'text-gray-900'}`}>{stat.value}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Quick Insights */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-indigo-500">heroicons-outline:light-bulb</FuseSvgIcon>
                  Quick Insights
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { icon: 'heroicons-outline:arrow-up', text: 'Listener growth up 15% this week', color: 'bg-green-100 text-green-700' },
                    { icon: 'heroicons-outline:clock', text: 'Peak hours: 8-10 AM, 6-8 PM', color: 'bg-green-100 text-green-700' },
                    { icon: 'heroicons-outline:musical-note', text: 'Music category most popular', color: 'bg-indigo-100 text-indigo-700' },
                    { icon: 'heroicons-outline:exclamation', text: '3 channels below avg engagement', color: 'bg-orange-100 text-orange-700' },
                  ].map((insight, idx) => (
                    <div key={idx} className={`flex items-center gap-12 p-12 rounded-8 ${insight.color}`}>
                      <FuseSvgIcon size={20}>{insight.icon}</FuseSvgIcon>
                      <Typography className="text-sm">{insight.text}</Typography>
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

export default AnalyticsPage;
