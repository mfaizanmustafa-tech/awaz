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
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function GuestsPage() {
  console.log('GuestsPage component loaded');
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [allGuests, setAllGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [topGuests, setTopGuests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    type: 'guest',
    guestType: 'expert',
    guestPurpose: 'interview',
    organization: '',
    designation: '',
    expertise: []
  });

  const handleOpenDialog = () => {
    console.log('Opening dialog...');
    setOpenDialog(true);
  };


  const handleCloseDialog = () => {
    console.log('Closing dialog...');
    setOpenDialog(false);
  };

  useEffect(() => {
    loadAllGuests();
  }, []);

  useEffect(() => {
    filterGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, typeFilter, purposeFilter, allGuests]);

  const loadAllGuests = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        console.error('❌ No auth token found! Please log in.');
        alert('Please log in to view guests');
        return;
      }

      console.log('🔄 Loading guests from API...');
      const { data } = await axios.get(`${API_URL}/guests/my-guests`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log('✅ API Response:', data);
      console.log(`📊 Number of guests: ${data?.length || 0}`);
      
      if (data && Array.isArray(data)) {
        setAllGuests(data);
        updateTopGuests(data);
        console.log(`✅ Successfully loaded ${data.length} guests from database`);
        
        if (data.length === 0) {
          console.warn('⚠️ No guests in database yet. Create your first guest!');
        }
      } else {
        console.error('❌ Invalid data format from API:', data);
        setAllGuests([]);
      }
    } catch (error) {
      console.error('❌ Error loading guests:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
      } else {
        alert(`Failed to load guests: ${error.response?.data?.message || error.message}`);
      }
      
      setAllGuests([]);
    }
  };

  const loadMockData = () => {
    console.warn('⚠️ Mock data is disabled. Please ensure backend is running and you are logged in.');
    setAllGuests([]);
    setTopGuests([]);
  };

  const updateTopGuests = (guests) => {
    const sorted = [...guests]
      .sort((a, b) => (b.totalAppearances || 0) - (a.totalAppearances || 0))
      .slice(0, 5);
    setTopGuests(sorted);
  };

  const filterGuests = () => {
    const filtered = allGuests.filter((guest) => {
      const matchesSearch = !searchQuery || 
        guest.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !typeFilter || guest.guestType === typeFilter;
      const matchesPurpose = !purposeFilter || guest.guestPurpose === purposeFilter;
      return matchesSearch && matchesType && matchesPurpose;
    });
    setFilteredGuests(filtered);
  };

  const handleCreateGuest = async () => {
    if (!formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields (First Name, Last Name)');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      console.log('Creating guest with data:', formData);

      const response = await axios.post(`${API_URL}/guests`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      console.log('Guest created successfully:', response.data);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        displayName: '',
        type: 'guest',
        guestType: 'expert',
        guestPurpose: 'interview',
        organization: '',
        designation: '',
        expertise: []
      });

      handleCloseDialog();
      
      // Reload guests immediately
      console.log('Reloading guests list...');
      await loadAllGuests();
      
      alert(`Guest "${response.data.displayName || `${response.data.firstName} ${response.data.lastName}`}" created successfully!`);
    } catch (error) {
      console.error('Error creating guest:', error);
      if (error.response) {
        alert(`Failed to create guest: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        alert('Failed to create guest: No response from server. Please check your connection.');
      } else {
        alert('Failed to create guest. Please try again.');
      }
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      await axios.delete(`${API_URL}/guests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      loadAllGuests();
      alert('Guest deleted successfully!');
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('Failed to delete guest. Please try again.');
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2) || 'G';
  };

  const getGuestTypeLabel = (type) => {
    const labels = {
      'celebrity': 'Celebrity',
      'expert': 'Expert',
      'religious_scholar': 'Religious Scholar',
      'politician': 'Politician',
      'artist': 'Artist',
      'musician': 'Musician',
      'entrepreneur': 'Entrepreneur',
      'social_worker': 'Social Worker',
      'public_official': 'Public Official',
      'community_member': 'Community Member',
      'caller': 'Caller',
      'anchor': 'Anchor',
      'intellectual': 'Intellectual'
    };
    return labels[type] || type;
  };

  const getGuestPurposeLabel = (purpose) => {
    const labels = {
      'interview': 'Interview',
      'discussion': 'Discussion',
      'debate': 'Debate',
      'promotion': 'Promotion',
      'advisory': 'Advisory',
      'awareness': 'Awareness',
      'emergency': 'Emergency',
      'performance': 'Performance'
    };
    return labels[purpose] || purpose;
  };

  const getTypeColor = (type) => {
    if (type === 'expert') return 'bg-blue-100 text-blue-700';
    if (type === 'celebrity') return 'bg-purple-100 text-purple-700';
    if (type === 'religious_scholar') return 'bg-green-100 text-green-700';
    if (type === 'musician') return 'bg-pink-100 text-pink-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getAvatarColor = (type) => {
    if (type === 'expert') return 'bg-blue-500';
    if (type === 'celebrity') return 'bg-purple-500';
    if (type === 'religious_scholar') return 'bg-green-500';
    if (type === 'musician') return 'bg-pink-500';
    return 'bg-gray-500';
  };

  const getTotalGuests = () => allGuests.length;
  const getExperts = () => allGuests.filter(g => g.guestType === 'expert').length;
  const getCelebrities = () => allGuests.filter(g => g.guestType === 'celebrity').length;
  const getTotalAppearances = () => allGuests.reduce((sum, g) => sum + (g.totalAppearances || 0), 0);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-purple-800 to-purple-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="secondary">
                heroicons-outline:user-group
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Guests Management</Typography>
                {getTotalGuests() > 0 && (
                  <Chip label={`${getTotalGuests()} Guests`} size="small" className="bg-white/20 text-white font-bold" />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:star</FuseSvgIcon>
                  {allGuests.filter(g => (Number(g.rating) || 0) >= 4.5).length} Top Rated
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:calendar</FuseSvgIcon>
                  {getTotalAppearances()} Total Appearances
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button 
              variant="outlined" 
              className="bg-white/10 text-white border-white/30 hover:bg-white/20" 
              startIcon={<FuseSvgIcon className="text-white">heroicons-outline:refresh</FuseSvgIcon>}
              onClick={loadAllGuests}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              className="bg-white text-purple-800 hover:bg-gray-100" 
              startIcon={<FuseSvgIcon color="secondary">heroicons-outline:plus</FuseSvgIcon>}
              onClick={handleOpenDialog}
            >
              Add New Guest
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:user-group', label: 'Total Guests', value: getTotalGuests(), color: 'from-purple-800 to-purple-900' },
          { icon: 'heroicons-outline:academic-cap', label: 'Experts', value: getExperts(), color: 'from-blue-600 to-blue-700' },
          { icon: 'heroicons-outline:star', label: 'Celebrities', value: getCelebrities(), color: 'from-pink-600 to-pink-700' },
          { icon: 'heroicons-outline:calendar', label: 'Appearances', value: getTotalAppearances(), color: 'from-orange-600 to-orange-700' },
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
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  className="flex-1"
                  InputProps={{
                    startAdornment: <FuseSvgIcon size={20} className="mr-8 text-gray-600">heroicons-outline:search</FuseSvgIcon>,
                  }}
                />
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="small" displayEmpty className="min-w-160">
                  <MenuItem value="">All Guest Types</MenuItem>
                  <MenuItem value="celebrity">Celebrity</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                  <MenuItem value="religious_scholar">Religious Scholar</MenuItem>
                  <MenuItem value="politician">Politician</MenuItem>
                  <MenuItem value="artist">Artist</MenuItem>
                  <MenuItem value="musician">Musician</MenuItem>
                  <MenuItem value="entrepreneur">Entrepreneur</MenuItem>
                  <MenuItem value="social_worker">Social Worker</MenuItem>
                  <MenuItem value="public_official">Public Official</MenuItem>
                  <MenuItem value="community_member">Community Member</MenuItem>
                  <MenuItem value="caller">Caller</MenuItem>
                  <MenuItem value="anchor">Anchor</MenuItem>
                  <MenuItem value="intellectual">Intellectual</MenuItem>
                </Select>
                <Select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Purposes</MenuItem>
                  <MenuItem value="interview">Interview</MenuItem>
                  <MenuItem value="discussion">Discussion</MenuItem>
                  <MenuItem value="debate">Debate</MenuItem>
                  <MenuItem value="promotion">Promotion</MenuItem>
                  <MenuItem value="advisory">Advisory</MenuItem>
                  <MenuItem value="awareness">Awareness</MenuItem>
                  <MenuItem value="emergency">Emergency</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Guests List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="secondary">heroicons-outline:view-list</FuseSvgIcon>
                  All Guests
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredGuests.length} results</Typography>
              </div>
              <div className="p-20">
                {filteredGuests.length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {filteredGuests.map((guest) => (
                      <div key={guest.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-16 p-16 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                        <Avatar className={`w-48 h-48 ${getAvatarColor(guest.guestType)} text-white font-bold`}>
                          {getInitials(guest.displayName || `${guest.firstName} ${guest.lastName}`)}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Typography className="font-semibold mb-4">{guest.displayName || `${guest.firstName} ${guest.lastName}`}</Typography>
                          {guest.organization && (
                            <Typography className="text-sm text-gray-600 mb-8">
                              {guest.designation ? `${guest.designation}, ` : ''}{guest.organization}
                            </Typography>
                          )}
                          <div className="flex flex-wrap gap-8 items-center">
                            <Chip 
                              label={getGuestTypeLabel(guest.guestType)} 
                              size="small" 
                              className={`${getTypeColor(guest.guestType)} h-20 text-xs font-semibold`} 
                            />
                            {guest.guestPurpose && (
                              <Chip 
                                label={getGuestPurposeLabel(guest.guestPurpose)} 
                                size="small" 
                                variant="outlined"
                                className="h-20 text-xs"
                              />
                            )}
                            <Typography className="text-xs text-gray-600">
                              {guest.totalAppearances || 0} appearances
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center gap-4">
                            <FuseSvgIcon size={16} className="text-yellow-500">heroicons-solid:star</FuseSvgIcon>
                            <Typography className="font-bold">{(Number(guest.rating) || 0).toFixed(1)}</Typography>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <IconButton 
                            size="small" 
                            className="bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white" 
                            title="History"
                            onClick={() => navigate('/station-owner/analytics')}
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:clock</FuseSvgIcon>
                          </IconButton>
                          <IconButton 
                            size="small" 
                            className="bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white" 
                            title="Invite to Show"
                            onClick={() => navigate('/station-owner/shows')}
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:microphone</FuseSvgIcon>
                          </IconButton>
                          <IconButton 
                            size="small" 
                            className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white" 
                            title="Delete"
                            onClick={() => handleDeleteGuest(guest.id)}
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:user-group</FuseSvgIcon>
                    <Typography className="text-gray-400 mb-16">No guests found</Typography>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                      onClick={handleOpenDialog}
                    >
                      Add Your First Guest
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
                    className="flex-col h-80 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white border-0" 
                    fullWidth
                    onClick={handleOpenDialog}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:user-add</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">Add Guest</Typography>
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="flex-col h-80 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/shows')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:microphone</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">View Shows</Typography>
                  </Button>
                  <Button 
                    variant="outlined" 
                    className="flex-col h-80 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/performers')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:user-group</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">View Hosts</Typography>
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

          {/* Top Guests */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="warning">heroicons-outline:star</FuseSvgIcon>
                  Top Guests
                </Typography>
              </div>
              <div className="p-20">
                {topGuests.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {topGuests.map((guest, index) => {
                      let rankColor = 'bg-gray-500';
                      if (index === 0) rankColor = 'bg-yellow-500';
                      else if (index === 1) rankColor = 'bg-gray-400';
                      else if (index === 2) rankColor = 'bg-orange-600';
                      
                      return (
                        <div key={guest.id} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                          <Avatar className={`w-32 h-32 text-white text-xs font-bold ${rankColor}`}>
                            {index + 1}
                          </Avatar>
                          <Avatar className={`w-32 h-32 ${getAvatarColor(guest.guestType)} text-white text-xs font-bold`}>
                            {getInitials(guest.displayName || `${guest.firstName} ${guest.lastName}`)}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Typography className="text-sm font-semibold truncate">{guest.displayName || `${guest.firstName} ${guest.lastName}`}</Typography>
                            <Typography className="text-xs text-gray-600">{getGuestTypeLabel(guest.guestType)}</Typography>
                          </div>
                          <div className="flex flex-col items-end">
                            <Typography className="text-sm font-bold">{guest.totalAppearances || 0}</Typography>
                            <Typography className="text-xs text-gray-500">shows</Typography>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Typography className="text-sm text-gray-400">No guests yet</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Guests by Type */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:chart-pie</FuseSvgIcon>
                  Guests by Type
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Experts', value: getExperts(), color: 'bg-blue-500' },
                    { label: 'Celebrities', value: getCelebrities(), color: 'bg-purple-500' },
                    { label: 'Religious Scholars', value: allGuests.filter(g => g.guestType === 'religious_scholar').length, color: 'bg-green-500' },
                  ].map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center gap-8">
                        <div className={`w-10 h-10 rounded-4 ${dist.color}`} />
                        <Typography className="text-sm">{dist.label}</Typography>
                      </div>
                      <Typography className="text-lg font-bold text-purple-800">{dist.value}</Typography>
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
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          className: "rounded-16"
        }}
      >
        <DialogTitle className="text-xl font-bold">
          <div className="flex items-center gap-8">
            <FuseSvgIcon color="secondary">heroicons-outline:user-add</FuseSvgIcon>
            Add New Guest
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-16 mt-16">
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              fullWidth
              helperText="The name that will be displayed (optional)"
            />
            <FormControl fullWidth>
              <InputLabel>Guest Type</InputLabel>
              <Select
                value={formData.guestType}
                onChange={(e) => setFormData({ ...formData, guestType: e.target.value })}
                label="Guest Type"
              >
                <MenuItem value="celebrity">Celebrity</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
                <MenuItem value="religious_scholar">Religious Scholar</MenuItem>
                <MenuItem value="politician">Politician</MenuItem>
                <MenuItem value="artist">Artist</MenuItem>
                <MenuItem value="musician">Musician</MenuItem>
                <MenuItem value="entrepreneur">Entrepreneur</MenuItem>
                <MenuItem value="social_worker">Social Worker</MenuItem>
                <MenuItem value="public_official">Public Official</MenuItem>
                <MenuItem value="community_member">Community Member</MenuItem>
                <MenuItem value="caller">Caller</MenuItem>
                <MenuItem value="anchor">Anchor</MenuItem>
                <MenuItem value="intellectual">Intellectual</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Purpose</InputLabel>
              <Select
                value={formData.guestPurpose}
                onChange={(e) => setFormData({ ...formData, guestPurpose: e.target.value })}
                label="Purpose"
              >
                <MenuItem value="interview">Interview</MenuItem>
                <MenuItem value="discussion">Discussion</MenuItem>
                <MenuItem value="debate">Debate</MenuItem>
                <MenuItem value="promotion">Promotion</MenuItem>
                <MenuItem value="advisory">Advisory</MenuItem>
                <MenuItem value="awareness">Awareness</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
                <MenuItem value="performance">Performance</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              fullWidth
            />
            <TextField
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions className="p-16">
          <Button onClick={handleCloseDialog} className="text-gray-600">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleCreateGuest}
            startIcon={<FuseSvgIcon className="text-white">heroicons-outline:check</FuseSvgIcon>}
          >
            Create Guest
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default GuestsPage;
