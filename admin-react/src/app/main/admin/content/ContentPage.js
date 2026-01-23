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
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function ContentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allContent, setAllContent] = useState([
    { id: '1', title: 'Morning Show Episode 245', type: 'show', channel: 'FM 101', duration: '02:30:00', status: 'published', createdAt: new Date('2024-02-10'), plays: 15420, selected: false },
    { id: '2', title: 'Top 40 Hits - Week 6', type: 'audio', channel: 'Hot FM 105', duration: '01:00:00', status: 'published', createdAt: new Date('2024-02-09'), plays: 8900, selected: false },
    { id: '3', title: 'Tech Talk Podcast #52', type: 'podcast', channel: 'City FM 89', duration: '00:45:00', status: 'published', createdAt: new Date('2024-02-08'), plays: 5600, selected: false },
    { id: '4', title: 'Evening Drive Show', type: 'show', channel: 'Radio Pakistan', duration: '03:00:00', status: 'scheduled', createdAt: new Date('2024-02-11'), plays: 0, selected: false },
    { id: '5', title: 'Classical Music Collection', type: 'audio', channel: 'FM 101', duration: '02:00:00', status: 'draft', createdAt: new Date('2024-02-07'), plays: 0, selected: false },
    { id: '6', title: 'Sports Commentary Live', type: 'show', channel: 'Sports Radio 92', duration: '01:30:00', status: 'published', createdAt: new Date('2024-02-06'), plays: 12300, selected: false },
    { id: '7', title: 'Jazz Evening Collection', type: 'audio', channel: 'FM 101', duration: '01:45:00', status: 'published', createdAt: new Date('2024-02-05'), plays: 7800, selected: false },
    { id: '8', title: 'Business Insights Podcast', type: 'podcast', channel: 'City FM 89', duration: '00:35:00', status: 'draft', createdAt: new Date('2024-02-04'), plays: 0, selected: false },
  ]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const storageUsed = 125.5;
  const storageTotal = 500;

  useEffect(() => {
    filterContent();
    updateTopContent();
  }, [searchQuery, typeFilter, statusFilter, allContent]);

  const filterContent = () => {
    const filtered = allContent.filter((item) => {
      const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
    setFilteredContent(filtered);
  };

  const updateTopContent = () => {
    const sorted = [...allContent]
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5)
      .map((c) => ({ title: c.title, plays: c.plays }));
    setTopContent(sorted);
  };

  const setTypeFilterAndFilter = (type) => {
    setTypeFilter(type);
  };

  const getShowCount = () => allContent.filter((c) => c.type === 'show').length;
  const getAudioCount = () => allContent.filter((c) => c.type === 'audio').length;
  const getPodcastCount = () => allContent.filter((c) => c.type === 'podcast').length;
  const getStoragePercentage = () => (storageUsed / storageTotal) * 100;

  const getTypeIcon = (type) => {
    const icons = {
      show: 'heroicons-outline:microphone',
      audio: 'heroicons-outline:music-note',
      podcast: 'heroicons-outline:rss',
    };
    return icons[type] || 'heroicons-outline:document';
  };

  const getTypeColor = (type) => {
    if (type === 'show') return 'bg-blue-100 text-blue-700';
    if (type === 'audio') return 'bg-green-100 text-green-700';
    if (type === 'podcast') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    if (status === 'published') return 'bg-green-100 text-green-700';
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700';
    if (status === 'draft') return 'bg-gray-100 text-gray-700';
    return 'bg-orange-100 text-orange-700';
  };

  const getRankClass = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-blue-800';
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleSelection = (id) => {
    setAllContent((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const deleteContent = (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      setAllContent((prev) => prev.filter((item) => item.id !== id));
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-indigo-800 to-indigo-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="primary">
                heroicons-outline:music-note
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Content Management</Typography>
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:document</FuseSvgIcon>
                  {allContent.length} Total Items
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:database</FuseSvgIcon>
                  {storageUsed} GB Used
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button variant="outlined" className="border-white/30 text-white hover:bg-white/10" startIcon={<FuseSvgIcon className="text-white">heroicons-outline:clipboard-list</FuseSvgIcon>}>
              Bulk Actions
            </Button>
            <Button variant="contained" className="bg-white text-indigo-800 hover:bg-gray-100" startIcon={<FuseSvgIcon color="primary">heroicons-outline:upload</FuseSvgIcon>}>
              Upload
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:folder', label: 'Total', value: allContent.length, color: 'from-blue-800 to-blue-900', onClick: () => setTypeFilterAndFilter('') },
          { icon: 'heroicons-outline:microphone', label: 'Shows', value: getShowCount(), color: 'from-blue-600 to-blue-700', onClick: () => setTypeFilterAndFilter('show') },
          { icon: 'heroicons-outline:music-note', label: 'Audio', value: getAudioCount(), color: 'from-green-600 to-green-700', onClick: () => setTypeFilterAndFilter('audio') },
          { icon: 'heroicons-outline:rss', label: 'Podcasts', value: getPodcastCount(), color: 'from-purple-600 to-purple-700', onClick: () => setTypeFilterAndFilter('podcast') },
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
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  className="flex-1"
                  InputProps={{
                    startAdornment: <FuseSvgIcon size={20} className="mr-8 text-gray-600">heroicons-outline:search</FuseSvgIcon>,
                  }}
                />
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="show">Shows</MenuItem>
                  <MenuItem value="audio">Audio</MenuItem>
                  <MenuItem value="podcast">Podcasts</MenuItem>
                </Select>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Content List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:view-list</FuseSvgIcon>
                  All Content
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredContent.length} items</Typography>
              </div>
              <div className="p-20">
                {filteredContent.length > 0 ? (
                  <div className="flex flex-col gap-12">
                    {filteredContent.map((contentItem) => (
                      <div key={contentItem.id} className="flex items-center gap-12 p-16 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                        <Checkbox checked={contentItem.selected} onChange={() => toggleSelection(contentItem.id)} size="small" />
                        <div className={`flex items-center justify-center w-40 h-40 rounded-8 ${getTypeColor(contentItem.type)}`}>
                          <FuseSvgIcon size={20}>{getTypeIcon(contentItem.type)}</FuseSvgIcon>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Typography className="font-semibold mb-4 truncate">{contentItem.title}</Typography>
                          <div className="flex flex-wrap gap-8 items-center">
                            <Chip label={contentItem.type} size="small" className={`${getTypeColor(contentItem.type)} h-20 text-xs font-semibold`} />
                            <Typography className="text-xs text-gray-600">{contentItem.channel}</Typography>
                            <span className="flex items-center gap-4 text-xs text-gray-600">
                              <FuseSvgIcon size={12} className="text-gray-600">heroicons-outline:clock</FuseSvgIcon>
                              {contentItem.duration}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                          <span className="flex items-center gap-4 text-sm text-gray-700">
                            <FuseSvgIcon size={14} className="text-gray-700">heroicons-outline:play</FuseSvgIcon>
                            {formatNumber(contentItem.plays)}
                          </span>
                          <Typography className="text-xs text-gray-500">{formatDate(contentItem.createdAt)}</Typography>
                        </div>
                        <Chip label={contentItem.status} size="small" className={`${getStatusColor(contentItem.status)} font-semibold capitalize`} />
                        <div className="flex gap-4">
                          <IconButton size="small" className="bg-blue-100 hover:bg-blue-800 text-blue-800 hover:text-white">
                            <FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-green-100 hover:bg-green-600 text-green-600 hover:text-white">
                            <FuseSvgIcon size={16}>heroicons-outline:play</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white" onClick={() => deleteContent(contentItem.id)}>
                            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:music-note</FuseSvgIcon>
                    <Typography className="text-gray-400">No content found</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Storage Panel */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:database</FuseSvgIcon>
                  Storage
                </Typography>
              </div>
              <div className="p-20">
                <div className="mb-16">
                  <div className="flex justify-between mb-8">
                    <Typography className="text-sm font-semibold">{storageUsed} GB</Typography>
                    <Typography className="text-sm text-gray-600">of {storageTotal} GB</Typography>
                  </div>
                  <LinearProgress variant="determinate" value={getStoragePercentage()} className="h-8 rounded-full" />
                </div>
                <div className="flex flex-col gap-12">
                  {[
                    { icon: 'heroicons-outline:microphone', label: 'Shows', size: '45 GB', color: 'text-blue-600' },
                    { icon: 'heroicons-outline:music-note', label: 'Audio', size: '55 GB', color: 'text-green-600' },
                    { icon: 'heroicons-outline:rss', label: 'Podcasts', size: '25 GB', color: 'text-purple-600' },
                  ].map((storage, idx) => (
                    <div key={idx} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center gap-8">
                        <FuseSvgIcon size={16} className={storage.color}>{storage.icon}</FuseSvgIcon>
                        <Typography className="text-sm">{storage.label}</Typography>
                      </div>
                      <Typography className="text-sm font-semibold text-gray-700">{storage.size}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Top Content */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="warning">heroicons-outline:fire</FuseSvgIcon>
                  Top Content
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {topContent.map((top, index) => (
                    <div key={index} className="flex items-center gap-12 p-12 bg-gray-50 rounded-12">
                      <div className={`flex items-center justify-center w-28 h-28 rounded-full ${getRankClass(index)} text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography className="font-semibold text-sm truncate">{top.title}</Typography>
                        <Typography className="text-xs text-gray-600">{formatNumber(top.plays)} plays</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Quick Upload */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="primary">heroicons-outline:cloud-upload</FuseSvgIcon>
                  Quick Upload
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-gray-300 rounded-12 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                  <FuseSvgIcon size={48} className="mb-12 text-indigo-600">heroicons-outline:cloud-upload</FuseSvgIcon>
                  <Typography className="font-semibold mb-4">Drop files here or click to upload</Typography>
                  <Typography className="text-xs text-gray-600">MP3, WAV, FLAC up to 100MB</Typography>
                </div>
              </div>
            </Paper>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ContentPage;
