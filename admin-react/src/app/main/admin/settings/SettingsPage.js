import { motion } from 'framer-motion';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function SettingsPage() {
  const [settings, setSettings] = useState({
    platformName: 'Awaz Pulse',
    supportEmail: 'support@awazpulse.com',
    defaultLanguage: 'en',
    timezone: 'Asia/Karachi',
    defaultBitrate: '128',
    maxStreams: 100,
    autoReconnect: true,
    enableRecording: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    forceHttps: true,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    storageUsed: 125.5,
    storageTotal: 500,
    maxUploadSize: 100,
    allowedFileTypes: 'mp3, wav, flac',
    autoDeleteOld: false,
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    weeklyReports: false,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const getStoragePercentage = () => (settings.storageUsed / settings.storageTotal) * 100;

  const saveAllSettings = () => {
    alert('Settings saved successfully!');
  };

  const testEmail = () => {
    alert('Test email sent!');
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} className="text-slate-800">
                heroicons-outline:cog
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">System Settings</Typography>
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:check-circle</FuseSvgIcon>
                  All systems configured
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button variant="contained" className="bg-white text-slate-800 hover:bg-gray-100" startIcon={<FuseSvgIcon className="text-slate-800">heroicons-outline:save</FuseSvgIcon>} onClick={saveAllSettings}>
              Save All
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Settings Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 p-24 sm:p-32">
        {/* General Settings */}
        <motion.div variants={item}>
          <Paper className="rounded-16 shadow overflow-hidden h-full">
            <div className="p-20 border-b bg-gradient-to-r from-slate-600 to-slate-700">
              <Typography className="text-lg font-semibold flex items-center gap-8 text-white">
                <FuseSvgIcon className="text-white">heroicons-outline:adjustments</FuseSvgIcon>
                General
              </Typography>
            </div>
            <div className="p-20 flex flex-col gap-16">
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Platform Name</Typography>
                <TextField fullWidth size="small" value={settings.platformName} onChange={(e) => handleChange('platformName', e.target.value)} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Support Email</Typography>
                <TextField fullWidth size="small" type="email" value={settings.supportEmail} onChange={(e) => handleChange('supportEmail', e.target.value)} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Default Language</Typography>
                <Select fullWidth size="small" value={settings.defaultLanguage} onChange={(e) => handleChange('defaultLanguage', e.target.value)}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="ur">Urdu</MenuItem>
                </Select>
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Timezone</Typography>
                <Select fullWidth size="small" value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)}>
                  <MenuItem value="Asia/Karachi">Asia/Karachi (PKT)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                </Select>
              </div>
            </div>
          </Paper>
        </motion.div>

        {/* Streaming Settings */}
        <motion.div variants={item}>
          <Paper className="rounded-16 shadow overflow-hidden h-full">
            <div className="p-20 border-b bg-gradient-to-r from-blue-600 to-blue-700">
              <Typography className="text-lg font-semibold flex items-center gap-8 text-white">
                <FuseSvgIcon className="text-white">heroicons-outline:radio</FuseSvgIcon>
                Streaming
              </Typography>
            </div>
            <div className="p-20 flex flex-col gap-16">
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Default Bitrate</Typography>
                <Select fullWidth size="small" value={settings.defaultBitrate} onChange={(e) => handleChange('defaultBitrate', e.target.value)}>
                  <MenuItem value="64">64 kbps</MenuItem>
                  <MenuItem value="128">128 kbps</MenuItem>
                  <MenuItem value="192">192 kbps</MenuItem>
                  <MenuItem value="256">256 kbps</MenuItem>
                </Select>
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Max Concurrent Streams</Typography>
                <TextField fullWidth size="small" type="number" value={settings.maxStreams} onChange={(e) => handleChange('maxStreams', parseInt(e.target.value))} />
              </div>
              <FormControlLabel control={<Switch checked={settings.autoReconnect} onChange={(e) => handleChange('autoReconnect', e.target.checked)} />} label="Auto-reconnect" />
              <FormControlLabel control={<Switch checked={settings.enableRecording} onChange={(e) => handleChange('enableRecording', e.target.checked)} />} label="Enable Recording" />
            </div>
          </Paper>
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={item}>
          <Paper className="rounded-16 shadow overflow-hidden h-full">
            <div className="p-20 border-b bg-gradient-to-r from-red-600 to-red-700">
              <Typography className="text-lg font-semibold flex items-center gap-8 text-white">
                <FuseSvgIcon className="text-white">heroicons-outline:shield-check</FuseSvgIcon>
                Security
              </Typography>
            </div>
            <div className="p-20 flex flex-col gap-16">
              <FormControlLabel control={<Switch checked={settings.twoFactorAuth} onChange={(e) => handleChange('twoFactorAuth', e.target.checked)} />} label="Two-Factor Auth" />
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Session Timeout (min)</Typography>
                <TextField fullWidth size="small" type="number" value={settings.sessionTimeout} onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Max Login Attempts</Typography>
                <TextField fullWidth size="small" type="number" value={settings.maxLoginAttempts} onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))} />
              </div>
              <FormControlLabel control={<Switch checked={settings.forceHttps} onChange={(e) => handleChange('forceHttps', e.target.checked)} />} label="Force HTTPS" />
            </div>
          </Paper>
        </motion.div>

        {/* Email Settings */}
        <motion.div variants={item}>
          <Paper className="rounded-16 shadow overflow-hidden h-full">
            <div className="p-20 border-b bg-gradient-to-r from-purple-600 to-purple-700">
              <Typography className="text-lg font-semibold flex items-center gap-8 text-white">
                <FuseSvgIcon className="text-white">heroicons-outline:mail</FuseSvgIcon>
                Email
              </Typography>
            </div>
            <div className="p-20 flex flex-col gap-16">
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">SMTP Host</Typography>
                <TextField fullWidth size="small" value={settings.smtpHost} onChange={(e) => handleChange('smtpHost', e.target.value)} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">SMTP Port</Typography>
                <TextField fullWidth size="small" type="number" value={settings.smtpPort} onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">SMTP Username</Typography>
                <TextField fullWidth size="small" value={settings.smtpUsername} onChange={(e) => handleChange('smtpUsername', e.target.value)} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">SMTP Password</Typography>
                <TextField fullWidth size="small" type="password" value={settings.smtpPassword} onChange={(e) => handleChange('smtpPassword', e.target.value)} />
              </div>
              <Button variant="outlined" color="primary" startIcon={<FuseSvgIcon>heroicons-outline:paper-airplane</FuseSvgIcon>} onClick={testEmail}>
                Test Email
              </Button>
            </div>
          </Paper>
        </motion.div>

        {/* Storage Settings */}
        <motion.div variants={item}>
          <Paper className="rounded-16 shadow overflow-hidden h-full">
            <div className="p-20 border-b bg-gradient-to-r from-green-600 to-green-700">
              <Typography className="text-lg font-semibold flex items-center gap-8 text-white">
                <FuseSvgIcon className="text-white">heroicons-outline:database</FuseSvgIcon>
                Storage
              </Typography>
            </div>
            <div className="p-20 flex flex-col gap-16">
              <div>
                <div className="flex justify-between mb-8">
                  <Typography className="text-sm font-semibold text-gray-700">Storage Usage</Typography>
                  <Typography className="text-sm text-gray-600">
                    {settings.storageUsed} GB / {settings.storageTotal} GB
                  </Typography>
                </div>
                <LinearProgress variant="determinate" value={getStoragePercentage()} className="h-8 rounded-full" />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Max Upload Size (MB)</Typography>
                <TextField fullWidth size="small" type="number" value={settings.maxUploadSize} onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))} />
              </div>
              <div>
                <Typography className="text-sm font-semibold mb-8 text-gray-700">Allowed File Types</Typography>
                <TextField fullWidth size="small" value={settings.allowedFileTypes} onChange={(e) => handleChange('allowedFileTypes', e.target.value)} />
              </div>
              <FormControlLabel control={<Switch checked={settings.autoDeleteOld} onChange={(e) => handleChange('autoDeleteOld', e.target.checked)} />} label="Auto-delete Old Files" />
            </div>
          </Paper>
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={item}>
          <Paper className="rounded-16 shadow overflow-hidden h-full">
            <div className="p-20 border-b bg-gradient-to-r from-orange-600 to-orange-700">
              <Typography className="text-lg font-semibold flex items-center gap-8 text-white">
                <FuseSvgIcon className="text-white">heroicons-outline:bell</FuseSvgIcon>
                Notifications
              </Typography>
            </div>
            <div className="p-20 flex flex-col gap-16">
              <FormControlLabel control={<Switch checked={settings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} />} label="Email Notifications" />
              <FormControlLabel control={<Switch checked={settings.pushNotifications} onChange={(e) => handleChange('pushNotifications', e.target.checked)} />} label="Push Notifications" />
              <FormControlLabel control={<Switch checked={settings.systemAlerts} onChange={(e) => handleChange('systemAlerts', e.target.checked)} />} label="System Alerts" />
              <FormControlLabel control={<Switch checked={settings.weeklyReports} onChange={(e) => handleChange('weeklyReports', e.target.checked)} />} label="Weekly Reports" />
            </div>
          </Paper>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SettingsPage;
