import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

function ModerationPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [allItems, setAllItems] = useState([
    { id: '1', type: 'content', title: 'Inappropriate Audio', description: 'Contains explicit language', reportedBy: 'user@email.com', reason: 'Explicit', status: 'pending', priority: 'high', createdAt: new Date() },
    { id: '2', type: 'user', title: 'Suspicious Activity', description: 'Multiple failed logins', reportedBy: 'System', reason: 'Security', status: 'pending', priority: 'urgent', createdAt: new Date() },
    { id: '3', type: 'channel', title: 'Copyright Violation', description: 'Streaming copyrighted music', reportedBy: 'legal@label.com', reason: 'Copyright', status: 'escalated', priority: 'urgent', createdAt: new Date() },
    { id: '4', type: 'content', title: 'Spam Content', description: 'Repeated promotional messages', reportedBy: 'moderator@awaz.com', reason: 'Spam', status: 'pending', priority: 'medium', createdAt: new Date() },
    { id: '5', type: 'user', title: 'Harassment Report', description: 'User reported for harassment', reportedBy: 'victim@email.com', reason: 'Harassment', status: 'pending', priority: 'high', createdAt: new Date() },
  ]);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    filterItems();
  }, [activeTab, typeFilter, priorityFilter, allItems]);

  const filterItems = () => {
    const filtered = allItems.filter((item) => {
      let matchesTab = true;
      if (activeTab === 'pending') matchesTab = item.status === 'pending';
      else if (activeTab === 'escalated') matchesTab = item.status === 'escalated';
      else if (activeTab === 'resolved') matchesTab = ['approved', 'rejected'].includes(item.status);
      const matchesType = !typeFilter || item.type === typeFilter;
      const matchesPriority = !priorityFilter || item.priority === priorityFilter;
      return matchesTab && matchesType && matchesPriority;
    });
    setFilteredItems(filtered);
  };

  const getTypeIcon = (type) => {
    const icons = {
      content: 'heroicons-outline:music-note',
      user: 'heroicons-outline:user',
      comment: 'heroicons-outline:chat',
      channel: 'heroicons-outline:radio',
    };
    return icons[type] || 'heroicons-outline:flag';
  };

  const getPendingCount = () => allItems.filter((i) => i.status === 'pending').length;
  const getUrgentCount = () => allItems.filter((i) => i.priority === 'urgent' && i.status === 'pending').length;
  const getEscalatedCount = () => allItems.filter((i) => i.status === 'escalated').length;
  const getTodayResolved = () => 12;
  const getAverageTime = () => 2.5;
  const getCountByPriority = (priority) => allItems.filter((i) => i.priority === priority && i.status === 'pending').length;

  const approveItem = (id) => {
    setAllItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item)));
  };

  const rejectItem = (id) => {
    setAllItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item)));
  };

  const escalateItem = (id) => {
    setAllItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'escalated' } : item)));
  };

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'bg-red-100 text-red-700 border-red-500';
    if (priority === 'high') return 'bg-orange-100 text-orange-700 border-orange-500';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-500';
    return 'bg-gray-100 text-gray-700 border-gray-500';
  };

  const getPriorityBadgeColor = (priority) => {
    if (priority === 'urgent') return 'bg-red-500 text-white';
    if (priority === 'high') return 'bg-orange-500 text-white';
    if (priority === 'medium') return 'bg-yellow-500 text-white';
    return 'bg-gray-500 text-white';
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-purple-800 to-purple-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="secondary">
                heroicons-outline:shield-check
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">Content Moderation</Typography>
                {getUrgentCount() > 0 && (
                  <Chip 
                    label={`${getUrgentCount()} Urgent`} 
                    size="small" 
                    className="bg-red-500 text-white font-bold" 
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:clock</FuseSvgIcon>
                  {getPendingCount()} Pending
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:check-circle</FuseSvgIcon>
                  {getTodayResolved()} Resolved Today
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:clock', label: 'Pending', value: getPendingCount(), color: 'from-orange-500 to-orange-600', onClick: () => setActiveTab('pending') },
          { icon: 'heroicons-outline:arrow-up', label: 'Escalated', value: getEscalatedCount(), color: 'from-red-500 to-red-600', onClick: () => setActiveTab('escalated') },
          { icon: 'heroicons-outline:check-circle', label: 'Resolved', value: getTodayResolved(), color: 'from-green-600 to-green-700', onClick: () => setActiveTab('resolved') },
          { icon: 'heroicons-outline:clock', label: 'Avg Time', value: `${getAverageTime()}h`, color: 'from-blue-800 to-blue-900' },
        ].map((stat, index) => (
          <motion.div key={index} variants={item}>
            <Paper className={`flex items-center gap-16 p-20 rounded-16 shadow ${stat.onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-shadow`} onClick={stat.onClick}>
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
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-12 p-16">
                <div className="flex gap-8 flex-1">
                  <Button variant={activeTab === 'all' ? 'contained' : 'outlined'} onClick={() => setActiveTab('all')} className="flex-1">
                    All
                  </Button>
                  <Button variant={activeTab === 'pending' ? 'contained' : 'outlined'} onClick={() => setActiveTab('pending')} className="flex-1">
                    Pending
                  </Button>
                  <Button variant={activeTab === 'escalated' ? 'contained' : 'outlined'} onClick={() => setActiveTab('escalated')} className="flex-1">
                    Escalated
                  </Button>
                  <Button variant={activeTab === 'resolved' ? 'contained' : 'outlined'} onClick={() => setActiveTab('resolved')} className="flex-1">
                    Resolved
                  </Button>
                </div>
                <div className="flex gap-12">
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="content">Content</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="channel">Channel</MenuItem>
                  </Select>
                  <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                    <MenuItem value="">All Priority</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                  </Select>
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Moderation Queue */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="secondary">heroicons-outline:view-list</FuseSvgIcon>
                  Moderation Queue
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredItems.length} items</Typography>
              </div>
              <div className="p-20">
                {filteredItems.length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {filteredItems.map((moderationItem) => (
                      <div key={moderationItem.id} className={`p-16 bg-gray-50 rounded-12 border-l-4 ${getPriorityColor(moderationItem.priority)}`}>
                        <div className="flex items-start justify-between mb-12">
                          <div className="flex items-center gap-8">
                            <div className="flex items-center justify-center w-32 h-32 rounded-8 bg-purple-100">
                              <FuseSvgIcon size={16} className="text-purple-800">{getTypeIcon(moderationItem.type)}</FuseSvgIcon>
                            </div>
                            <Typography className="text-sm font-semibold capitalize">{moderationItem.type}</Typography>
                          </div>
                          <Chip label={moderationItem.priority.toUpperCase()} size="small" className={`${getPriorityBadgeColor(moderationItem.priority)} font-bold`} />
                        </div>
                        <Typography className="font-semibold mb-8">{moderationItem.title}</Typography>
                        <Typography className="text-sm text-gray-600 mb-12">{moderationItem.description}</Typography>
                        <div className="flex flex-wrap gap-12 mb-12 text-xs text-gray-600">
                          <span className="flex items-center gap-4">
                            <FuseSvgIcon size={12} className="text-gray-600">heroicons-outline:user</FuseSvgIcon>
                            {moderationItem.reportedBy}
                          </span>
                          <span className="flex items-center gap-4">
                            <FuseSvgIcon size={12} className="text-gray-600">heroicons-outline:flag</FuseSvgIcon>
                            {moderationItem.reason}
                          </span>
                        </div>
                        <div className="flex gap-8">
                          <Button variant="contained" size="small" className="bg-green-500 hover:bg-green-600 text-white" startIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>} onClick={() => approveItem(moderationItem.id)}>
                            Approve
                          </Button>
                          <Button variant="contained" size="small" className="bg-red-500 hover:bg-red-600 text-white" startIcon={<FuseSvgIcon size={16}>heroicons-outline:x</FuseSvgIcon>} onClick={() => rejectItem(moderationItem.id)}>
                            Reject
                          </Button>
                          <Button variant="outlined" size="small" className="border-orange-500 text-orange-500 hover:bg-orange-50" startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-up</FuseSvgIcon>} onClick={() => escalateItem(moderationItem.id)}>
                            Escalate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-green-600">heroicons-outline:check-circle</FuseSvgIcon>
                    <Typography className="text-green-600">All clear! No items to review.</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Priority Breakdown */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="secondary">heroicons-outline:chart-bar</FuseSvgIcon>
                  By Priority
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Urgent', priority: 'urgent', color: 'bg-red-500' },
                    { label: 'High', priority: 'high', color: 'bg-orange-500' },
                    { label: 'Medium', priority: 'medium', color: 'bg-yellow-500' },
                    { label: 'Low', priority: 'low', color: 'bg-gray-500' },
                  ].map((p) => (
                    <div key={p.priority} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center gap-8">
                        <div className={`w-10 h-10 rounded-4 ${p.color}`} />
                        <Typography className="text-sm font-semibold">{p.label}</Typography>
                      </div>
                      <Typography className="text-lg font-bold text-purple-800">{getCountByPriority(p.priority)}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Actions */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="secondary">heroicons-outline:clock</FuseSvgIcon>
                  Recent Actions
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    { action: 'Content approved', time: '2 min ago', icon: 'heroicons-outline:check', color: 'text-green-600 bg-green-100' },
                    { action: 'User report rejected', time: '15 min ago', icon: 'heroicons-outline:x', color: 'text-red-600 bg-red-100' },
                    { action: 'Channel escalated', time: '1 hour ago', icon: 'heroicons-outline:arrow-up', color: 'text-orange-600 bg-orange-100' },
                  ].map((action, idx) => (
                    <div key={idx} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                      <div className={`flex items-center justify-center w-32 h-32 rounded-8 ${action.color}`}>
                        <FuseSvgIcon size={16}>{action.icon}</FuseSvgIcon>
                      </div>
                      <div className="flex-1">
                        <Typography className="text-sm font-semibold">{action.action}</Typography>
                        <Typography className="text-xs text-gray-600">{action.time}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Guidelines */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="secondary">heroicons-outline:book-open</FuseSvgIcon>
                  Quick Guidelines
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {[
                    'Review content within 24 hours',
                    'Escalate copyright issues immediately',
                    'Document rejection reasons',
                  ].map((guideline, idx) => (
                    <div key={idx} className="flex items-start gap-8">
                      <FuseSvgIcon size={16} className="text-green-600 mt-2">heroicons-outline:check-circle</FuseSvgIcon>
                      <Typography className="text-sm text-gray-700">{guideline}</Typography>
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

export default ModerationPage;
