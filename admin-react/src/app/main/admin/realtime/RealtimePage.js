import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function RealtimePage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [bandwidthUsage, setBandwidthUsage] = useState(35);
  const [inboundBandwidth] = useState(120);
  const [outboundBandwidth] = useState(230);

  const [systemMetrics, setSystemMetrics] = useState([
    { name: 'CPU', value: 45, max: 100, unit: '%', status: 'healthy' },
    { name: 'Memory', value: 62, max: 100, unit: '%', status: 'healthy' },
    { name: 'Disk I/O', value: 28, max: 100, unit: '%', status: 'healthy' },
    { name: 'Network', value: 15, max: 100, unit: 'ms', status: 'healthy' },
    { name: 'Errors', value: 0.5, max: 10, unit: '%', status: 'healthy' },
  ]);

  const [liveStreams] = useState([
    { id: '1', channelName: 'FM 101 Karachi', showName: 'Morning Show', listeners: 1250, duration: '02:45:30', status: 'live', bitrate: 128 },
    { id: '2', channelName: 'City FM 89', showName: 'Drive Time', listeners: 890, duration: '01:30:15', status: 'live', bitrate: 192 },
    { id: '3', channelName: 'Radio Pakistan', showName: 'News Hour', listeners: 2100, duration: '00:45:00', status: 'live', bitrate: 128 },
    { id: '4', channelName: 'Hot FM 105', showName: 'Top 40', listeners: 650, duration: '00:15:45', status: 'buffering', bitrate: 256 },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { type: 'stream', message: 'FM 101 started streaming', time: new Date(Date.now() - 60000) },
    { type: 'user', message: 'New user registered', time: new Date(Date.now() - 120000) },
    { type: 'alert', message: 'High CPU detected', time: new Date(Date.now() - 180000) },
    { type: 'system', message: 'Backup completed', time: new Date(Date.now() - 300000) },
  ]);

  const [alerts] = useState([]);

  useEffect(() => {
    let timer;
    if (autoRefresh) {
      timer = setInterval(() => {
        refreshAll();
      }, refreshInterval * 1000);
    }
    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval]);

  const refreshAll = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setSystemMetrics((prev) =>
      prev.map((m) => ({
        ...m,
        value: Math.max(0, Math.min(m.max, m.value + (Math.random() * 10 - 5))),
        status: calculateStatus(m.value, m.max),
      }))
    );
    setBandwidthUsage(Math.floor(Math.random() * 20) + 30);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const calculateStatus = (value, max) => {
    const pct = (value / max) * 100;
    if (pct > 90) return 'critical';
    if (pct > 70) return 'warning';
    return 'healthy';
  };

  const getOverallStatus = () => {
    if (systemMetrics.some((m) => m.status === 'critical')) return 'critical';
    if (systemMetrics.some((m) => m.status === 'warning')) return 'warning';
    return 'healthy';
  };

  const getOverallStatusText = () => {
    const status = getOverallStatus();
    if (status === 'critical') return 'Issues Detected';
    if (status === 'warning') return 'Warning';
    return 'All Systems Operational';
  };

  const getStatusColor = (status) => {
    if (status === 'critical') return 'text-red-500';
    if (status === 'warning') return 'text-orange-500';
    return 'text-green-600';
  };

  const getStatusBgColor = (status) => {
    if (status === 'critical') return 'bg-red-500';
    if (status === 'warning') return 'bg-orange-500';
    return 'bg-green-600';
  };

  const getTotalListeners = () => liveStreams.reduce((sum, s) => sum + s.listeners, 0);
  const getLiveCount = () => liveStreams.filter((s) => s.status === 'live').length;

  const getActivityIcon = (type) => {
    const icons = {
      stream: 'heroicons-outline:radio',
      user: 'heroicons-outline:user',
      alert: 'heroicons-outline:exclamation',
      system: 'heroicons-outline:server',
    };
    return icons[type] || 'heroicons-outline:information-circle';
  };

  const getActivityColor = (type) => {
    const colors = {
      stream: 'bg-green-100 text-green-700',
      user: 'bg-blue-100 text-blue-700',
      alert: 'bg-orange-100 text-orange-700',
      system: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStreamBorderColor = (status) => {
    if (status === 'live') return 'border-green-500';
    if (status === 'buffering') return 'border-orange-500';
    return 'border-red-500';
  };

  const getStreamChipColor = (status) => {
    if (status === 'live') return 'bg-red-500';
    if (status === 'buffering') return 'bg-orange-500';
    return 'bg-red-600';
  };

  const getMetricBorderColor = (status) => {
    if (status === 'critical') return 'border-red-500';
    if (status === 'warning') return 'border-orange-500';
    return 'border-green-500';
  };

  const getMetricStrokeColor = (status) => {
    if (status === 'critical') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    return '#22c55e';
  };

  const getMetricTextColor = (status) => {
    if (status === 'critical') return 'text-red-500';
    if (status === 'warning') return 'text-orange-500';
    return 'text-green-600';
  };

  const getAlertBgColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-700';
    if (severity === 'warning') return 'bg-orange-100 text-orange-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getAlertIcon = (severity) => {
    if (severity === 'critical') return 'heroicons-outline:x-circle';
    if (severity === 'warning') return 'heroicons-outline:exclamation';
    return 'heroicons-outline:information-circle';
  };

  const container = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col flex-auto min-w-0">
      {/* Hero Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex items-end gap-16">
            <div className={`flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg ${getStatusColor(getOverallStatus())}`}>
              <FuseSvgIcon size={48}>heroicons-outline:lightning-bolt</FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Real-time Monitor</Typography>
                <Chip
                  label={getOverallStatusText()}
                  size="small"
                  className={`${getStatusBgColor(getOverallStatus())} text-white font-bold animate-pulse`}
                  icon={<span className="w-8 h-8 bg-white rounded-full ml-8" />}
                />
              </div>
              <div className="flex flex-wrap gap-12 text-white/90">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:signal</FuseSvgIcon>
                  {liveStreams.length} Active Streams
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:users</FuseSvgIcon>
                  {getTotalListeners()} Listeners
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0 items-center">
            <div className="flex items-center gap-8 bg-white/10 px-12 py-8 rounded-12">
              <FormControlLabel
                control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} size="small" />}
                label={<Typography className="text-white text-sm">Auto-refresh</Typography>}
              />
              <Select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} size="small" className="bg-white/20 text-white rounded-8 h-32" sx={{ '& .MuiSelect-icon': { color: 'white' } }}>
                <MenuItem value={5}>5s</MenuItem>
                <MenuItem value={10}>10s</MenuItem>
                <MenuItem value={30}>30s</MenuItem>
              </Select>
            </div>
            <Button variant="contained" className="bg-white text-green-600 hover:bg-gray-100" startIcon={<FuseSvgIcon className={isRefreshing ? 'animate-spin' : ''}>heroicons-outline:refresh</FuseSvgIcon>} onClick={refreshAll}>
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* System Metrics Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-16 p-24 sm:p-32">
        {systemMetrics.map((metric, index) => (
          <motion.div key={index} variants={itemVariant}>
            <Paper className={`flex items-center gap-16 p-16 rounded-16 shadow border-l-4 ${getMetricBorderColor(metric.status)}`}>
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke={getMetricStrokeColor(metric.status)}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.round((metric.value / metric.max) * 100)}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Typography className="text-sm font-bold">{Math.round(metric.value)}</Typography>
                  <Typography className="text-xs text-gray-600">{metric.unit}</Typography>
                </div>
              </div>
              <div className="flex-1">
                <Typography className="font-semibold text-sm">{metric.name}</Typography>
                <Typography className={`text-xs flex items-center gap-4 ${getMetricTextColor(metric.status)}`}>
                  <span className="w-6 h-6 rounded-full bg-current" />
                  {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                </Typography>
              </div>
            </Paper>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 p-24 sm:p-32 pt-0">
        {/* Left Column - Live Streams (2 columns width) */}
        <div className="lg:col-span-2">
          <motion.div variants={itemVariant}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-green-600">heroicons-outline:radio</FuseSvgIcon>
                  Live Streams
                </Typography>
                <div className="flex gap-12">
                  <Chip label={`${getLiveCount()} Live`} size="small" className="bg-red-500 text-white font-bold" />
                  <Typography className="text-sm text-gray-600">{getTotalListeners()} listeners</Typography>
                </div>
              </div>
              <div className="p-20">
                {liveStreams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {liveStreams.map((stream) => (
                      <div key={stream.id} className={`p-16 bg-gray-50 rounded-12 border-l-4 ${getStreamBorderColor(stream.status)}`}>
                        <div className="flex justify-between items-center mb-12">
                          <Chip 
                            label={stream.status.toUpperCase()} 
                            size="small" 
                            className={`${getStreamChipColor(stream.status)} text-white font-bold`} 
                            icon={<span className="w-6 h-6 bg-white rounded-full ml-4 animate-pulse" />} 
                          />
                          <Typography className="text-xs text-gray-600">{stream.duration}</Typography>
                        </div>
                        <Typography className="font-semibold mb-4">{stream.channelName}</Typography>
                        <Typography className="text-sm text-gray-600 mb-12">{stream.showName}</Typography>
                        <div className="flex justify-between items-center pt-12 border-t border-gray-200">
                          <div className="flex gap-12">
                            <span className="flex items-center gap-4 text-sm text-gray-600">
                              <FuseSvgIcon size={16} className="text-green-600">heroicons-outline:users</FuseSvgIcon>
                              {stream.listeners}
                            </span>
                            <span className="flex items-center gap-4 text-sm text-gray-600">
                              <FuseSvgIcon size={16} className="text-green-600">heroicons-outline:wifi</FuseSvgIcon>
                              {stream.bitrate}kbps
                            </span>
                          </div>
                          <div className="flex gap-4">
                            <IconButton size="small" className="bg-gray-200 hover:bg-green-600 hover:text-white">
                              <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                            </IconButton>
                            <IconButton size="small" className="bg-gray-200 hover:bg-green-600 hover:text-white">
                              <FuseSvgIcon size={16}>heroicons-outline:refresh</FuseSvgIcon>
                            </IconButton>
                            <IconButton size="small" className="bg-gray-200 hover:bg-red-500 hover:text-white">
                              <FuseSvgIcon size={16}>heroicons-outline:stop</FuseSvgIcon>
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 text-gray-400">
                    <FuseSvgIcon size={48} className="mb-8">heroicons-outline:radio</FuseSvgIcon>
                    <Typography>No active streams</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Server Health */}
          <motion.div variants={itemVariant}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-green-600">heroicons-outline:server</FuseSvgIcon>
                  Server Health
                </Typography>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-2 gap-12">
                  {[
                    { icon: 'heroicons-outline:server', label: 'Primary Server', status: 'Online' },
                    { icon: 'heroicons-outline:database', label: 'Database', status: 'Connected' },
                    { icon: 'heroicons-outline:cloud', label: 'CDN', status: 'Active' },
                    { icon: 'heroicons-outline:shield-check', label: 'Firewall', status: 'Protected' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-8 p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center justify-center w-40 h-40 rounded-8 bg-green-100">
                        <FuseSvgIcon className="text-green-600" size={20}>{item.icon}</FuseSvgIcon>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography className="text-xs text-gray-600 truncate">{item.label}</Typography>
                        <Typography className="text-sm font-semibold text-green-600">{item.status}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Bandwidth Usage */}
          <motion.div variants={itemVariant}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-green-600">heroicons-outline:chart-bar</FuseSvgIcon>
                  Bandwidth
                </Typography>
              </div>
              <div className="p-20">
                <div className="mb-16">
                  <div className="h-12 bg-gray-200 rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-300" style={{ width: `${bandwidthUsage}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <Typography className="text-24 font-bold text-green-600">{bandwidthUsage}%</Typography>
                    <Typography className="text-sm text-gray-600">of 1 Gbps</Typography>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-12">
                  <div className="text-center p-12 bg-gray-50 rounded-8">
                    <Typography className="text-xs text-gray-600">Inbound</Typography>
                    <Typography className="font-semibold">{inboundBandwidth} Mbps</Typography>
                  </div>
                  <div className="text-center p-12 bg-gray-50 rounded-8">
                    <Typography className="text-xs text-gray-600">Outbound</Typography>
                    <Typography className="font-semibold">{outboundBandwidth} Mbps</Typography>
                  </div>
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariant}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-green-600">heroicons-outline:clock</FuseSvgIcon>
                  Activity Log
                </Typography>
                <Button size="small" className="text-green-600" onClick={() => setRecentActivity([])}>Clear</Button>
              </div>
              <div className="p-20">
                {recentActivity.length > 0 ? (
                  <div className="flex flex-col gap-12 max-h-200 overflow-y-auto">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-12 pb-12 border-b last:border-0">
                        <div className={`flex items-center justify-center w-32 h-32 rounded-full ${getActivityColor(activity.type)}`}>
                          <FuseSvgIcon size={16}>{getActivityIcon(activity.type)}</FuseSvgIcon>
                        </div>
                        <div className="flex-1">
                          <Typography className="text-sm">{activity.message}</Typography>
                          <Typography className="text-xs text-gray-500">{activity.time.toLocaleTimeString()}</Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-400">
                    <Typography className="text-sm">No recent activity</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Alerts */}
          <motion.div variants={itemVariant}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-green-600">heroicons-outline:bell</FuseSvgIcon>
                  Alerts
                </Typography>
                {alerts.length > 0 && <Chip label={alerts.length} size="small" className="bg-red-500 text-white font-bold" />}
              </div>
              <div className="p-20">
                {alerts.length > 0 ? (
                  <div className="flex flex-col gap-8">
                    {alerts.map((alert, idx) => (
                      <div key={idx} className={`flex items-center gap-12 p-12 rounded-8 ${getAlertBgColor(alert.severity)}`}>
                        <FuseSvgIcon size={20}>{getAlertIcon(alert.severity)}</FuseSvgIcon>
                        <Typography className="text-sm">{alert.message}</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-green-600">
                    <FuseSvgIcon size={48} className="mb-8">heroicons-outline:check-circle</FuseSvgIcon>
                    <Typography className="text-sm">No active alerts</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default RealtimePage;
