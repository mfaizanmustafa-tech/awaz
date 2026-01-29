import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const API_URL = 'http://localhost:3000';

function EngagementPage() {
  const [stats, setStats] = useState(null);
  const [recentInteractions, setRecentInteractions] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [channelId, setChannelId] = useState(null);

  useEffect(() => {
    loadChannelData();
  }, []);

  useEffect(() => {
    if (channelId) {
      loadEngagementData();
    }
  }, [channelId]);

  const loadChannelData = async () => {
    try {
      console.log('🔍 Loading channel data...');
      const token = localStorage.getItem('jwt_access_token');
      
      const response = await axios.get(`${API_URL}/channels/my-channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.length > 0) {
        setChannelId(response.data[0].id);
        console.log('✅ Channel ID set:', response.data[0].id);
      } else {
        console.warn('⚠️ No channels found');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error loading channel:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const loadEngagementData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, recentRes, commentsRes, ratingsRes, likesRes] = await Promise.all([
        axios.get(`${API_URL}/interactions/stats/${channelId}`, { headers }),
        axios.get(`${API_URL}/interactions/recent/${channelId}?limit=50`, { headers }),
        axios.get(`${API_URL}/interactions/comment/${channelId}/all`, { headers }),
        axios.get(`${API_URL}/interactions/rating/${channelId}/list`, { headers }),
        axios.get(`${API_URL}/interactions/like/${channelId}/list`, { headers })
      ]);

      setStats(statsRes.data);
      setRecentInteractions(recentRes.data);
      setComments(commentsRes.data);
      setRatings(ratingsRes.data);
      setLikes(likesRes.data);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pinComment = async (commentId) => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      await axios.patch(
        `${API_URL}/interactions/comment/${commentId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadEngagementData();
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-32">
        <div className="text-center">
          <FuseSvgIcon className="animate-spin text-purple-600" size={48}>heroicons-outline:arrow-path</FuseSvgIcon>
          <p className="mt-16 text-gray-600">Loading engagement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-24 sm:p-32 w-full min-h-full">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-24 p-32 rounded-16 bg-gradient-to-r from-pink-800 to-purple-900 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center">
              <FuseSvgIcon className="text-pink-600" size={32}>heroicons-outline:heart</FuseSvgIcon>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Listener Engagement</h1>
              <div className="flex items-center gap-16 text-white opacity-90 text-sm">
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:heart</FuseSvgIcon>
                  <span>{stats?.totalLikes || 0} Likes</span>
                </div>
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
                  <span>{stats?.totalComments || 0} Comments</span>
                </div>
                <div className="flex items-center gap-4">
                  <FuseSvgIcon size={16}>heroicons-outline:star</FuseSvgIcon>
                  <span>{stats?.averageRating?.toFixed(1) || '0.0'} Rating</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={loadEngagementData}
            className="px-20 py-10 bg-white text-pink-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-8"
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrow-path</FuseSvgIcon>
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
        {[
          { label: 'Total Likes', value: stats?.totalLikes || 0, icon: 'heroicons-outline:heart', color: 'pink' },
          { label: 'Comments', value: stats?.totalComments || 0, icon: 'heroicons-outline:chat-bubble-left-right', color: 'purple' },
          { label: 'Average Rating', value: stats?.averageRating?.toFixed(1) || '0.0', icon: 'heroicons-outline:star', color: 'yellow' },
          { label: 'Total Ratings', value: stats?.totalRatings || 0, icon: 'heroicons-outline:chart-bar', color: 'blue' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="p-20 bg-white rounded-12 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-4">{stat.label}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              </div>
              <div className={`w-48 h-48 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                <FuseSvgIcon className={`text-${stat.color}-600`} size={24}>{stat.icon}</FuseSvgIcon>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-24 flex gap-8 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: 'heroicons-outline:chart-pie' },
          { id: 'comments', label: `Comments (${comments.length})`, icon: 'heroicons-outline:chat-bubble-left-right' },
          { id: 'ratings', label: `Ratings (${ratings.length})`, icon: 'heroicons-outline:star' },
          { id: 'likes', label: `Likes (${likes.length})`, icon: 'heroicons-outline:heart' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-20 py-12 flex items-center gap-8 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FuseSvgIcon size={20}>{tab.icon}</FuseSvgIcon>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Rating Distribution */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-24 bg-white rounded-16 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:chart-bar</FuseSvgIcon>
                Rating Distribution
              </h3>
              <div className="space-y-12">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats?.ratingDistribution?.[star] || 0;
                  const percentage = stats?.totalRatings ? (count / stats.totalRatings) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-12">
                      <span className="text-sm font-bold w-32">{star} ⭐</span>
                      <div className="flex-1 h-24 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-32 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-24 bg-white rounded-16 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:clock</FuseSvgIcon>
                Recent Activity
              </h3>
              <div className="space-y-12 max-h-400 overflow-y-auto">
                {recentInteractions?.recentComments?.slice(0, 5).map((comment) => (
                  <div key={comment.id} className="flex items-start gap-12 p-12 bg-gray-50 rounded-lg">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(comment.userName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>{comment.userName}</strong> commented
                      </p>
                      <p className="text-xs text-gray-600">{getTimeAgo(comment.createdAt)}</p>
                    </div>
                    <FuseSvgIcon className="text-purple-600" size={20}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
                  </div>
                ))}
                {recentInteractions?.recentRatings?.slice(0, 3).map((rating) => (
                  <div key={rating.id} className="flex items-start gap-12 p-12 bg-gray-50 rounded-lg">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      {rating.user?.firstName?.[0]}{rating.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>{rating.user?.firstName} {rating.user?.lastName}</strong> rated {rating.rating} stars
                      </p>
                      <p className="text-xs text-gray-600">{getTimeAgo(rating.createdAt)}</p>
                    </div>
                    <FuseSvgIcon className="text-yellow-600" size={20}>heroicons-outline:star</FuseSvgIcon>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Comments */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 p-24 bg-white rounded-16 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:fire</FuseSvgIcon>
                Pinned & Recent Comments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {comments.slice(0, 6).map((comment) => (
                  <div key={comment.id} className={`p-16 rounded-12 border-2 ${comment.isPinned ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                    {comment.isPinned && (
                      <div className="mb-8 flex items-center gap-4 text-purple-600 text-xs font-bold">
                        <FuseSvgIcon size={14}>heroicons-outline:bookmark</FuseSvgIcon>
                        PINNED
                      </div>
                    )}
                    <div className="flex items-center gap-8 mb-12">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                        {getInitials(comment.userName)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{comment.userName}</p>
                        <p className="text-xs text-gray-600">{getTimeAgo(comment.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <div className="flex items-center justify-between mb-20">
              <h3 className="text-xl font-bold flex items-center gap-8">
                <FuseSvgIcon size={24}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
                All Comments
              </h3>
            </div>
            <div className="space-y-12">
              {comments.map((comment) => (
                <div key={comment.id} className={`flex items-start gap-16 p-16 rounded-12 border-2 ${comment.isPinned ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {getInitials(comment.userName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-8 mb-8">
                      <strong>{comment.userName}</strong>
                      <span className="text-xs text-gray-600">{formatDate(comment.createdAt)}</span>
                      {comment.isPinned && (
                        <span className="px-8 py-2 bg-purple-600 text-white text-xs rounded-full flex items-center gap-4">
                          <FuseSvgIcon size={12}>heroicons-outline:bookmark</FuseSvgIcon>
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                  <button
                    onClick={() => pinComment(comment.id)}
                    className={`p-8 rounded-lg transition-colors ${comment.isPinned ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title={comment.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <FuseSvgIcon size={20}>heroicons-outline:bookmark</FuseSvgIcon>
                  </button>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-48">
                  <FuseSvgIcon className="text-gray-400 mx-auto mb-16" size={64}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
                  <p className="text-gray-600">No comments yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
              <FuseSvgIcon size={24}>heroicons-outline:star</FuseSvgIcon>
              All Ratings
            </h3>
            <div className="space-y-12">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-start gap-16 p-16 border-2 border-gray-200 rounded-12">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {rating.user?.firstName?.[0]}{rating.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-8 mb-8">
                      <strong>{rating.user?.firstName} {rating.user?.lastName}</strong>
                      <span className="text-yellow-500">{getRatingStars(rating.rating)}</span>
                      <span className="text-xs text-gray-600">{formatDate(rating.createdAt)}</span>
                    </div>
                    {rating.feedback && (
                      <p className="text-gray-700">{rating.feedback}</p>
                    )}
                  </div>
                </div>
              ))}
              {ratings.length === 0 && (
                <div className="text-center py-48">
                  <FuseSvgIcon className="text-gray-400 mx-auto mb-16" size={64}>heroicons-outline:star</FuseSvgIcon>
                  <p className="text-gray-600">No ratings yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Likes Tab */}
        {activeTab === 'likes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-24 bg-white rounded-16 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
              <FuseSvgIcon size={24}>heroicons-outline:heart</FuseSvgIcon>
              All Likes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-16">
              {likes.map((like) => (
                <div key={like.id} className="text-center p-16 border-2 border-gray-200 rounded-12 hover:border-pink-500 transition-colors">
                  <div className="w-64 h-64 mx-auto mb-8 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                    {like.user?.firstName?.[0]}{like.user?.lastName?.[0]}
                  </div>
                  <p className="font-bold text-sm">{like.user?.firstName} {like.user?.lastName}</p>
                  <p className="text-xs text-gray-600">{getTimeAgo(like.createdAt)}</p>
                  <FuseSvgIcon className="text-pink-600 mx-auto mt-8" size={20}>heroicons-outline:heart</FuseSvgIcon>
                </div>
              ))}
              {likes.length === 0 && (
                <div className="col-span-full text-center py-48">
                  <FuseSvgIcon className="text-gray-400 mx-auto mb-16" size={64}>heroicons-outline:heart</FuseSvgIcon>
                  <p className="text-gray-600">No likes yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default EngagementPage;
