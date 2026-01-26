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

function PerformersPage() {
  console.log('PerformersPage component loaded');
  
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [allPerformers, setAllPerformers] = useState([]);
  const [filteredPerformers, setFilteredPerformers] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    stageName: '',
    type: 'host',
    hostRoleType: 'primary_host',
    hostSpecialty: 'music',
    experienceYears: 0
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
    loadAllPerformers();
  }, []);

  useEffect(() => {
    filterPerformers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, roleFilter, specialtyFilter, allPerformers]);

  const loadAllPerformers = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        console.warn('No auth token found, using mock data');
        loadMockData();
        return;
      }

      console.log('Loading performers from API...');
      const { data } = await axios.get(`${API_URL}/persons`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });
      
      console.log('Loaded performers:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setAllPerformers(data);
        updateTopPerformers(data);
      } else {
        console.warn('No performers returned from API, using mock data');
        loadMockData();
      }
    } catch (error) {
      console.error('Error loading performers:', error.message);
      console.warn('Falling back to mock data');
      loadMockData();
    }
  };

  const loadMockData = () => {
    const mockData = [
      { 
        id: '1', 
        stageName: 'DJ Mike', 
        firstName: 'Michael', 
        lastName: 'Johnson', 
        hostRoleType: 'dj_music', 
        hostSpecialty: 'music', 
        experienceYears: 5, 
        overallRating: 4.8, 
        totalShows: 120 
      },
      { 
        id: '2', 
        stageName: 'Sarah Host', 
        firstName: 'Sarah', 
        lastName: 'Williams', 
        hostRoleType: 'primary_host', 
        hostSpecialty: 'talk', 
        experienceYears: 8, 
        overallRating: 4.9, 
        totalShows: 200 
      },
      { 
        id: '3', 
        stageName: 'Radio Tom', 
        firstName: 'Thomas', 
        lastName: 'Brown', 
        hostRoleType: 'announcer', 
        hostSpecialty: 'sports', 
        experienceYears: 3, 
        overallRating: 4.5, 
        totalShows: 85 
      },
      { 
        id: '4', 
        stageName: 'News Anchor Jane', 
        firstName: 'Jane', 
        lastName: 'Smith', 
        hostRoleType: 'anchor', 
        hostSpecialty: 'news', 
        experienceYears: 10, 
        overallRating: 4.7, 
        totalShows: 300 
      },
      { 
        id: '5', 
        stageName: 'Podcast Pete', 
        firstName: 'Peter', 
        lastName: 'Davis', 
        hostRoleType: 'podcaster', 
        hostSpecialty: 'entertainment', 
        experienceYears: 2, 
        overallRating: 4.3, 
        totalShows: 50 
      },
    ];
    setAllPerformers(mockData);
    updateTopPerformers(mockData);
  };

  const updateTopPerformers = (performers) => {
    const sorted = [...performers]
      .sort((a, b) => (Number(b.overallRating) || 0) - (Number(a.overallRating) || 0))
      .slice(0, 5);
    setTopPerformers(sorted);
  };

  const filterPerformers = () => {
    const filtered = allPerformers.filter((performer) => {
      const matchesSearch = !searchQuery || 
        performer.stageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${performer.firstName} ${performer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || performer.hostRoleType === roleFilter;
      const matchesSpecialty = !specialtyFilter || performer.hostSpecialty === specialtyFilter;
      return matchesSearch && matchesRole && matchesSpecialty;
    });
    setFilteredPerformers(filtered);
  };

  const handleCreatePerformer = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.stageName) {
      alert('Please fill in all required fields (First Name, Last Name, Stage Name)');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      console.log('Creating performer with data:', formData);

      const response = await axios.post(`${API_URL}/persons`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      console.log('Performer created successfully:', response.data);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        stageName: '',
        type: 'host',
        hostRoleType: 'primary_host',
        hostSpecialty: 'music',
        experienceYears: 0
      });

      handleCloseDialog();
      loadAllPerformers();
      alert('Host created successfully!');
    } catch (error) {
      console.error('Error creating performer:', error);
      if (error.response) {
        alert(`Failed to create host: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        alert('Failed to create host: No response from server. Please check your connection.');
      } else {
        alert('Failed to create host. Please try again.');
      }
    }
  };

  const handleDeletePerformer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this host?')) return;

    try {
      const token = localStorage.getItem('jwt_access_token');
      if (!token) {
        alert('Authentication required');
        return;
      }

      await axios.delete(`${API_URL}/persons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      });

      loadAllPerformers();
      alert('Host deleted successfully!');
    } catch (error) {
      console.error('Error deleting performer:', error);
      alert('Failed to delete host. Please try again.');
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2) || 'P';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'primary_host': 'Primary Host',
      'co_host': 'Co-Host',
      'dj_music': 'DJ Music',
      'anchor': 'Anchor',
      'moderator': 'Moderator',
      'narrator': 'Narrator',
      'announcer': 'Announcer',
      'presenter': 'Presenter',
      'storyteller': 'Storyteller',
      'podcaster': 'Podcaster'
    };
    return labels[role] || role;
  };

  const getSpecialtyLabel = (specialty) => {
    const labels = {
      'music': 'Music',
      'talk': 'Talk',
      'news': 'News',
      'religious': 'Religious',
      'sports': 'Sports',
      'health': 'Health',
      'education': 'Education',
      'entertainment': 'Entertainment',
      'community': 'Community'
    };
    return labels[specialty] || specialty;
  };

  const getRoleColor = (role) => {
    if (role === 'primary_host') return 'bg-green-100 text-green-700';
    if (role === 'dj_music') return 'bg-purple-100 text-purple-700';
    if (role === 'announcer') return 'bg-orange-100 text-orange-700';
    if (role === 'anchor') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getAvatarColor = (role) => {
    if (role === 'primary_host') return 'bg-green-500';
    if (role === 'dj_music') return 'bg-purple-500';
    if (role === 'announcer') return 'bg-orange-500';
    if (role === 'anchor') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getTotalHosts = () => allPerformers.length;
  const getPrimaryHosts = () => allPerformers.filter(p => p.hostRoleType === 'primary_host').length;
  const getDJs = () => allPerformers.filter(p => p.hostRoleType === 'dj_music').length;
  const getTotalShows = () => allPerformers.reduce((sum, p) => sum + (p.totalShows || 0), 0);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-green-800 to-green-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="success">
                heroicons-outline:user-group
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Hosts Management</Typography>
                {getTotalHosts() > 0 && (
                  <Chip label={`${getTotalHosts()} Hosts`} size="small" className="bg-white/20 text-white font-bold" />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:star</FuseSvgIcon>
                  {allPerformers.filter(p => (Number(p.overallRating) || 0) >= 4.5).length} Top Rated
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:microphone</FuseSvgIcon>
                  {getTotalShows()} Total Shows
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button 
              variant="contained" 
              className="bg-white text-green-800 hover:bg-gray-100" 
              startIcon={<FuseSvgIcon color="success">heroicons-outline:plus</FuseSvgIcon>}
              onClick={handleOpenDialog}
            >
              Add New Host
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:user-group', label: 'Total Hosts', value: getTotalHosts(), color: 'from-green-800 to-green-900' },
          { icon: 'heroicons-outline:microphone', label: 'Primary Hosts', value: getPrimaryHosts(), color: 'from-blue-600 to-blue-700' },
          { icon: 'heroicons-outline:music-note', label: 'DJs', value: getDJs(), color: 'from-purple-600 to-purple-700' },
          { icon: 'heroicons-outline:radio', label: 'Total Shows', value: getTotalShows(), color: 'from-orange-600 to-orange-700' },
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
                  placeholder="Search hosts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  className="flex-1"
                  InputProps={{
                    startAdornment: <FuseSvgIcon size={20} className="mr-8 text-gray-600">heroicons-outline:search</FuseSvgIcon>,
                  }}
                />
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} size="small" displayEmpty className="min-w-160">
                  <MenuItem value="">All Role Types</MenuItem>
                  <MenuItem value="primary_host">Primary Host</MenuItem>
                  <MenuItem value="co_host">Co-Host</MenuItem>
                  <MenuItem value="dj_music">DJ Music</MenuItem>
                  <MenuItem value="anchor">Anchor</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                  <MenuItem value="narrator">Narrator</MenuItem>
                  <MenuItem value="announcer">Announcer</MenuItem>
                  <MenuItem value="presenter">Presenter</MenuItem>
                  <MenuItem value="storyteller">Storyteller</MenuItem>
                  <MenuItem value="podcaster">Podcaster</MenuItem>
                </Select>
                <Select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Specialties</MenuItem>
                  <MenuItem value="music">Music</MenuItem>
                  <MenuItem value="talk">Talk</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="religious">Religious</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="entertainment">Entertainment</MenuItem>
                  <MenuItem value="community">Community</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Hosts List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="success">heroicons-outline:view-list</FuseSvgIcon>
                  All Hosts
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredPerformers.length} results</Typography>
              </div>
              <div className="p-20">
                {filteredPerformers.length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {filteredPerformers.map((performer) => (
                      <div key={performer.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-16 p-16 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                        <Avatar className={`w-48 h-48 ${getAvatarColor(performer.hostRoleType)} text-white font-bold`}>
                          {getInitials(performer.stageName)}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <Typography className="font-semibold mb-4">{performer.stageName}</Typography>
                          <Typography className="text-sm text-gray-600 mb-8">
                            {performer.firstName} {performer.lastName}
                          </Typography>
                          <div className="flex flex-wrap gap-8 items-center">
                            <Chip 
                              label={getRoleLabel(performer.hostRoleType)} 
                              size="small" 
                              className={`${getRoleColor(performer.hostRoleType)} h-20 text-xs font-semibold`} 
                            />
                            {performer.hostSpecialty && (
                              <Chip 
                                label={getSpecialtyLabel(performer.hostSpecialty)} 
                                size="small" 
                                variant="outlined"
                                className="h-20 text-xs"
                              />
                            )}
                            <Typography className="text-xs text-gray-600">
                              {performer.experienceYears} years exp
                            </Typography>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center gap-4">
                            <FuseSvgIcon size={16} className="text-yellow-500">heroicons-solid:star</FuseSvgIcon>
                            <Typography className="font-bold">{(Number(performer.overallRating) || 0).toFixed(1)}</Typography>
                          </div>
                          {performer.totalShows && (
                            <Typography className="text-xs text-gray-500">{performer.totalShows} shows</Typography>
                          )}
                        </div>
                        <div className="flex gap-4">
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
                            className="bg-green-100 hover:bg-green-600 text-green-600 hover:text-white" 
                            title="Assign to Show"
                            onClick={() => navigate('/station-owner/shows')}
                          >
                            <FuseSvgIcon size={16}>heroicons-outline:microphone</FuseSvgIcon>
                          </IconButton>
                          <IconButton 
                            size="small" 
                            className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white" 
                            title="Delete"
                            onClick={() => handleDeletePerformer(performer.id)}
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
                    <Typography className="text-gray-400 mb-16">No hosts found</Typography>
                    <Button 
                      variant="contained" 
                      color="success"
                      startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
                      onClick={handleOpenDialog}
                    >
                      Add Your First Host
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
                    className="flex-col h-80 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white border-0" 
                    fullWidth
                    onClick={handleOpenDialog}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:user-add</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">Add Host</Typography>
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
                    className="flex-col h-80 bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white border-0" 
                    fullWidth
                    onClick={() => navigate('/station-owner/guests')}
                  >
                    <FuseSvgIcon size={24} className="mb-4">heroicons-outline:users</FuseSvgIcon>
                    <Typography className="text-xs font-semibold">View Guests</Typography>
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

          {/* Top Hosts */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="warning">heroicons-outline:star</FuseSvgIcon>
                  Top Hosts
                </Typography>
              </div>
              <div className="p-20">
                {topPerformers.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {topPerformers.map((host, index) => {
                      let rankColor = 'bg-gray-500';
                      if (index === 0) rankColor = 'bg-yellow-500';
                      else if (index === 1) rankColor = 'bg-gray-400';
                      else if (index === 2) rankColor = 'bg-orange-600';
                      
                      return (
                        <div key={host.id} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                          <Avatar className={`w-32 h-32 text-white text-xs font-bold ${rankColor}`}>
                            {index + 1}
                          </Avatar>
                          <Avatar className={`w-32 h-32 ${getAvatarColor(host.hostRoleType)} text-white text-xs font-bold`}>
                            {getInitials(host.stageName)}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Typography className="text-sm font-semibold truncate">{host.stageName}</Typography>
                            <Typography className="text-xs text-gray-600">{getRoleLabel(host.hostRoleType)}</Typography>
                          </div>
                          <div className="flex items-center gap-4">
                            <FuseSvgIcon size={14} className="text-yellow-500">heroicons-solid:star</FuseSvgIcon>
                            <Typography className="text-sm font-bold">{(Number(host.overallRating) || 0).toFixed(1)}</Typography>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Typography className="text-sm text-gray-400">No hosts yet</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Hosts by Role */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:chart-pie</FuseSvgIcon>
                  Hosts by Role
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Primary Hosts', value: getPrimaryHosts(), color: 'bg-green-500' },
                    { label: 'DJs', value: getDJs(), color: 'bg-purple-500' },
                    { label: 'Announcers', value: allPerformers.filter(p => p.hostRoleType === 'announcer').length, color: 'bg-orange-500' },
                  ].map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center gap-8">
                        <div className={`w-10 h-10 rounded-4 ${dist.color}`} />
                        <Typography className="text-sm">{dist.label}</Typography>
                      </div>
                      <Typography className="text-lg font-bold text-green-800">{dist.value}</Typography>
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
            <FuseSvgIcon color="success">heroicons-outline:user-add</FuseSvgIcon>
            Add New Host
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
              label="Stage Name"
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              fullWidth
              required
              helperText="The name that will be displayed on air"
            />
            <FormControl fullWidth>
              <InputLabel>Role Type</InputLabel>
              <Select
                value={formData.hostRoleType}
                onChange={(e) => setFormData({ ...formData, hostRoleType: e.target.value })}
                label="Role Type"
              >
                <MenuItem value="primary_host">Primary Host</MenuItem>
                <MenuItem value="co_host">Co-Host</MenuItem>
                <MenuItem value="dj_music">DJ Music</MenuItem>
                <MenuItem value="anchor">Anchor</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="narrator">Narrator</MenuItem>
                <MenuItem value="announcer">Announcer</MenuItem>
                <MenuItem value="presenter">Presenter</MenuItem>
                <MenuItem value="storyteller">Storyteller</MenuItem>
                <MenuItem value="podcaster">Podcaster</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={formData.hostSpecialty}
                onChange={(e) => setFormData({ ...formData, hostSpecialty: e.target.value })}
                label="Specialty"
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
              </Select>
            </FormControl>
            <TextField
              label="Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) || 0 })}
              fullWidth
              inputProps={{ min: 0, max: 50 }}
            />
          </div>
        </DialogContent>
        <DialogActions className="p-16">
          <Button onClick={handleCloseDialog} className="text-gray-600">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleCreatePerformer}
            startIcon={<FuseSvgIcon className="text-white">heroicons-outline:check</FuseSvgIcon>}
          >
            Create Host
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PerformersPage;
