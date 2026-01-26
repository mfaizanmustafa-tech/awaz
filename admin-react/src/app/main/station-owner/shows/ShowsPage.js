import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function ShowsPage() {
  console.log('ShowsPage component loaded');
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [allShows, setAllShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Available performers and guests for selection
  const [availablePerformers, setAvailablePerformers] = useState([]);
  const [availableGuests, setAvailableGuests] = useState([]);
  
  // Selected hosts and guests for the new show
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    type: 'music',
    contentCategory: 'music',
    scheduleType: 'regular',
    status: 'scheduled'
  });

  const handleOpenDialog = () => {
    console.log('Opening dialog...');
    loadPerformers();
    loadGuests();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog...');
    setSelectedHosts([]);
    setSelectedGuests([]);
    setOpenDialog(false);
  };

  const loadPerformers = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) return;

      const { data } = await axios.get(`${API_URL}/persons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Loaded performers:', data);
      setAvailablePerformers(data || []);
    } catch (error) {
      console.error('Error loading performers:', error);
      setAvailablePerformers([]);
    }
  };

  const loadGuests = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) return;

      const { data } = await axios.get(`${API_URL}/guests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Loaded guests:', data);
      setAvailableGuests(data || []);
    } catch (error) {
      console.error('Error loading guests:', error);
      setAvailableGuests([]);
    }
  };

  const handleAddHost = (hostId) => {
    if (hostId && !selectedHosts.includes(hostId)) {
      setSelectedHosts([...selectedHosts, hostId]);
    }
  };

  const handleRemoveHost = (hostId) => {
    setSelectedHosts(selectedHosts.filter(id => id !== hostId));
  };

  const handleAddGuest = (guestId) => {
    if (guestId && !selectedGuests.includes(guestId)) {
      setSelectedGuests([...selectedGuests, guestId]);
    }
  };

  const handleRemoveGuest = (guestId) => {
    setSelectedGuests(selectedGuests.filter(id => id !== guestId));
  };

  useEffect(() => {
    loadAllShows();
  }, []);

  useEffect(() => {
    filterShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, typeFilter, allShows]);

  const loadAllShows = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        console.warn('No auth token found, using mock data');
        loadMockData();
        return;
      }

      console.log('Loading shows from API...');
      const { data } = await axios.get(`${API_URL}/shows`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      console.log('Loaded shows:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setAllShows(data);
      } else {
        console.warn('No shows returned from API, using mock data');
        loadMockData();
      }
    } catch (error) {
      console.error('Error loading shows:', error.message);
      console.warn('Falling back to mock data');
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockData = [
      { 
        id: '1', 
        title: 'Morning Vibes',
        shortDescription: 'Start your day with great music and positive energy',
        type: 'music', 
        contentCategory: 'music',
        scheduleType: 'regular',
        status: 'live',
        scheduledStartTime: new Date().toISOString(),
        hostIds: ['1', '2'],
        guestIds: [],
        viewCount: 1250
      },
      { 
        id: '2', 
        title: 'Evening Talk',
        shortDescription: 'Discussing today\'s hot topics with expert guests',
        type: 'talk', 
        contentCategory: 'talk',
        scheduleType: 'regular',
        status: 'scheduled',
        scheduledStartTime: new Date(Date.now() + 3600000).toISOString(),
        hostIds: ['1'],
        guestIds: ['1', '2'],
        viewCount: 850
      },
      { 
        id: '3', 
        title: 'Sports Hour',
        shortDescription: 'Latest sports news and analysis',
        type: 'sports', 
        contentCategory: 'sports',
        scheduleType: 'regular',
        status: 'completed',
        scheduledStartTime: new Date(Date.now() - 7200000).toISOString(),
        hostIds: ['2'],
        guestIds: ['3'],
        viewCount: 2100
      },
      { 
        id: '4', 
        title: 'Religious Insights',
        shortDescription: 'Islamic teachings and spiritual guidance',
        type: 'religious', 
        contentCategory: 'religious',
        scheduleType: 'regular',
        status: 'scheduled',
        scheduledStartTime: new Date(Date.now() + 7200000).toISOString(),
        hostIds: ['3'],
        guestIds: ['2'],
        viewCount: 1500
      },
      { 
        id: '5', 
        title: 'Weekend Podcast',
        shortDescription: 'Casual conversations about life and culture',
        type: 'podcast', 
        contentCategory: 'entertainment',
        scheduleType: 'irregular',
        status: 'scheduled',
        scheduledStartTime: new Date(Date.now() + 86400000).toISOString(),
        hostIds: ['1'],
        guestIds: ['4', '5'],
        viewCount: 950
      },
    ];
    setAllShows(mockData);
  };

  const filterShows = () => {
    const filtered = allShows.filter((show) => {
      const matchesSearch = !searchQuery || 
        show.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || show.status === statusFilter;
      const matchesType = !typeFilter || show.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    setFilteredShows(filtered);
  };

  const handleCreateShow = async () => {
    if (!formData.title) {
      alert('Please fill in the title field');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // Prepare show data with hosts and guests
      const showData = {
        ...formData,
        hostIds: selectedHosts,
        guestIds: selectedGuests
      };

      console.log('Creating show with data:', showData);

      const response = await axios.post(`${API_URL}/shows`, showData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      console.log('Show created successfully:', response.data);

      // Reset form
      setFormData({
        title: '',
        shortDescription: '',
        type: 'music',
        contentCategory: 'music',
        scheduleType: 'regular',
        status: 'scheduled'
      });
      setSelectedHosts([]);
      setSelectedGuests([]);

      handleCloseDialog();
      await loadAllShows();
      alert(`Show "${response.data.title}" created successfully!`);
    } catch (error) {
      console.error('Error creating show:', error);
      if (error.response) {
        alert(`Failed to create show: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        alert('Failed to create show: No response from server. Please check your connection.');
      } else {
        alert(`Failed to create show: ${error.message}`);
      }
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      await axios.delete(`${API_URL}/shows/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      loadAllShows();
      alert('Show deleted successfully!');
    } catch (error) {
      console.error('Error deleting show:', error);
      alert('Failed to delete show. Please try again.');
    }
  };

  const getShowTypeLabel = (type) => {
    const labels = {
      'music': 'Music',
      'talk': 'Talk Show',
      'news': 'News',
      'sports': 'Sports',
      'comedy': 'Comedy',
      'educational': 'Educational',
      'religious': 'Religious',
      'call_in': 'Call-In',
      'live_event': 'Live Event',
      'podcast': 'Podcast',
      'documentary': 'Documentary'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    if (status === 'live') return 'bg-red-100 text-red-700';
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'cancelled') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getTypeColor = (type) => {
    if (type === 'music') return 'bg-purple-100 text-purple-700';
    if (type === 'talk') return 'bg-blue-100 text-blue-700';
    if (type === 'news') return 'bg-red-100 text-red-700';
    if (type === 'sports') return 'bg-orange-100 text-orange-700';
    if (type === 'religious') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'music': 'heroicons-outline:musical-note',
      'talk': 'heroicons-outline:chat',
      'news': 'heroicons-outline:newspaper',
      'sports': 'heroicons-outline:fire',
      'religious': 'heroicons-outline:book-open',
      'podcast': 'heroicons-outline:microphone',
      'documentary': 'heroicons-outline:film'
    };
    return icons[type] || 'heroicons-outline:microphone';
  };

  const getTotalShows = () => allShows.length;
  const getLiveShows = () => allShows.filter(s => s.status === 'live').length;
  const getScheduledShows = () => allShows.filter(s => s.status === 'scheduled').length;
  const getCompletedShows = () => allShows.filter(s => s.status === 'completed').length;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-blue-800 to-blue-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="primary">
                heroicons-outline:microphone
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Shows Management</Typography>
                {getLiveShows() > 0 && (
                  <Chip 
                    label={`${getLiveShows()} LIVE`} 
                    size="small" 
                    className="bg-red-500 text-white font-bold animate-pulse" 
                    icon={<span className="w-8 h-8 bg-white rounded-full animate-pulse" />}
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:calendar</FuseSvgIcon>
                  {getTotalShows()} Total Shows
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:clock</FuseSvgIcon>
                  {getScheduledShows()} Scheduled
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:check-circle</FuseSvgIcon>
                  {getCompletedShows()} Completed
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button 
              variant="contained" 
              className="bg-white text-blue-800 hover:bg-gray-100" 
              startIcon={<FuseSvgIcon color="primary">heroicons-outline:plus</FuseSvgIcon>}
              onClick={handleOpenDialog}
            >
              Add New Show
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:microphone', label: 'Total Shows', value: getTotalShows(), color: 'from-blue-800 to-blue-900' },
          { icon: 'heroicons-outline:signal', label: 'Live Now', value: getLiveShows(), color: 'from-red-600 to-red-700' },
          { icon: 'heroicons-outline:calendar', label: 'Scheduled', value: getScheduledShows(), color: 'from-cyan-600 to-cyan-700' },
          { icon: 'heroicons-outline:check-circle', label: 'Completed', value: getCompletedShows(), color: 'from-green-600 to-green-700' },
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
          {/* Search & Filters */}
          <motion.div variants={item}>
            <Paper className="p-16 rounded-16 shadow">
              <div className="flex flex-col sm:flex-row gap-12">
                <TextField
                  placeholder="Search shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  className="flex-1"
                  InputProps={{
                    startAdornment: <FuseSvgIcon size={20} className="mr-8 text-gray-600">heroicons-outline:search</FuseSvgIcon>,
                  }}
                />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="live">Live</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="music">Music</MenuItem>
                  <MenuItem value="talk">Talk Show</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="religious">Religious</MenuItem>
                  <MenuItem value="podcast">Podcast</MenuItem>
                  <MenuItem value="documentary">Documentary</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Shows List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:view-list</FuseSvgIcon>
                  All Shows
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredShows.length} results</Typography>
              </div>
              <div className="p-20">
                {filteredShows.length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {filteredShows.map((show) => (
                      <div 
                        key={show.id} 
                        className={`flex flex-col p-16 rounded-12 transition-colors ${
                          show.status === 'live' ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-16 mb-12">
                          <div className={`flex items-center justify-center w-48 h-48 rounded-12 ${getTypeColor(show.type)}`}>
                            <FuseSvgIcon size={24}>{getTypeIcon(show.type)}</FuseSvgIcon>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-8 mb-4">
                              <Typography className="font-semibold text-lg">{show.title}</Typography>
                              {show.status === 'live' && (
                                <Chip 
                                  label="LIVE" 
                                  size="small" 
                                  className="bg-red-500 text-white font-bold animate-pulse h-20" 
                                />
                              )}
                            </div>
                            {show.shortDescription && (
                              <Typography className="text-sm text-gray-600 mb-8">{show.shortDescription}</Typography>
                            )}
                            <div className="flex flex-wrap gap-8 items-center">
                              <Chip 
                                label={getShowTypeLabel(show.type)} 
                                size="small" 
                                className={`${getTypeColor(show.type)} h-20 text-xs font-semibold`} 
                              />
                              <Chip 
                                label={show.status.toUpperCase()} 
                                size="small" 
                                className={`${getStatusColor(show.status)} h-20 text-xs font-semibold`} 
                              />
                              {show.hostIds && show.hostIds.length > 0 && (
                                <Typography className="text-xs text-gray-600 flex items-center gap-4">
                                  <FuseSvgIcon size={14}>heroicons-outline:user</FuseSvgIcon>
                                  {show.hostIds.length} Host(s)
                                </Typography>
                              )}
                              {show.guestIds && show.guestIds.length > 0 && (
                                <Typography className="text-xs text-gray-600 flex items-center gap-4">
                                  <FuseSvgIcon size={14}>heroicons-outline:user-group</FuseSvgIcon>
                                  {show.guestIds.length} Guest(s)
                                </Typography>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-4">
                            <Typography className="text-xs text-gray-500">
                              {formatDateTime(show.scheduledStartTime)}
                            </Typography>
                            {show.viewCount && (
                              <Typography className="text-xs text-gray-500 flex items-center gap-4">
                                <FuseSvgIcon size={14}>heroicons-outline:eye</FuseSvgIcon>
                                {show.viewCount}
                              </Typography>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-8 justify-end">
                          {show.status === 'scheduled' && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success"
                              startIcon={<FuseSvgIcon size={16}>heroicons-outline:play</FuseSvgIcon>}
                            >
                              Start
                            </Button>
                          )}
                          {show.status === 'live' && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="error"
                              startIcon={<FuseSvgIcon size={16}>heroicons-outline:stop</FuseSvgIcon>}
                            >
                              End
                            </Button>
                          )}
                          <IconButton 
                            size="small" 
                            className="bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white" 
                            title="Analytics"
                            onClick={() => navigate('/station-owner/analytics')}
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:chart-bar</FuseSvgIcon>
                          </IconButton>
                          <IconButton 
                            size="small" 
                            className="bg-gray-100 hover:bg-gray-600 text-gray-600 hover:text-white" 
                            title="Edit"
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>
                          </IconButton>
                          <IconButton 
                            size="small" 
                            className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white" 
                            title="Delete"
                            onClick={() => handleDeleteShow(show.id)}
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:microphone</FuseSvgIcon>
                    <Typography className="text-gray-400 mb-16">No shows found</Typography>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                      onClick={handleOpenDialog}
                    >
                      Add Your First Show
                    </Button>
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
                    onClick={handleOpenDialog}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:plus-circle</FuseSvgIcon>
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

          {/* Shows by Type */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:chart-pie</FuseSvgIcon>
                  Shows by Type
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Music', value: allShows.filter(s => s.type === 'music').length, color: 'bg-purple-500' },
                    { label: 'Talk Shows', value: allShows.filter(s => s.type === 'talk').length, color: 'bg-blue-500' },
                    { label: 'Religious', value: allShows.filter(s => s.type === 'religious').length, color: 'bg-green-500' },
                  ].map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center gap-8">
                        <div className={`w-10 h-10 rounded-4 ${dist.color}`} />
                        <Typography className="text-sm">{dist.label}</Typography>
                      </div>
                      <Typography className="text-lg font-bold text-blue-800">{dist.value}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="action">heroicons-outline:clock</FuseSvgIcon>
                  Recent Activity
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { icon: 'heroicons-outline:microphone', text: 'New show created', time: '2 hours ago', color: 'bg-blue-100 text-blue-700' },
                    { icon: 'heroicons-outline:signal', text: 'Morning Show went live', time: '5 hours ago', color: 'bg-red-100 text-red-700' },
                    { icon: 'heroicons-outline:check-circle', text: 'Evening Talk completed', time: '1 day ago', color: 'bg-green-100 text-green-700' },
                    { icon: 'heroicons-outline:calendar', text: 'Weekend Special scheduled', time: '2 days ago', color: 'bg-cyan-100 text-cyan-700' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-12 p-12 bg-gray-50 rounded-8">
                      <div className={`flex items-center justify-center w-32 h-32 rounded-8 ${activity.color}`}>
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

      {/* Create Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          className: "rounded-16"
        }}
      >
        <DialogTitle className="text-xl font-bold">
          <div className="flex items-center gap-8">
            <FuseSvgIcon color="primary">heroicons-outline:plus-circle</FuseSvgIcon>
            Add New Show
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-16 mt-16">
            <TextField
              label="Show Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Short Description"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Brief description of the show"
            />
            <div className="grid grid-cols-2 gap-16">
              <FormControl fullWidth>
                <InputLabel>Show Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Show Type"
                >
                  <MenuItem value="music">Music</MenuItem>
                  <MenuItem value="talk">Talk Show</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="comedy">Comedy</MenuItem>
                  <MenuItem value="educational">Educational</MenuItem>
                  <MenuItem value="religious">Religious</MenuItem>
                  <MenuItem value="call_in">Call-In</MenuItem>
                  <MenuItem value="live_event">Live Event</MenuItem>
                  <MenuItem value="podcast">Podcast</MenuItem>
                  <MenuItem value="documentary">Documentary</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Content Category</InputLabel>
                <Select
                  value={formData.contentCategory}
                  onChange={(e) => setFormData({ ...formData, contentCategory: e.target.value })}
                  label="Content Category"
                >
                  <MenuItem value="music">Music</MenuItem>
                  <MenuItem value="talk">Talk</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="religious">Religious</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="community">Community</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={formData.scheduleType}
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                  label="Schedule Type"
                >
                  <MenuItem value="regular">Regular</MenuItem>
                  <MenuItem value="irregular">Irregular</MenuItem>
                  <MenuItem value="temporary">Temporary</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="live">Live</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Hosts Selection */}
            <div>
              <Typography className="text-sm font-semibold mb-8 text-gray-700">Hosts</Typography>
              <div className="flex gap-8 items-start">
                <FormControl fullWidth size="small">
                  <InputLabel>Select Host</InputLabel>
                  <Select
                    label="Select Host"
                    onChange={(e) => {
                      handleAddHost(e.target.value);
                      e.target.value = '';
                    }}
                    value=""
                  >
                    {availablePerformers
                      .filter(p => !selectedHosts.includes(p.id))
                      .map((performer) => (
                        <MenuItem key={performer.id} value={performer.id}>
                          {performer.stageName || `${performer.firstName} ${performer.lastName}`}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <IconButton 
                  size="small" 
                  className="bg-green-500 hover:bg-green-600 text-white mt-4"
                  onClick={() => navigate('/station-owner/performers')}
                  title="Add New Performer"
                >
                  <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                </IconButton>
              </div>
              {selectedHosts.length > 0 && (
                <div className="flex flex-wrap gap-8 mt-12">
                  {selectedHosts.map((hostId) => {
                    const host = availablePerformers.find(p => p.id === hostId);
                    return host ? (
                      <Chip
                        key={hostId}
                        label={host.stageName || `${host.firstName} ${host.lastName}`}
                        onDelete={() => handleRemoveHost(hostId)}
                        color="primary"
                        size="small"
                      />
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Guests Selection */}
            <div>
              <Typography className="text-sm font-semibold mb-8 text-gray-700">Guests</Typography>
              <div className="flex gap-8 items-start">
                <FormControl fullWidth size="small">
                  <InputLabel>Select Guest</InputLabel>
                  <Select
                    label="Select Guest"
                    onChange={(e) => {
                      handleAddGuest(e.target.value);
                      e.target.value = '';
                    }}
                    value=""
                  >
                    {availableGuests
                      .filter(g => !selectedGuests.includes(g.id))
                      .map((guest) => (
                        <MenuItem key={guest.id} value={guest.id}>
                          {guest.displayName || `${guest.firstName} ${guest.lastName}`}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <IconButton 
                  size="small" 
                  className="bg-green-500 hover:bg-green-600 text-white mt-4"
                  onClick={() => navigate('/station-owner/guests')}
                  title="Add New Guest"
                >
                  <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                </IconButton>
              </div>
              {selectedGuests.length > 0 && (
                <div className="flex flex-wrap gap-8 mt-12">
                  {selectedGuests.map((guestId) => {
                    const guest = availableGuests.find(g => g.id === guestId);
                    return guest ? (
                      <Chip
                        key={guestId}
                        label={guest.displayName || `${guest.firstName} ${guest.lastName}`}
                        onDelete={() => handleRemoveGuest(guestId)}
                        color="secondary"
                        size="small"
                      />
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              helperText="Detailed description of the show (optional)"
            />
          </div>
        </DialogContent>
        <DialogActions className="p-16">
          <Button onClick={handleCloseDialog} className="text-gray-600">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateShow}
            startIcon={<FuseSvgIcon className="text-white">heroicons-outline:check</FuseSvgIcon>}
          >
            Create Show
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ShowsPage;
