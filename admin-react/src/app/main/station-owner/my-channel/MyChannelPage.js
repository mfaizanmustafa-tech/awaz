import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function MyChannelPage() {
  console.log('MyChannelPage component loaded');
  
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
  const [channel, setChannel] = useState(null);
  const [shows, setShows] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [guests, setGuests] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [currentShow, setCurrentShow] = useState(null);
  const [nextShow, setNextShow] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [channelFormData, setChannelFormData] = useState({
    name: '',
    callSign: '',
    frequency: '',
    city: '',
    category: 'mixed',
    description: '',
    language: 'urdu'
  });

  console.log('Dialog open state:', openCreateDialog);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadChannels(),
      loadShows(),
      loadHosts(),
      loadGuests()
    ]);
  };

  const loadChannels = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        console.warn('No auth token found');
        return;
      }

      console.log('Loading channels from API...');
      const { data } = await axios.get(`${API_URL}/channels/my-channels`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      console.log('Loaded channels:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setChannels(data);
        setChannel(data[selectedChannelIndex] || data[0]); // Select channel by index
        checkLiveStatus(data[selectedChannelIndex] || data[0]);
      } else {
        setChannels([]);
        setChannel(null);
      }
    } catch (error) {
      console.error('Error loading channels:', error.message);
    }
  };

  const loadShows = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) return;

      const { data } = await axios.get(`${API_URL}/shows`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      if (data && Array.isArray(data)) {
        setShows(data);
        updateCurrentAndNextShow(data);
      }
    } catch (error) {
      console.error('Error loading shows:', error.message);
    }
  };

  const loadHosts = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) return;

      const { data } = await axios.get(`${API_URL}/persons/my-persons`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      if (data && Array.isArray(data)) {
        setHosts(data);
      }
    } catch (error) {
      console.error('Error loading hosts:', error.message);
    }
  };

  const loadGuests = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) return;

      const { data} = await axios.get(`${API_URL}/guests/my-guests`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      if (data && Array.isArray(data)) {
        setGuests(data);
      }
    } catch (error) {
      console.error('Error loading guests:', error.message);
    }
  };

  const checkLiveStatus = (ch) => {
    if (ch?.streams?.some(s => s.status === 'live')) {
      setIsLive(true);
    }
  };

  const handleSwitchChannel = (index) => {
    setSelectedChannelIndex(index);
    const selectedChannel = channels[index];
    setChannel(selectedChannel);
    checkLiveStatus(selectedChannel);
  };

  const handleCreateChannel = () => {
    console.log('Create Channel button clicked');
    setOpenCreateDialog(true);
    console.log('Dialog state set to true');
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setChannelFormData({
      name: '',
      callSign: '',
      frequency: '',
      city: '',
      category: 'mixed',
      description: '',
      language: 'urdu'
    });
  };

  const handleSubmitChannel = async () => {
    if (!channelFormData.name || !channelFormData.callSign) {
      alert('Please fill in required fields (Name and Call Sign)');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      console.log('Creating channel with data:', channelFormData);

      const response = await axios.post(`${API_URL}/channels`, channelFormData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      console.log('Channel created successfully:', response.data);

      handleCloseDialog();
      await loadChannels();
      alert(`Channel "${response.data.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating channel:', error);
      if (error.response) {
        alert(`Failed to create channel: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        alert('Failed to create channel: No response from server. Please check your connection.');
      } else {
        alert(`Failed to create channel: ${error.message}`);
      }
    }
  };

  const updateCurrentAndNextShow = (showsList) => {
    const now = new Date();
    const sortedShows = [...showsList]
      .filter(show => show.scheduledStartTime)
      .sort((a, b) => 
        new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()
      );
    
    const current = sortedShows.find(show => {
      const start = new Date(show.scheduledStartTime);
      const end = show.scheduledEndTime ? new Date(show.scheduledEndTime) : new Date(start.getTime() + 3600000);
      return start <= now && end > now;
    });
    
    const next = sortedShows.find(show => {
      const start = new Date(show.scheduledStartTime);
      return start > now;
    });
    
    setCurrentShow(current || null);
    setNextShow(next || null);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCategory = (category) => {
    if (!category) return 'Unknown';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTime = (time) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2) || 'CH';
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'pending_approval') return 'bg-orange-100 text-orange-700';
    if (status === 'suspended') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const topShows = shows.slice(0, 5);
  const topHosts = [...hosts].sort((a, b) => (Number(b.overallRating) || 0) - (Number(a.overallRating) || 0)).slice(0, 5);
  const topGuests = [...guests].sort((a, b) => (b.totalAppearances || 0) - (a.totalAppearances || 0)).slice(0, 5);

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

  // No Channel State
  if (channels.length === 0) {
    return (
      <>
        <div className="flex flex-col flex-auto min-w-0 items-center justify-center p-24 sm:p-32">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-640">
            <Paper className="p-48 rounded-24 shadow-lg text-center">
              <div className="flex items-center justify-center w-128 h-128 rounded-full bg-gradient-to-r from-cyan-800 to-cyan-900 mx-auto mb-24">
                <FuseSvgIcon size={64} className="text-white">heroicons-outline:signal</FuseSvgIcon>
              </div>
              <Typography className="text-32 font-bold mb-16">Create Your Radio Channel</Typography>
              <Typography className="text-16 text-gray-600 mb-32">
                Start your broadcasting journey by creating your own radio channel. Reach thousands of listeners and share your content with the world.
              </Typography>
              <div className="grid grid-cols-2 gap-16 mb-32">
                {[
                  { icon: 'heroicons-outline:microphone', label: 'Live Broadcasting' },
                  { icon: 'heroicons-outline:users', label: 'Unlimited Listeners' },
                  { icon: 'heroicons-outline:chart-bar', label: 'Real-time Analytics' },
                  { icon: 'heroicons-outline:calendar', label: 'Show Scheduling' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-8 p-16 bg-gray-50 rounded-12">
                    <FuseSvgIcon size={32} color="primary">{feature.icon}</FuseSvgIcon>
                    <Typography className="text-sm font-semibold">{feature.label}</Typography>
                  </div>
                ))}
              </div>
              <Button 
                variant="contained" 
                size="large"
                color="primary"
                startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                className="w-full"
                onClick={handleCreateChannel}
              >
                Create Your Channel
              </Button>
            </Paper>
          </motion.div>
        </div>

        {/* Create Channel Dialog */}
        <Dialog 
          open={openCreateDialog}
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            className: "rounded-16",
            style: { zIndex: 9999 }
          }}
          style={{ zIndex: 9999 }}
        >
          <DialogTitle className="text-xl font-bold">
            <div className="flex items-center gap-8">
              <FuseSvgIcon color="info">heroicons-outline:plus-circle</FuseSvgIcon>
              Create New Channel
            </div>
          </DialogTitle>
          <DialogContent>
            <div className="flex flex-col gap-16 mt-16">
              <TextField
                label="Channel Name"
                value={channelFormData.name}
                onChange={(e) => setChannelFormData({ ...channelFormData, name: e.target.value })}
                fullWidth
                required
                helperText="e.g., FM Islamabad, Radio Pakistan"
              />
              <div className="grid grid-cols-2 gap-16">
                <TextField
                  label="Call Sign"
                  value={channelFormData.callSign}
                  onChange={(e) => setChannelFormData({ ...channelFormData, callSign: e.target.value })}
                  fullWidth
                  required
                  helperText="e.g., URDU-FM, PK-101"
                />
                <TextField
                  label="Frequency"
                  value={channelFormData.frequency}
                  onChange={(e) => setChannelFormData({ ...channelFormData, frequency: e.target.value })}
                  fullWidth
                  helperText="e.g., 92.4 MHz"
                />
              </div>
              <div className="grid grid-cols-2 gap-16">
                <TextField
                  label="City"
                  value={channelFormData.city}
                  onChange={(e) => setChannelFormData({ ...channelFormData, city: e.target.value })}
                  fullWidth
                  helperText="e.g., Islamabad, Karachi"
                />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={channelFormData.category}
                    onChange={(e) => setChannelFormData({ ...channelFormData, category: e.target.value })}
                    label="Category"
                  >
                    <MenuItem value="music">Music</MenuItem>
                    <MenuItem value="talk">Talk</MenuItem>
                    <MenuItem value="news">News</MenuItem>
                    <MenuItem value="religious">Religious</MenuItem>
                    <MenuItem value="sports">Sports</MenuItem>
                    <MenuItem value="mixed">Mixed</MenuItem>
                    <MenuItem value="educational">Educational</MenuItem>
                    <MenuItem value="entertainment">Entertainment</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={channelFormData.language}
                  onChange={(e) => setChannelFormData({ ...channelFormData, language: e.target.value })}
                  label="Language"
                >
                  <MenuItem value="urdu">Urdu</MenuItem>
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="punjabi">Punjabi</MenuItem>
                  <MenuItem value="sindhi">Sindhi</MenuItem>
                  <MenuItem value="pashto">Pashto</MenuItem>
                  <MenuItem value="balochi">Balochi</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={channelFormData.description}
                onChange={(e) => setChannelFormData({ ...channelFormData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                helperText="Brief description of your channel"
              />
            </div>
          </DialogContent>
          <DialogActions className="p-16">
            <Button onClick={handleCloseDialog} className="text-gray-600">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="info" 
              onClick={handleSubmitChannel}
              startIcon={<FuseSvgIcon className="text-white">heroicons-outline:check</FuseSvgIcon>}
            >
              Create Channel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Channel Dashboard
  return (
    <div className="flex flex-col flex-auto min-w-0">
      {/* Channel Hero Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-cyan-800 to-cyan-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="info">
                heroicons-outline:signal
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">{channel?.name}</Typography>
                {isLive && (
                  <Chip 
                    label="LIVE" 
                    size="small" 
                    className="bg-red-500 text-white font-bold animate-pulse" 
                    icon={<span className="w-8 h-8 bg-white rounded-full animate-pulse" />}
                  />
                )}
                {channels.length > 1 && (
                  <Chip 
                    label={`${selectedChannelIndex + 1} of ${channels.length}`} 
                    size="small" 
                    className="bg-white/20 text-white font-bold"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:signal</FuseSvgIcon>
                  {channel?.frequency} MHz
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:tag</FuseSvgIcon>
                  {channel?.callSign}
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:location-marker</FuseSvgIcon>
                  {channel?.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-12 mt-16 sm:mt-0">
            <div className="flex gap-12">
              <Chip 
                label={formatStatus(channel?.status)} 
                className={`${getStatusColor(channel?.status)} font-bold`}
              />
              <Button 
                variant="contained" 
                className="bg-white text-cyan-800 hover:bg-gray-100" 
                startIcon={<FuseSvgIcon color="info">heroicons-outline:cog</FuseSvgIcon>}
              >
                Settings
              </Button>
            </div>
            {/* Channel Navigation */}
            {channels.length > 1 && (
              <div className="flex gap-8 items-center justify-end">
                <Button
                  size="small"
                  variant="outlined"
                  className="border-white/30 text-white hover:bg-white/10 min-w-0 px-8"
                  disabled={selectedChannelIndex === 0}
                  onClick={() => handleSwitchChannel(selectedChannelIndex - 1)}
                >
                  <FuseSvgIcon size={16}>heroicons-outline:chevron-left</FuseSvgIcon>
                </Button>
                <Typography className="text-sm text-white">
                  Switch Channel
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  className="border-white/30 text-white hover:bg-white/10 min-w-0 px-8"
                  disabled={selectedChannelIndex === channels.length - 1}
                  onClick={() => handleSwitchChannel(selectedChannelIndex + 1)}
                >
                  <FuseSvgIcon size={16}>heroicons-outline:chevron-right</FuseSvgIcon>
                </Button>
              </div>
            )}
            {/* Add Channel Button */}
            <Button
              size="small"
              variant="outlined"
              className="border-white/30 text-white hover:bg-white/10"
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
              onClick={handleCreateChannel}
            >
              Add New Channel
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:user-group', label: 'Current Listeners', value: formatNumber(channel?.totalListeners || 0), color: 'from-cyan-800 to-cyan-900' },
          { icon: 'heroicons-outline:microphone', label: 'Total Shows', value: shows.length, color: 'from-blue-600 to-blue-700' },
          { icon: 'heroicons-outline:user', label: 'Hosts', value: hosts.length, color: 'from-green-600 to-green-700' },
          { icon: 'heroicons-outline:users', label: 'Guests', value: guests.length, color: 'from-purple-600 to-purple-700' },
        ].map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Paper className="flex items-center gap-16 p-20 rounded-16 shadow hover:shadow-lg transition-shadow">
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
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-24">
          {/* Broadcast Status */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:signal</FuseSvgIcon>
                  Broadcast Status
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex items-center justify-between mb-16">
                  <div className="flex items-center gap-12">
                    <div className={`w-12 h-12 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                    <Typography className="text-lg font-semibold">{isLive ? 'On Air' : 'Off Air'}</Typography>
                  </div>
                </div>
                <Typography className="text-sm text-gray-600 mb-16 flex items-center gap-8">
                  <FuseSvgIcon size={16}>heroicons-outline:information-circle</FuseSvgIcon>
                  Use the Control Panel to manage your broadcast
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<FuseSvgIcon>heroicons-outline:adjustments</FuseSvgIcon>}
                  onClick={() => navigate('/station-owner/control-panel')}
                >
                  Open Control Panel
                </Button>
              </div>
            </Paper>
          </motion.div>

          {/* Now Playing */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="success">heroicons-outline:play</FuseSvgIcon>
                  Now Playing
                </Typography>
              </div>
              <div className="p-20">
                {currentShow ? (
                  <div className="flex items-center gap-16 mb-16">
                    <div className="flex items-center justify-center w-64 h-64 rounded-12 bg-gradient-to-r from-blue-600 to-blue-700">
                      <FuseSvgIcon size={32} className="text-white">heroicons-outline:microphone</FuseSvgIcon>
                    </div>
                    <div className="flex-1">
                      <Typography className="font-semibold text-lg mb-4">{currentShow.title}</Typography>
                      <Typography className="text-sm text-gray-600 mb-4">{currentShow.type}</Typography>
                      <Typography className="text-xs text-gray-500 flex items-center gap-4">
                        <FuseSvgIcon size={14}>heroicons-outline:clock</FuseSvgIcon>
                        {formatTime(currentShow.scheduledStartTime)} - {formatTime(currentShow.scheduledEndTime)}
                      </Typography>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:music-note</FuseSvgIcon>
                    <Typography className="text-gray-400">No show currently playing</Typography>
                  </div>
                )}
                {nextShow && (
                  <div className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                    <Typography className="text-sm font-semibold">Up Next:</Typography>
                    <Typography className="text-sm">{nextShow.title}</Typography>
                    <Typography className="text-xs text-gray-500">{formatTime(nextShow.scheduledStartTime)}</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Channel Details */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b flex items-center justify-between">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:information-circle</FuseSvgIcon>
                  Channel Details
                </Typography>
                <Button size="small" startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>}>
                  Edit
                </Button>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-2 gap-16 mb-16">
                  <div>
                    <Typography className="text-xs text-gray-500 mb-4">Language</Typography>
                    <Typography className="text-sm font-semibold">{channel?.language || 'Not Set'}</Typography>
                  </div>
                  <div>
                    <Typography className="text-xs text-gray-500 mb-4">Category</Typography>
                    <Typography className="text-sm font-semibold">{formatCategory(channel?.category)}</Typography>
                  </div>
                  <div>
                    <Typography className="text-xs text-gray-500 mb-4">Streams</Typography>
                    <Typography className="text-sm font-semibold">{channel?.streams?.length || 0} Active</Typography>
                  </div>
                  <div>
                    <Typography className="text-xs text-gray-500 mb-4">Created</Typography>
                    <Typography className="text-sm font-semibold">{formatDate(channel?.createdAt)}</Typography>
                  </div>
                </div>
                {channel?.description && (
                  <div>
                    <Typography className="text-xs text-gray-500 mb-4">Description</Typography>
                    <Typography className="text-sm">{channel.description}</Typography>
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
                  <FuseSvgIcon color="warning">heroicons-outline:lightning-bolt</FuseSvgIcon>
                  Quick Actions
                </Typography>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-2 gap-12">
                  <Button 
                    variant="outlined" 
                    className="flex-col h-80 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/shows')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:calendar-add</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">Add Show</Typography>
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="flex-col h-80 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/performers')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:user-add</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">Add Host</Typography>
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="flex-col h-80 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/guests')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:user-group</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">Add Guest</Typography>
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="flex-col h-80 bg-cyan-100 text-cyan-700 hover:bg-cyan-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/analytics')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:chart-bar</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">Analytics</Typography>
                  </Button>
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Shows */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b flex items-center justify-between">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:microphone</FuseSvgIcon>
                  Recent Shows
                </Typography>
                <Button size="small" onClick={() => navigate('/station-owner/shows')}>View All</Button>
              </div>
              <div className="p-20">
                {topShows.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {topShows.map((show) => (
                      <div key={show.id} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                        <div className="flex-1">
                          <Typography className="text-sm font-semibold mb-4">{show.title}</Typography>
                          <div className="flex items-center gap-8">
                            <Chip label={show.type} size="small" className="h-20 text-xs" />
                            {show.hostIds?.length > 0 && (
                              <Typography className="text-xs text-gray-500 flex items-center gap-4">
                                <FuseSvgIcon size={12}>heroicons-outline:user</FuseSvgIcon>
                                {show.hostIds.length}
                              </Typography>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={32} className="mb-8 text-gray-400">heroicons-outline:microphone</FuseSvgIcon>
                    <Typography className="text-sm text-gray-400 mb-12">No shows yet</Typography>
                    <Button size="small" variant="outlined" onClick={() => navigate('/station-owner/shows')}>
                      Create First Show
                    </Button>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Top Hosts */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b flex items-center justify-between">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="success">heroicons-outline:user</FuseSvgIcon>
                  Top Hosts
                </Typography>
                <Button size="small" onClick={() => navigate('/station-owner/performers')}>View All</Button>
              </div>
              <div className="p-20">
                {topHosts.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {topHosts.map((host) => (
                      <div key={host.id} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-green-500 text-white text-xs font-bold">
                          {getInitials(host.stageName)}
                        </div>
                        <div className="flex-1">
                          <Typography className="text-sm font-semibold">{host.stageName}</Typography>
                          <Typography className="text-xs text-gray-500">{host.hostRoleType}</Typography>
                        </div>
                        <div className="flex items-center gap-4">
                          <FuseSvgIcon size={14} className="text-yellow-500">heroicons-solid:star</FuseSvgIcon>
                          <Typography className="text-sm font-bold">{(Number(host.overallRating) || 0).toFixed(1)}</Typography>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={32} className="mb-8 text-gray-400">heroicons-outline:user</FuseSvgIcon>
                    <Typography className="text-sm text-gray-400 mb-12">No hosts yet</Typography>
                    <Button size="small" variant="outlined" onClick={() => navigate('/station-owner/performers')}>
                      Add Host
                    </Button>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Top Guests */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b flex items-center justify-between">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="secondary">heroicons-outline:users</FuseSvgIcon>
                  Top Guests
                </Typography>
                <Button size="small" onClick={() => navigate('/station-owner/guests')}>View All</Button>
              </div>
              <div className="p-20">
                {topGuests.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {topGuests.map((guest) => (
                      <div key={guest.id} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                        <div className="flex items-center justify-center w-32 h-32 rounded-full bg-purple-500 text-white text-xs font-bold">
                          {getInitials(guest.displayName || `${guest.firstName} ${guest.lastName}`)}
                        </div>
                        <div className="flex-1">
                          <Typography className="text-sm font-semibold">{guest.displayName || `${guest.firstName} ${guest.lastName}`}</Typography>
                          <Typography className="text-xs text-gray-500">{guest.guestType}</Typography>
                        </div>
                        <Typography className="text-xs text-gray-500">{guest.totalAppearances} shows</Typography>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={32} className="mb-8 text-gray-400">heroicons-outline:users</FuseSvgIcon>
                    <Typography className="text-sm text-gray-400 mb-12">No guests yet</Typography>
                    <Button size="small" variant="outlined" onClick={() => navigate('/station-owner/guests')}>
                      Add Guest
                    </Button>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>
      </div>

      {/* Create Channel Dialog */}
      <Dialog 
        open={openCreateDialog}
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          className: "rounded-16",
          style: { zIndex: 9999 }
        }}
        style={{ zIndex: 9999 }}
      >
        <DialogTitle className="text-xl font-bold">
          <div className="flex items-center gap-8">
            <FuseSvgIcon color="info">heroicons-outline:plus-circle</FuseSvgIcon>
            Create New Channel
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-16 mt-16">
            <TextField
              label="Channel Name"
              value={channelFormData.name}
              onChange={(e) => setChannelFormData({ ...channelFormData, name: e.target.value })}
              fullWidth
              required
              helperText="e.g., FM Islamabad, Radio Pakistan"
            />
            <div className="grid grid-cols-2 gap-16">
              <TextField
                label="Call Sign"
                value={channelFormData.callSign}
                onChange={(e) => setChannelFormData({ ...channelFormData, callSign: e.target.value })}
                fullWidth
                required
                helperText="e.g., URDU-FM, PK-101"
              />
              <TextField
                label="Frequency"
                value={channelFormData.frequency}
                onChange={(e) => setChannelFormData({ ...channelFormData, frequency: e.target.value })}
                fullWidth
                helperText="e.g., 92.4 MHz"
              />
            </div>
            <div className="grid grid-cols-2 gap-16">
              <TextField
                label="City"
                value={channelFormData.city}
                onChange={(e) => setChannelFormData({ ...channelFormData, city: e.target.value })}
                fullWidth
                helperText="e.g., Islamabad, Karachi"
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={channelFormData.category}
                  onChange={(e) => setChannelFormData({ ...channelFormData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="music">Music</MenuItem>
                  <MenuItem value="talk">Talk</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="religious">Religious</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="mixed">Mixed</MenuItem>
                  <MenuItem value="educational">Educational</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                </Select>
              </FormControl>
            </div>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={channelFormData.language}
                onChange={(e) => setChannelFormData({ ...channelFormData, language: e.target.value })}
                label="Language"
              >
                <MenuItem value="urdu">Urdu</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="punjabi">Punjabi</MenuItem>
                <MenuItem value="sindhi">Sindhi</MenuItem>
                <MenuItem value="pashto">Pashto</MenuItem>
                <MenuItem value="balochi">Balochi</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={channelFormData.description}
              onChange={(e) => setChannelFormData({ ...channelFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Brief description of your channel"
            />
          </div>
        </DialogContent>
        <DialogActions className="p-16">
          <Button onClick={handleCloseDialog} className="text-gray-600">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="info" 
            onClick={handleSubmitChannel}
            startIcon={<FuseSvgIcon className="text-white">heroicons-outline:check</FuseSvgIcon>}
          >
            Create Channel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MyChannelPage;
