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
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function StationsPage() {
  const [allChannels, setAllChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [pendingChannels, setPendingChannels] = useState([]);
  const [topStations, setTopStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categoryBreakdown = [
    { name: 'Music', count: 10, percentage: 40, color: '#3b82f6' },
    { name: 'Talk', count: 6, percentage: 24, color: '#8b5cf6' },
    { name: 'News', count: 4, percentage: 16, color: '#22c55e' },
    { name: 'Sports', count: 3, percentage: 12, color: '#f59e0b' },
    { name: 'Religious', count: 2, percentage: 8, color: '#ef4444' },
  ];

  useEffect(() => {
    loadAllStations();
    loadPendingStations();
  }, []);

  useEffect(() => {
    filterStations();
  }, [searchQuery, statusFilter, categoryFilter, allChannels]);

  const loadAllStations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/channels`);
      setAllChannels(data);
      updateTopStations(data);
    } catch (error) {
      const mockData = [
        { id: '1', name: 'FM 101 Karachi', callSign: 'FM101', status: 'approved', category: 'music', city: 'Karachi', owner: { firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed@fm101.com' }, listeners: 15420, shows: 25 },
        { id: '2', name: 'City FM 89 Lahore', callSign: 'CITY89', status: 'approved', category: 'talk', city: 'Lahore', owner: { firstName: 'Sara', lastName: 'Ali', email: 'sara@cityfm.com' }, listeners: 12350, shows: 18 },
        { id: '3', name: 'Radio Pakistan', callSign: 'RP', status: 'suspended', category: 'news', city: 'Islamabad', owner: { firstName: 'Muhammad', lastName: 'Hassan', email: 'hassan@radiopak.com' }, listeners: 8900, shows: 12 },
      ];
      setAllChannels(mockData);
      updateTopStations(mockData);
    }
  };

  const loadPendingStations = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/channels/pending`);
      setPendingChannels(data);
    } catch (error) {
      setPendingChannels([
        { id: '4', name: 'Hot FM 105', callSign: 'HOT105', status: 'pending_approval', category: 'music', owner: { firstName: 'Ali', lastName: 'Ahmed', email: 'ali@hotfm.com' }, createdAt: new Date() },
        { id: '5', name: 'Sports Radio 92', callSign: 'SPORT92', status: 'pending_approval', category: 'sports', owner: { firstName: 'Fatima', lastName: 'Sheikh', email: 'fatima@sportsradio.com' }, createdAt: new Date() },
      ]);
    }
  };

  const updateTopStations = (channels) => {
    const sorted = [...channels]
      .sort((a, b) => (b.listeners || 0) - (a.listeners || 0))
      .slice(0, 5)
      .map((c) => ({ name: c.name, listeners: c.listeners || 0 }));
    setTopStations(sorted);
  };

  const filterStations = () => {
    const filtered = allChannels.filter((channel) => {
      const matchesSearch =
        !searchQuery ||
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.callSign.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || channel.status === statusFilter;
      const matchesCategory = !categoryFilter || channel.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
    setFilteredChannels(filtered);
  };

  const handleStatusFilterClick = (status) => {
    setStatusFilter(status);
  };

  const getActiveCount = () => allChannels.filter((c) => c.status === 'approved').length;
  const getSuspendedCount = () => allChannels.filter((c) => c.status === 'suspended').length;

  const getStatusLabel = (status) => {
    const labels = {
      pending_approval: 'Pending',
      approved: 'Active',
      suspended: 'Suspended',
      rejected: 'Rejected',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending_approval') return 'bg-orange-100 text-orange-700';
    if (status === 'suspended') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStationBorderColor = (status) => {
    if (status === 'approved') return 'border-green-500';
    if (status === 'pending_approval') return 'border-orange-500';
    if (status === 'suspended') return 'border-red-500';
    return 'border-gray-500';
  };

  const getRankClass = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-blue-800';
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const approveStation = async (id) => {
    if (window.confirm('Are you sure you want to approve this station? It will become active immediately.')) {
      try {
        await axios.patch(`${API_URL}/channels/${id}/approve`, {});
        setPendingChannels((prev) => prev.filter((c) => c.id !== id));
        loadAllStations();
        alert('Station approved successfully!');
      } catch (error) {
        console.error('Error approving station:', error);
        alert('Failed to approve station. Please try again.');
      }
    }
  };

  const rejectStation = async (id) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    if (reason !== null) {
      try {
        await axios.patch(`${API_URL}/channels/${id}/reject`, { reason });
        setPendingChannels((prev) => prev.filter((c) => c.id !== id));
        loadAllStations();
        alert('Station rejected successfully!');
      } catch (error) {
        console.error('Error rejecting station:', error);
        alert('Failed to reject station. Please try again.');
      }
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-blue-800 to-blue-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="primary">
                heroicons-outline:wifi
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Station Management</Typography>
                {pendingChannels.length > 0 && (
                  <Chip 
                    label={`${pendingChannels.length} Pending`} 
                    size="small" 
                    className="bg-orange-500 text-white font-bold" 
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:wifi</FuseSvgIcon>
                  {allChannels.length} Total Stations
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:check-circle</FuseSvgIcon>
                  {getActiveCount()} Active
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button variant="outlined" className="border-white/30 text-white hover:bg-white/10" startIcon={<FuseSvgIcon className="text-white">heroicons-outline:download</FuseSvgIcon>}>
              Export
            </Button>
            <Button variant="contained" className="bg-white text-blue-800 hover:bg-gray-100" startIcon={<FuseSvgIcon color="primary">heroicons-outline:plus</FuseSvgIcon>}>
              Add Station
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:wifi', label: 'Total', value: allChannels.length, color: 'from-blue-800 to-blue-900', onClick: () => handleStatusFilterClick('') },
          { icon: 'heroicons-outline:check-circle', label: 'Active', value: getActiveCount(), color: 'from-green-600 to-green-700', onClick: () => handleStatusFilterClick('approved') },
          { icon: 'heroicons-outline:clock', label: 'Pending', value: pendingChannels.length, color: 'from-orange-500 to-orange-600', onClick: () => handleStatusFilterClick('pending_approval') },
          { icon: 'heroicons-outline:no-symbol', label: 'Suspended', value: getSuspendedCount(), color: 'from-red-500 to-red-600', onClick: () => handleStatusFilterClick('suspended') },
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
          {/* Search & Filters */}
          <motion.div variants={item}>
            <Paper className="p-16 rounded-16 shadow">
              <div className="flex flex-col sm:flex-row gap-12">
                <TextField
                  placeholder="Search stations..."
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
                  <MenuItem value="approved">Active</MenuItem>
                  <MenuItem value="pending_approval">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="music">Music</MenuItem>
                  <MenuItem value="talk">Talk</MenuItem>
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="religious">Religious</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Stations List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:view-list</FuseSvgIcon>
                  All Stations
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredChannels.length} results</Typography>
              </div>
              <div className="p-20">
                {filteredChannels.length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {filteredChannels.map((channel) => (
                      <div key={channel.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-16 p-16 bg-gray-50 rounded-12 border-l-4 ${getStationBorderColor(channel.status)} hover:bg-gray-100 transition-colors`}>
                        <div className="flex items-center gap-12 flex-1">
                          <div className="flex items-center justify-center w-48 h-48 rounded-12 bg-gradient-to-r from-blue-800 to-blue-900">
                            <FuseSvgIcon size={24} className="text-white">heroicons-outline:wifi</FuseSvgIcon>
                          </div>
                          <div className="flex-1">
                            <Typography className="font-semibold mb-4">{channel.name}</Typography>
                            <div className="flex flex-wrap gap-8 mb-4">
                              <Chip label={channel.callSign} size="small" className="bg-blue-800 text-white font-semibold h-20" />
                              <Chip label={channel.category} size="small" className="bg-blue-100 text-blue-800 h-20" />
                              {channel.city && <Typography className="text-xs text-gray-600">{channel.city}</Typography>}
                            </div>
                            <Typography className="text-xs text-gray-600 flex items-center gap-4">
                              <FuseSvgIcon size={14} className="text-gray-700">heroicons-outline:user</FuseSvgIcon>
                              {channel.owner.firstName} {channel.owner.lastName}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex gap-16">
                          <div className="text-center">
                            <Typography className="text-lg font-bold text-blue-800">{channel.listeners || 0}</Typography>
                            <Typography className="text-xs text-gray-600">Listeners</Typography>
                          </div>
                          <div className="text-center">
                            <Typography className="text-lg font-bold text-blue-800">{channel.shows || 0}</Typography>
                            <Typography className="text-xs text-gray-600">Shows</Typography>
                          </div>
                        </div>
                        <Chip label={getStatusLabel(channel.status)} size="small" className={`${getStatusColor(channel.status)} font-semibold`} />
                        <div className="flex gap-4">
                          <IconButton size="small" className="bg-blue-100 hover:bg-blue-800 text-blue-800 hover:text-white">
                            <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-blue-100 hover:bg-blue-800 text-blue-800 hover:text-white">
                            <FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className={`text-orange-600 bg-orange-100 ${channel.status === 'suspended' ? 'hover:bg-green-500 hover:text-white' : 'hover:bg-orange-500 hover:text-white'}`}>
                            <FuseSvgIcon size={16}>{channel.status === 'suspended' ? 'heroicons-outline:play' : 'heroicons-outline:no-symbol'}</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white">
                            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:wifi</FuseSvgIcon>
                    <Typography className="text-gray-400">No stations found</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Pending Approvals */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="warning">heroicons-outline:clock</FuseSvgIcon>
                  Pending Approvals
                </Typography>
                {pendingChannels.length > 0 && <Chip label={pendingChannels.length} size="small" className="bg-orange-500 text-white font-bold" />}
              </div>
              <div className="p-20">
                {pendingChannels.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {pendingChannels.map((channel) => (
                      <div key={channel.id} className="p-16 bg-orange-50 rounded-12 border-l-4 border-orange-500">
                        <div className="flex justify-between items-start mb-12">
                          <div className="flex-1">
                            <Typography className="font-semibold mb-4">{channel.name}</Typography>
                            <Typography className="text-sm text-gray-600 mb-4">{channel.callSign} • {channel.category}</Typography>
                            <Typography className="text-xs text-gray-600 flex items-center gap-4 mb-4">
                              <FuseSvgIcon size={12} className="text-gray-600">heroicons-outline:user</FuseSvgIcon>
                              {channel.owner.firstName} {channel.owner.lastName}
                            </Typography>
                            <Typography className="text-xs text-gray-500 italic mb-4">{channel.owner.email}</Typography>
                            <Typography className="text-xs text-orange-600 flex items-center gap-4">
                              <FuseSvgIcon size={12} className="text-orange-600">heroicons-outline:clock</FuseSvgIcon>
                              {formatDate(channel.createdAt)}
                            </Typography>
                          </div>
                          <div className="flex gap-8 ml-12">
                            <IconButton size="small" className="bg-green-500 text-white hover:bg-green-600" onClick={() => approveStation(channel.id)}>
                              <FuseSvgIcon size={20} className="text-white">heroicons-outline:check</FuseSvgIcon>
                            </IconButton>
                            <IconButton size="small" className="bg-red-500 text-white hover:bg-red-600" onClick={() => rejectStation(channel.id)}>
                              <FuseSvgIcon size={20} className="text-white">heroicons-outline:x</FuseSvgIcon>
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FuseSvgIcon size={48} className="mb-8 text-green-600">heroicons-outline:check-circle</FuseSvgIcon>
                    <Typography className="text-sm text-green-600">No pending approvals</Typography>
                    <Typography className="text-xs text-gray-500 mt-4">All stations have been reviewed</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:chart-pie</FuseSvgIcon>
                  By Category
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {categoryBreakdown.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-12">
                      <div className="flex items-center gap-8 min-w-80">
                        <span className="w-10 h-10 rounded-4" style={{ background: cat.color }} />
                        <Typography className="text-sm">{cat.name}</Typography>
                      </div>
                      <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${cat.percentage}%`, background: cat.color }} />
                      </div>
                      <Typography className="font-semibold text-blue-800 min-w-30 text-right">{cat.count}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Top Stations */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="warning">heroicons-outline:trophy</FuseSvgIcon>
                  Top Stations
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {topStations.map((station, index) => (
                    <div key={index} className="flex items-center gap-12 p-12 bg-gray-50 rounded-12">
                      <div className={`flex items-center justify-center w-28 h-28 rounded-full ${getRankClass(index)} text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Typography className="font-semibold text-sm">{station.name}</Typography>
                        <Typography className="text-xs text-gray-600">{station.listeners} listeners</Typography>
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

export default StationsPage;
