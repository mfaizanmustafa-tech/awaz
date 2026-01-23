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
import Avatar from '@mui/material/Avatar';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    loadAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, allUsers]);

  const loadAllUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/users`);
      setAllUsers(data);
      updateRecentUsers(data);
    } catch (error) {
      const mockData = [
        { id: '1', firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed@example.com', role: 'admin', status: 'active', createdAt: new Date('2024-01-15'), lastLogin: new Date('2024-02-10') },
        { id: '2', firstName: 'Sara', lastName: 'Ali', email: 'sara@cityfm.com', role: 'station_owner', status: 'active', createdAt: new Date('2024-01-20'), lastLogin: new Date('2024-02-09'), channelsOwned: 1 },
        { id: '3', firstName: 'Muhammad', lastName: 'Hassan', email: 'hassan@example.com', role: 'user', status: 'active', createdAt: new Date('2024-02-01'), lastLogin: new Date('2024-02-08') },
        { id: '4', firstName: 'Fatima', lastName: 'Sheikh', email: 'fatima@example.com', role: 'user', status: 'suspended', createdAt: new Date('2024-01-25'), lastLogin: new Date('2024-02-05') },
        { id: '5', firstName: 'Ali', lastName: 'Ahmed', email: 'ali@hotfm.com', role: 'station_owner', status: 'pending', createdAt: new Date('2024-02-08'), channelsOwned: 0 },
        { id: '6', firstName: 'Zainab', lastName: 'Malik', email: 'zainab@example.com', role: 'user', status: 'active', createdAt: new Date('2024-02-05'), lastLogin: new Date('2024-02-09') },
      ];
      setAllUsers(mockData);
      updateRecentUsers(mockData);
    }
  };

  const updateRecentUsers = (users) => {
    const sorted = [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentUsers(sorted);
  };

  const filterUsers = () => {
    const filtered = allUsers.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  };

  const setRoleFilterAndFilter = (role) => {
    setRoleFilter(role);
  };

  const getUserInitials = (user) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role) => {
    const labels = { admin: 'Admin', station_owner: 'Station Owner', user: 'User' };
    return labels[role] || role;
  };

  const getStatusLabel = (status) => {
    const labels = { active: 'Active', suspended: 'Suspended', pending: 'Pending' };
    return labels[status] || status;
  };

  const getRoleColor = (role) => {
    if (role === 'admin') return 'bg-red-100 text-red-700';
    if (role === 'station_owner') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'suspended') return 'bg-red-100 text-red-700';
    return 'bg-orange-100 text-orange-700';
  };

  const getAvatarColor = (role) => {
    if (role === 'admin') return 'bg-red-500';
    if (role === 'station_owner') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAdminCount = () => allUsers.filter((u) => u.role === 'admin').length;
  const getStationOwners = () => allUsers.filter((u) => u.role === 'station_owner').length;
  const getRegularUsers = () => allUsers.filter((u) => u.role === 'user').length;
  const getActiveUsers = () => allUsers.filter((u) => u.status === 'active').length;
  const getSuspendedCount = () => allUsers.filter((u) => u.status === 'suspended').length;
  const getNewUsersThisMonth = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    return allUsers.filter((u) => new Date(u.createdAt) >= thisMonth).length;
  };

  const deleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
      alert('User deleted successfully!');
    }
  };

  const toggleUserStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    setAllUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
    alert(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
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
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-24 sm:p-32 bg-gradient-to-r from-cyan-800 to-cyan-900">
          <div className="flex items-end gap-16">
            <div className="flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 rounded-16 bg-white shadow-lg">
              <FuseSvgIcon size={48} color="info">
                heroicons-outline:users
              </FuseSvgIcon>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-12 mb-8">
                <Typography className="text-24 sm:text-32 font-extrabold text-white">User Management</Typography>
                {getNewUsersThisMonth() > 0 && (
                  <Chip label={`+${getNewUsersThisMonth()} this month`} size="small" className="bg-green-500 text-white font-bold" />
                )}
              </div>
              <div className="flex flex-wrap gap-12 text-white">
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:users</FuseSvgIcon>
                  {allUsers.length} Total Users
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <FuseSvgIcon size={16} className="text-white">heroicons-outline:check-circle</FuseSvgIcon>
                  {getActiveUsers()} Active
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-12 mt-16 sm:mt-0">
            <Button variant="outlined" className="border-white/30 text-white hover:bg-white/10" startIcon={<FuseSvgIcon className="text-white">heroicons-outline:download</FuseSvgIcon>}>
              Export
            </Button>
            <Button variant="contained" className="bg-white text-cyan-800 hover:bg-gray-100" startIcon={<FuseSvgIcon color="info">heroicons-outline:plus</FuseSvgIcon>}>
              Add User
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 p-24 sm:p-32">
        {[
          { icon: 'heroicons-outline:users', label: 'Total Users', value: allUsers.length, color: 'from-cyan-800 to-cyan-900', onClick: () => setRoleFilterAndFilter('') },
          { icon: 'heroicons-outline:shield-check', label: 'Admins', value: getAdminCount(), color: 'from-red-500 to-red-600', onClick: () => setRoleFilterAndFilter('admin') },
          { icon: 'heroicons-outline:radio', label: 'Station Owners', value: getStationOwners(), color: 'from-blue-600 to-blue-700', onClick: () => setRoleFilterAndFilter('station_owner') },
          { icon: 'heroicons-outline:user', label: 'Regular Users', value: getRegularUsers(), color: 'from-gray-600 to-gray-700', onClick: () => setRoleFilterAndFilter('user') },
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
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  className="flex-1"
                  InputProps={{
                    startAdornment: <FuseSvgIcon size={20} className="mr-8 text-gray-600">heroicons-outline:search</FuseSvgIcon>,
                  }}
                />
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} size="small" displayEmpty className="min-w-160">
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="station_owner">Station Owner</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} size="small" displayEmpty className="min-w-140">
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </div>
            </Paper>
          </motion.div>

          {/* Users List */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="flex items-center justify-between p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:view-list</FuseSvgIcon>
                  All Users
                </Typography>
                <Typography className="text-sm text-gray-600">{filteredUsers.length} results</Typography>
              </div>
              <div className="p-20">
                {filteredUsers.length > 0 ? (
                  <div className="flex flex-col gap-16">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-16 p-16 bg-gray-50 rounded-12 hover:bg-gray-100 transition-colors">
                        <Avatar className={`w-48 h-48 ${getAvatarColor(user.role)} text-white font-bold`}>{getUserInitials(user)}</Avatar>
                        <div className="flex-1 min-w-0">
                          <Typography className="font-semibold mb-4">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography className="text-sm text-gray-600 mb-8">{user.email}</Typography>
                          <div className="flex flex-wrap gap-8 items-center">
                            <Chip label={getRoleLabel(user.role)} size="small" className={`${getRoleColor(user.role)} h-20 text-xs font-semibold`} />
                            <Typography className="text-xs text-gray-600">Joined {formatDate(user.createdAt)}</Typography>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                          <Chip label={getStatusLabel(user.status)} size="small" className={`${getStatusColor(user.status)} font-semibold`} />
                          {user.lastLogin && <Typography className="text-xs text-gray-500">Last: {formatDate(user.lastLogin)}</Typography>}
                        </div>
                        <div className="flex gap-4">
                          <IconButton size="small" className="bg-blue-100 hover:bg-blue-800 text-blue-800 hover:text-white" title="View">
                            <FuseSvgIcon size={16}>heroicons-outline:eye</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-blue-100 hover:bg-blue-800 text-blue-800 hover:text-white" title="Edit">
                            <FuseSvgIcon size={16}>heroicons-outline:pencil</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white" title="Reset Password">
                            <FuseSvgIcon size={16}>heroicons-outline:key</FuseSvgIcon>
                          </IconButton>
                          <IconButton
                            size="small"
                            className={`${user.status === 'suspended' ? 'bg-green-100 hover:bg-green-600 text-green-600' : 'bg-orange-100 hover:bg-orange-600 text-orange-600'} hover:text-white`}
                            title={user.status === 'suspended' ? 'Activate' : 'Suspend'}
                            onClick={() => toggleUserStatus(user.id, user.status)}
                          >
                            <FuseSvgIcon size={16}>{user.status === 'suspended' ? 'heroicons-outline:check-circle' : 'heroicons-outline:ban'}</FuseSvgIcon>
                          </IconButton>
                          <IconButton size="small" className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white" title="Delete" onClick={() => deleteUser(user.id)}>
                            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                          </IconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <FuseSvgIcon size={48} className="mb-8 text-gray-400">heroicons-outline:users</FuseSvgIcon>
                    <Typography className="text-gray-400">No users found</Typography>
                  </div>
                )}
              </div>
            </Paper>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-24">
          {/* Role Distribution */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:chart-pie</FuseSvgIcon>
                  Role Distribution
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col items-center mb-20">
                  <div className="flex flex-col items-center justify-center w-120 h-120 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 mb-12">
                    <Typography className="text-32 font-bold text-cyan-800">{allUsers.length}</Typography>
                    <Typography className="text-sm text-cyan-600">Users</Typography>
                  </div>
                </div>
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Admins', value: getAdminCount(), color: 'bg-red-500' },
                    { label: 'Station Owners', value: getStationOwners(), color: 'bg-blue-500' },
                    { label: 'Regular Users', value: getRegularUsers(), color: 'bg-gray-500' },
                  ].map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between p-12 bg-gray-50 rounded-8">
                      <div className="flex items-center gap-8">
                        <div className={`w-10 h-10 rounded-4 ${dist.color}`} />
                        <Typography className="text-sm">{dist.label}</Typography>
                      </div>
                      <Typography className="text-lg font-bold text-cyan-800">{dist.value}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Recent Signups */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="success">heroicons-outline:user-add</FuseSvgIcon>
                  Recent Signups
                </Typography>
              </div>
              <div className="p-20">
                <div className="flex flex-col gap-12">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-12 p-12 bg-gray-50 rounded-8">
                      <Avatar className={`w-32 h-32 ${getAvatarColor(user.role)} text-white text-xs font-bold`}>{getUserInitials(user)}</Avatar>
                      <div className="flex-1 min-w-0">
                        <Typography className="text-sm font-semibold truncate">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography className="text-xs text-gray-600">{getRoleLabel(user.role)}</Typography>
                      </div>
                      <Typography className="text-xs text-gray-500">{formatDate(user.createdAt)}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

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
                  {[
                    { icon: 'heroicons-outline:user-add', label: 'Add User', color: 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white' },
                    { icon: 'heroicons-outline:document-add', label: 'Bulk Import', color: 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white' },
                    { icon: 'heroicons-outline:mail', label: 'Send Email', color: 'bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white' },
                    { icon: 'heroicons-outline:download', label: 'Export All', color: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-600 hover:text-white' },
                  ].map((action, idx) => (
                    <Button key={idx} variant="outlined" className={`flex-col h-80 ${action.color} border-0`} fullWidth>
                      <FuseSvgIcon size={24} className="mb-4">{action.icon}</FuseSvgIcon>
                      <Typography className="text-xs font-semibold">{action.label}</Typography>
                    </Button>
                  ))}
                </div>
              </div>
            </Paper>
          </motion.div>

          {/* Activity Summary */}
          <motion.div variants={item}>
            <Paper className="rounded-16 shadow overflow-hidden">
              <div className="p-20 border-b">
                <Typography className="text-lg font-semibold flex items-center gap-8">
                  <FuseSvgIcon color="info">heroicons-outline:chart-bar</FuseSvgIcon>
                  Activity Summary
                </Typography>
              </div>
              <div className="p-20">
                <div className="grid grid-cols-3 gap-12">
                  {[
                    { value: getActiveUsers(), label: 'Active Today' },
                    { value: getNewUsersThisMonth(), label: 'New This Month' },
                    { value: getSuspendedCount(), label: 'Suspended' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex flex-col items-center p-12 bg-gray-50 rounded-8">
                      <Typography className="text-24 font-bold text-cyan-800">{stat.value}</Typography>
                      <Typography className="text-xs text-gray-600 text-center">{stat.label}</Typography>
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

export default UsersPage;
