import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import LinearProgress from '@mui/material/LinearProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function BackupPage() {
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [backupProgress, setBackupProgress] = useState(65);
  const [allBackups, setAllBackups] = useState([
    { id: '1', name: 'Full System Backup', type: 'full', size: '15.2 GB', status: 'completed', createdAt: new Date(Date.now() - 3600000), duration: '45 min' },
    { id: '2', name: 'Database Backup', type: 'database', size: '2.1 GB', status: 'completed', createdAt: new Date(Date.now() - 86400000), duration: '8 min' },
    { id: '3', name: 'Incremental Backup', type: 'incremental', size: '850 MB', status: 'in_progress', createdAt: new Date() },
    { id: '4', name: 'Media Files Backup', type: 'media', size: '28.5 GB', status: 'completed', createdAt: new Date(Date.now() - 172800000), duration: '2h 15min' },
    { id: '5', name: 'Scheduled Backup', type: 'full', size: '-', status: 'scheduled', createdAt: new Date(Date.now() + 82800000) },
    { id: '6', name: 'Database Backup', type: 'database', size: '2.0 GB', status: 'failed', createdAt: new Date(Date.now() - 259200000) },
  ]);

  const [backupSchedules, setBackupSchedules] = useState([
    { time: '02:00', frequency: 'Daily', type: 'incremental', nextRun: new Date(Date.now() + 43200000), enabled: true },
    { time: '00:00', frequency: 'Weekly', type: 'full', nextRun: new Date(Date.now() + 259200000), enabled: true },
    { time: '03:00', frequency: 'Daily', type: 'database', nextRun: new Date(Date.now() + 46800000), enabled: true },
    { time: '04:00', frequency: 'Monthly', type: 'media', nextRun: new Date(Date.now() + 604800000), enabled: false },
  ]);

  const storageLocations = [
    { name: 'Local Storage', icon: 'heroicons-outline:server', used: 45.5, total: 100, status: 'healthy' },
    { name: 'Cloud (AWS S3)', icon: 'heroicons-outline:cloud', used: 120, total: 500, status: 'healthy' },
    { name: 'Network Drive', icon: 'heroicons-outline:globe', used: 85, total: 100, status: 'warning' },
  ];

  const alerts = [
    { message: 'Storage reaching 85% capacity', time: '1 hour ago', severity: 'warning' },
    { message: 'Database backup failed - retry scheduled', time: '3 days ago', severity: 'error' },
  ];

  const systemStatus = 'healthy';
  const lastBackupTime = new Date(Date.now() - 3600000);
  const nextBackupTime = new Date(Date.now() + 82800000);
  const totalBackups = 24;
  const completedBackups = 18;
  const scheduledBackups = 3;
  const storageUsed = 45.5;
  const failedBackups = 1;
  const backupHealth = 92;
  const successRate = 95;
  const avgDuration = '28 min';
  const lastVerified = '2 hours ago';

  useEffect(() => {
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev < 100) {
          const newProgress = prev + Math.random() * 5;
          return newProgress >= 100 ? 100 : newProgress;
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredBackups = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (timelineFilter) {
      case 'today':
        return allBackups.filter((b) => b.createdAt >= today);
      case 'week':
        return allBackups.filter((b) => b.createdAt >= weekAgo);
      default:
        return allBackups;
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: 'heroicons-outline:check',
      in_progress: 'heroicons-outline:refresh',
      failed: 'heroicons-outline:x',
      scheduled: 'heroicons-outline:clock',
    };
    return icons[status] || 'heroicons-outline:circle';
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700 border-green-500';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-700 border-blue-500';
    if (status === 'failed') return 'bg-red-100 text-red-700 border-red-500';
    if (status === 'scheduled') return 'bg-orange-100 text-orange-700 border-orange-500';
    return 'bg-gray-100 text-gray-700 border-gray-500';
  };

  const getTypeBadgeColor = (type) => {
    if (type === 'full') return 'bg-purple-500 text-white';
    if (type === 'database') return 'bg-blue-500 text-white';
    if (type === 'media') return 'bg-green-500 text-white';
    if (type === 'incremental') return 'bg-orange-500 text-white';
    return 'bg-gray-500 text-white';
  };

  const getStoragePercent = (location) => (location.used / location.total) * 100;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatNextRun = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const toggleSchedule = (index) => {
    setBackupSchedules((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  };

  const deleteBackup = (id) => {
    if (window.confirm('Are you sure you want to delete this backup?')) {
      setAllBackups((prev) => prev.filter((b) => b.id !== id));
      alert('Backup deleted successfully!');
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-emerald-800 to-emerald-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} className="text-emerald-800">
                heroicons-outline:shield-check
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Backup & Recovery</Typography>
                <Chip label={systemStatus} size="small" className="bg-green-500 text-white font-bold capitalize" />
              </div>
              <div className="flex flex-wrap gap-12 text-white text-sm">
                <span className="flex items-center gap-4">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:check-circle</FuseSvgIcon>
                  Last: {formatDate(lastBackupTime)}
                </span>
                <span className="flex items-center gap-4">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:clock</FuseSvgIcon>
                  Next: {formatDate(nextBackupTime)}
                </span>
                <span className="flex items-center gap-4">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:database</FuseSvgIcon>
                  {totalBackups} Backups
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button variant="outlined" className="border-white/30 text-white hover:bg-white/10" startIcon={<FuseSvgIcon className="text-white">heroicons-outline:cog</FuseSvgIcon>}>
              Settings
            </Button>
            <Button variant="contained" className="bg-white text-emerald-800 hover:bg-gray-100" startIcon={<FuseSvgIcon className="text-emerald-800">heroicons-outline:plus</FuseSvgIcon>}>
              Create Backup
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:check-circle', label: 'Completed', value: completedBackups, color: 'from-green-600 to-green-700' },
          { icon: 'heroicons-outline:calendar', label: 'Scheduled', value: scheduledBackups, color: 'from-blue-600 to-blue-700' },
          { icon: 'heroicons-outline:server', label: 'Storage Used', value: `${storageUsed} GB`, color: 'from-purple-600 to-purple-700' },
          { icon: 'heroicons-outline:exclamation', label: 'Failed', value: failedBackups, color: 'from-red-500 to-red-600' },
        ].map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Paper className="flex items-center gap-16 p-20 rounded-16 shadow">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 p-24 sm:p-32 pt-0">
        {/* Left Column - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-24">
          {/* Backup Timeline */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:clock</FuseSvgIcon>
                  Backup Timeline
                </Typography>
                <div className="flex gap-4">
                  {['all', 'today', 'week'].map((filter) => (
                    <Button key={filter} size="small" variant={timelineFilter === filter ? 'contained' : 'outlined'} onClick={() => setTimelineFilter(filter)} className="min-w-60">
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-20">
                {getFilteredBackups().length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {getFilteredBackups().map((backup) => (
                      <div key={backup.id} className={`p-16 rounded-12 border-l-4 ${getStatusColor(backup.status)}`}>
                        <div className="flex items-start gap-12 mb-8">
                          <FuseSvgIcon size={20} className={backup.status === 'in_progress' ? 'animate-spin' : ''}>{getStatusIcon(backup.status)}</FuseSvgIcon>
                          <div className="flex-1">
                            <div className="flex items-center gap-8 mb-4">
                              <Typography className="font-semibold text-sm">{backup.name}</Typography>
                              <Chip label={backup.type} size="small" className={`${getTypeBadgeColor(backup.type)} h-20 text-xs font-bold`} />
                            </div>
                            <div className="flex flex-wrap gap-12 text-xs text-gray-600">
                              <span className="flex items-center gap-4">
                                <FuseSvgIcon size={12}>heroicons-outline:server</FuseSvgIcon>
                                {backup.size}
                              </span>
                              {backup.duration && (
                                <span className="flex items-center gap-4">
                                  <FuseSvgIcon size={12}>heroicons-outline:clock</FuseSvgIcon>
                                  {backup.duration}
                                </span>
                              )}
                              <span>{formatDate(backup.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        {backup.status === 'in_progress' && (
                          <LinearProgress variant="determinate" value={backupProgress} className="h-6 rounded-full" />
                        )}
                        {backup.status === 'completed' && (
                          <div className="flex gap-8 mt-8">
                            <IconButton size="small" className="bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white" title="Download">
                              <FuseSvgIcon size={16}>heroicons-outline:download</FuseSvgIcon>
                            </IconButton>
                            <IconButton size="small" className="bg-green-100 hover:bg-green-600 text-green-600 hover:text-white" title="Restore">
                              <FuseSvgIcon size={16}>heroicons-outline:refresh</FuseSvgIcon>
                            </IconButton>
                            <IconButton size="small" className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white" title="Delete" onClick={() => deleteBackup(backup.id)}>
                              <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                            </IconButton>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:archive</FuseSvgIcon>
                    <Typography className="text-gray-400">No backups found</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Storage Locations */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:server</FuseSvgIcon>
                  Storage Locations
                </Typography>
                <Button size="small">Manage</Button>
              </div>
              <div className="p-20 flex flex-col gap-12">
                {storageLocations.map((location, idx) => (
                  <div key={idx} className="p-16 bg-gray-50 rounded-12">
                    <div className="flex items-center gap-12 mb-12">
                      <div className={`flex items-center justify-center w-40 h-40 rounded-8 ${location.status === 'healthy' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <FuseSvgIcon size={20} className={location.status === 'healthy' ? 'text-green-600' : 'text-orange-600'}>{location.icon}</FuseSvgIcon>
                      </div>
                      <div className="flex-1">
                        <Typography className="font-semibold text-sm mb-4">{location.name}</Typography>
                        <LinearProgress variant="determinate" value={getStoragePercent(location)} className="h-6 rounded-full" />
                        <Typography className="text-xs text-gray-600 mt-4">
                          {location.used} GB / {location.total} GB
                        </Typography>
                      </div>
                      <div className={`w-10 h-10 rounded-full ${location.status === 'healthy' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Middle Column - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-24">
          {/* Quick Actions */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:lightning-bolt</FuseSvgIcon>
                  Quick Actions
                </Typography>
              </div>
              <div className="p-20 grid grid-cols-2 gap-12">
                {[
                  { icon: 'heroicons-outline:server', label: 'Full Backup', desc: 'Complete system', color: 'bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white' },
                  { icon: 'heroicons-outline:database', label: 'Database', desc: 'MySQL data only', color: 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white' },
                  { icon: 'heroicons-outline:photograph', label: 'Media Files', desc: 'Audio & images', color: 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white' },
                  { icon: 'heroicons-outline:collection', label: 'Incremental', desc: 'Changes only', color: 'bg-orange-100 text-orange-700 hover:bg-orange-600 hover:text-white' },
                ].map((action, idx) => (
                  <Button key={idx} variant="outlined" className={`flex-col h-100 ${action.color} border-0`} fullWidth>
                    <FuseSvgIcon size={32} className="mb-8">{action.icon}</FuseSvgIcon>
                    <Typography className="text-sm font-bold mb-4">{action.label}</Typography>
                    <Typography className="text-xs">{action.desc}</Typography>
                  </Button>
                ))}
              </div>
            </Paper>
          </motion.div>

          {/* Backup Schedule */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:calendar</FuseSvgIcon>
                  Backup Schedule
                </Typography>
                <Button size="small">Edit</Button>
              </div>
              <div className="p-20 flex flex-col gap-12">
                {backupSchedules.map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                    <div className="flex flex-col items-center min-w-60">
                      <Typography className="text-lg font-bold text-emerald-700">{schedule.time}</Typography>
                      <Typography className="text-xs text-gray-600">{schedule.frequency}</Typography>
                    </div>
                    <div className="flex-1">
                      <Typography className="text-sm font-semibold mb-2">{schedule.type} Backup</Typography>
                      <Typography className="text-xs text-gray-600">Next: {formatNextRun(schedule.nextRun)}</Typography>
                    </div>
                    <Switch checked={schedule.enabled} onChange={() => toggleSchedule(idx)} />
                  </div>
                ))}
              </div>
            </Paper>
          </motion.div>

          {/* Current Settings */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:adjustments</FuseSvgIcon>
                  Current Settings
                </Typography>
              </div>
              <div className="p-20 flex flex-col gap-12">
                {[
                  { label: 'Auto Backup', value: 'Daily' },
                  { label: 'Retention', value: '30 Days' },
                  { label: 'Compression', value: 'Enabled' },
                  { label: 'Encryption', value: 'AES-256' },
                ].map((setting, idx) => (
                  <div key={idx} className="flex justify-between items-center p-12 bg-gray-50 rounded-8">
                    <Typography className="text-sm text-gray-700">{setting.label}</Typography>
                    <Typography className="text-sm font-semibold text-emerald-700">{setting.value}</Typography>
                  </div>
                ))}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column - 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-24">
          {/* Recovery Options */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:shield-check</FuseSvgIcon>
                  Recovery Options
                </Typography>
              </div>
              <div className="p-20 flex flex-col gap-12">
                {[
                  { icon: 'heroicons-outline:clock', title: 'Point-in-Time', desc: 'Restore to specific moment' },
                  { icon: 'heroicons-outline:refresh', title: 'Full Restore', desc: 'Complete system recovery' },
                  { icon: 'heroicons-outline:document-add', title: 'Selective Restore', desc: 'Choose specific files' },
                ].map((option, idx) => (
                  <Button key={idx} variant="outlined" className="flex items-center gap-12 p-16 h-auto justify-start" fullWidth>
                    <div className="flex items-center justify-center w-40 h-40 rounded-8 bg-emerald-100">
                      <FuseSvgIcon size={20} className="text-emerald-700">{option.icon}</FuseSvgIcon>
                    </div>
                    <div className="flex flex-col items-start">
                      <Typography className="text-sm font-semibold">{option.title}</Typography>
                      <Typography className="text-xs text-gray-600">{option.desc}</Typography>
                    </div>
                  </Button>
                ))}
              </div>
            </Paper>
          </motion.div>

          {/* Backup Health */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:heart</FuseSvgIcon>
                  Backup Health
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col items-center mb-20">
                  <div className="flex flex-col items-center justify-center w-120 h-120 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 mb-12">
                    <Typography className="text-32 font-bold text-emerald-800">{backupHealth}%</Typography>
                    <Typography className="text-sm text-emerald-600">Overall Health</Typography>
                  </div>
                </div>
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Success Rate', value: `${successRate}%`, color: 'text-green-600' },
                    { label: 'Avg Duration', value: avgDuration, color: 'text-blue-600' },
                    { label: 'Last Verified', value: lastVerified, color: 'text-gray-600' },
                  ].map((metric, idx) => (
                    <div key={idx} className="flex justify-between items-center p-12 bg-gray-50 rounded-8">
                      <Typography className="text-sm text-gray-700">{metric.label}</Typography>
                      <Typography className={`text-sm font-semibold ${metric.color}`}>{metric.value}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon className="text-emerald-700">heroicons-outline:bell</FuseSvgIcon>
                  Recent Alerts
                </Typography>
                {alerts.length > 0 && <Chip label={alerts.length} size="small" className="bg-red-500 text-white font-bold" />}
              </div>
              <div className="p-20">
                {alerts.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {alerts.map((alert, idx) => (
                      <div key={idx} className={`p-12 rounded-8 border-l-4 ${alert.severity === 'warning' ? 'bg-orange-50 border-orange-500' : 'bg-red-50 border-red-500'}`}>
                        <div className="flex items-start gap-8">
                          <FuseSvgIcon size={16} className={alert.severity === 'warning' ? 'text-orange-600' : 'text-red-600'}>
                            {alert.severity === 'warning' ? 'heroicons-outline:exclamation' : 'heroicons-outline:x-circle'}
                          </FuseSvgIcon>
                          <div className="flex-1">
                            <Typography className="text-sm mb-4">{alert.message}</Typography>
                            <Typography className="text-xs text-gray-500">{alert.time}</Typography>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={48} className="mb-8 text-green-600">heroicons-outline:check-circle</FuseSvgIcon>
                    <Typography className="text-sm text-green-600">No alerts</Typography>
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

export default BackupPage;
