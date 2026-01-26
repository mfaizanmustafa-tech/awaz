import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [allLogs, setAllLogs] = useState([
    { id: '1', timestamp: new Date(Date.now() - 60000), level: 'info', source: 'auth', message: 'User admin logged in' },
    { id: '2', timestamp: new Date(Date.now() - 120000), level: 'warning', source: 'streaming', message: 'High latency on FM101', details: 'Latency: 250ms\nServer: stream-01' },
    { id: '3', timestamp: new Date(Date.now() - 180000), level: 'error', source: 'database', message: 'Connection timeout', details: 'Error: ETIMEDOUT\nHost: db-replica-02' },
    { id: '4', timestamp: new Date(Date.now() - 240000), level: 'info', source: 'api', message: 'Rate limit updated' },
    { id: '5', timestamp: new Date(Date.now() - 300000), level: 'debug', source: 'system', message: 'Cache cleared' },
    { id: '6', timestamp: new Date(Date.now() - 360000), level: 'info', source: 'streaming', message: 'New stream started' },
    { id: '7', timestamp: new Date(Date.now() - 420000), level: 'warning', source: 'auth', message: 'Multiple failed logins' },
    { id: '8', timestamp: new Date(Date.now() - 480000), level: 'error', source: 'api', message: 'External API unavailable', details: 'Service: Weather API\nStatus: 503' },
  ]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    setFilteredLogs([...allLogs]);
  }, [allLogs]);

  useEffect(() => {
    filterLogs();
  }, [searchQuery, levelFilter, sourceFilter, allLogs]);

  const filterLogs = () => {
    const filtered = allLogs.filter((log) => {
      const matchesSearch = !searchQuery || log.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = !levelFilter || log.level === levelFilter;
      const matchesSource = !sourceFilter || log.source === sourceFilter;
      return matchesSearch && matchesLevel && matchesSource;
    });
    setFilteredLogs(filtered);
  };

  const setLevelFilterAndFilter = (level) => {
    setLevelFilter(level);
  };

  const getLogCount = (level) => allLogs.filter((l) => l.level === level).length;

  const getLevelIcon = (level) => {
    const icons = {
      info: 'heroicons-outline:information-circle',
      warning: 'heroicons-outline:exclamation',
      error: 'heroicons-outline:x-circle',
      debug: 'heroicons-outline:code',
    };
    return icons[level] || 'heroicons-outline:circle';
  };

  const getLevelColor = (level) => {
    if (level === 'info') return 'bg-blue-100 text-blue-700 border-blue-500';
    if (level === 'warning') return 'bg-orange-100 text-orange-700 border-orange-500';
    if (level === 'error') return 'bg-red-100 text-red-700 border-red-500';
    if (level === 'debug') return 'bg-gray-100 text-gray-700 border-gray-500';
    return 'bg-gray-100 text-gray-700 border-gray-500';
  };

  const getLevelBadgeColor = (level) => {
    if (level === 'info') return 'bg-blue-500 text-white';
    if (level === 'warning') return 'bg-orange-500 text-white';
    if (level === 'error') return 'bg-red-500 text-white';
    if (level === 'debug') return 'bg-gray-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getRecentErrors = () => allLogs.filter((l) => l.level === 'error').slice(0, 3);

  const toggleDetails = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const refreshLogs = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const exportLogs = () => {
    alert('Exporting logs...');
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      setAllLogs([]);
      alert('Logs cleared successfully!');
    }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} className="text-gray-800">
                heroicons-outline:clipboard-list
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">System Logs</Typography>
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:view-list</FuseSvgIcon>
                  {allLogs.length} Total Entries
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:exclamation</FuseSvgIcon>
                  {getLogCount('error')} Errors
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button variant="outlined" className="border-white/30 text-white hover:bg-white/10" startIcon={<FuseSvgIcon className="text-white">heroicons-outline:download</FuseSvgIcon>} onClick={exportLogs}>
              Export
            </Button>
            <Button variant="contained" className="bg-white text-gray-800 hover:bg-gray-100" startIcon={<FuseSvgIcon className={`text-gray-800 ${isRefreshing ? 'animate-spin' : ''}`}>heroicons-outline:refresh</FuseSvgIcon>} onClick={refreshLogs}>
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:information-circle', label: 'Info', value: getLogCount('info'), color: 'from-blue-500 to-blue-600', onClick: () => setLevelFilterAndFilter('info') },
          { icon: 'heroicons-outline:exclamation', label: 'Warnings', value: getLogCount('warning'), color: 'from-orange-500 to-orange-600', onClick: () => setLevelFilterAndFilter('warning') },
          { icon: 'heroicons-outline:x-circle', label: 'Errors', value: getLogCount('error'), color: 'from-red-500 to-red-600', onClick: () => setLevelFilterAndFilter('error') },
          { icon: 'heroicons-outline:code', label: 'Debug', value: getLogCount('debug'), color: 'from-gray-600 to-gray-700', onClick: () => setLevelFilterAndFilter('debug') },
        ].map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Paper className="flex items-center gap-16 p-20 rounded-16 shadow cursor-pointer hover:shadow-lg transition-shadow" onClick={stat.onClick}>
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
        {/* Left Column - Main Content (2 columns width) */}
        <div className="lg:col-span-2 flex flex-col gap-24">
          {/* Filters */}
          <motion.div variants={item}>
            <Paper className="p-16 rounded-16 shadow">
              <div className="flex flex-col sm:flex-row gap-12">
                <TextField
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  className="flex-1"
                  InputProps={{
                    startAdornment: <FuseSvgIcon size={20} className="mr-8 text-gray-600">heroicons-outline:search</FuseSvgIcon>,
                  }}
                />
                <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
                <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Sources</MenuItem>
                  <MenuItem value="auth">Auth</MenuItem>
                  <MenuItem value="streaming">Streaming</MenuItem>
                  <MenuItem value="database">Database</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Logs List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-gray-700">heroicons-outline:view-list</FuseSvgIcon>
                  Log Entries
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredLogs.length} entries</Typography>
              </div>
              <div className="p-20">
                {filteredLogs.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {filteredLogs.map((log) => (
                      <div key={log.id}>
                        <div 
                          className={`p-16 rounded-12 border-l-4 ${getLevelColor(log.level)} cursor-pointer hover:bg-gray-50 transition-colors`} 
                          onClick={() => toggleDetails(log.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleDetails(log.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-start gap-12">
                            <div className="flex items-center gap-8 min-w-100">
                              <FuseSvgIcon size={20}>{getLevelIcon(log.level)}</FuseSvgIcon>
                              <Chip label={log.level.toUpperCase()} size="small" className={`${getLevelBadgeColor(log.level)} font-bold h-20 text-xs`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-8 mb-4">
                                <Chip label={log.source} size="small" className="bg-gray-200 text-gray-700 h-20 text-xs font-semibold" />
                                <Typography className="text-sm">{log.message}</Typography>
                              </div>
                            </div>
                            <Typography className="text-xs text-gray-500 whitespace-nowrap">{formatTime(log.timestamp)}</Typography>
                          </div>
                        </div>
                        <Collapse in={expandedLog === log.id}>
                          {log.details && (
                            <div className="ml-32 mt-8 p-12 bg-gray-900 rounded-8">
                              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{log.details}</pre>
                            </div>
                          )}
                        </Collapse>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:clipboard-check</FuseSvgIcon>
                    <Typography className="text-gray-400">No logs found</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Today's Summary */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-gray-700">heroicons-outline:chart-bar</FuseSvgIcon>
                  Today's Summary
                </Typography>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-2 gap-12">
                  {[
                    { label: 'Total', value: allLogs.length, color: 'text-gray-700' },
                    { label: 'Errors', value: getLogCount('error'), color: 'text-red-600' },
                    { label: 'Warnings', value: getLogCount('warning'), color: 'text-orange-600' },
                    { label: 'Info', value: getLogCount('info'), color: 'text-blue-600' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center p-12 bg-gray-50 rounded-8">
                      <Typography className={`text-24 font-bold ${stat.color}`}>{stat.value}</Typography>
                      <Typography className="text-xs text-gray-600">{stat.label}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Errors */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-red-600">heroicons-outline:exclamation-circle</FuseSvgIcon>
                  Recent Errors
                </Typography>
              </div>
              <div className="p-20">
                {getRecentErrors().length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {getRecentErrors().map((log) => (
                      <div key={log.id} className="p-12 bg-red-50 rounded-8 border-l-4 border-red-500">
                        <div className="flex items-center gap-8 mb-4">
                          <Chip label={log.source} size="small" className="bg-red-200 text-red-700 h-20 text-xs font-semibold" />
                        </div>
                        <Typography className="text-sm text-gray-700 mb-4">{log.message}</Typography>
                        <Typography className="text-xs text-gray-500">{formatTime(log.timestamp)}</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={48} className="mb-8 text-green-600">heroicons-outline:check-circle</FuseSvgIcon>
                    <Typography className="text-sm text-green-600">No recent errors</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-gray-700">heroicons-outline:lightning-bolt</FuseSvgIcon>
                  Quick Actions
                </Typography>
              </div>
              <div className="p-20 flex flex-col gap-12">
                <Button variant="outlined" fullWidth startIcon={<FuseSvgIcon>heroicons-outline:download</FuseSvgIcon>} onClick={exportLogs}>
                  Export Logs
                </Button>
                <Button variant="outlined" color="error" fullWidth startIcon={<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>} onClick={clearLogs}>
                  Clear Logs
                </Button>
                <Button variant="outlined" fullWidth startIcon={<FuseSvgIcon>heroicons-outline:refresh</FuseSvgIcon>} onClick={refreshLogs}>
                  Refresh
                </Button>
              </div>
            </Paper>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LogsPage;
