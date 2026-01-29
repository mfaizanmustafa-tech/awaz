import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

const API_URL = 'http://localhost:3000';

const LiveChatWidget = ({ channelId, compact = false }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ likes: 0, comments: 0, rating: 0 });
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const commentsEndRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (channelId) {
      loadData();
      intervalRef.current = setInterval(loadData, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [commentsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/interactions/comment/${channelId}?limit=20`, { headers }),
        axios.get(`${API_URL}/interactions/stats/${channelId}`, { headers })
      ]);

      setComments(commentsRes.data);
      setStats({
        likes: statsRes.data.totalLikes,
        comments: statsRes.data.totalComments,
        rating: statsRes.data.averageRating
      });
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat data:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const pinComment = async (commentId) => {
    try {
      const token = localStorage.getItem('jwt_access_token');
      await axios.patch(
        `${API_URL}/interactions/comment/${commentId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
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

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className={`fixed bottom-24 right-24 ${compact ? 'w-400' : 'w-480'} bg-white rounded-16 shadow-2xl`}>
        <div className="p-24 text-center">
          <FuseSvgIcon className="animate-spin text-purple-600 mx-auto" size={32}>heroicons-outline:arrow-path</FuseSvgIcon>
          <p className="mt-12 text-sm text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-24 right-24 ${compact ? 'w-400' : 'w-480'} bg-white rounded-16 shadow-2xl overflow-hidden ${isExpanded ? 'max-h-600' : 'max-h-80'} transition-all z-50`}
    >
      {/* Widget Header */}
      <div 
        className="p-16 bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer"
        onClick={() => compact && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-white font-bold">LIVE CHAT</h3>
              <p className="text-white text-xs opacity-90">{comments.length} messages</p>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-8 text-white text-sm">
              <div className="flex items-center gap-4">
                <FuseSvgIcon size={16}>heroicons-outline:heart</FuseSvgIcon>
                <span>{stats.likes}</span>
              </div>
              <div className="flex items-center gap-4">
                <FuseSvgIcon size={16}>heroicons-outline:star</FuseSvgIcon>
                <span>{stats.rating.toFixed(1)}</span>
              </div>
            </div>
            {compact && (
              <button className="text-white hover:bg-white hover:bg-opacity-20 p-4 rounded transition-colors">
                <FuseSvgIcon size={20}>{isExpanded ? 'heroicons-outline:chevron-down' : 'heroicons-outline:chevron-up'}</FuseSvgIcon>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-h-400 overflow-y-auto"
          >
            <div className="p-16 space-y-12">
              {comments.length === 0 ? (
                <div className="text-center py-48">
                  <FuseSvgIcon className="text-gray-400 mx-auto mb-12" size={48}>heroicons-outline:chat-bubble-left-right</FuseSvgIcon>
                  <p className="text-gray-600 text-sm">No messages yet</p>
                  <span className="text-gray-500 text-xs">Waiting for listeners to chat...</span>
                </div>
              ) : (
                <>
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative flex items-start gap-12 p-12 rounded-lg ${comment.isPinned ? 'bg-purple-50 border-2 border-purple-500' : 'bg-gray-50'}`}
                    >
                      {comment.isPinned && (
                        <div className="absolute top-8 right-8">
                          <FuseSvgIcon className="text-purple-600" size={14}>heroicons-outline:bookmark</FuseSvgIcon>
                        </div>
                      )}
                      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(comment.userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-8 mb-4">
                          <span className="font-bold text-sm text-gray-900">{comment.userName}</span>
                          <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 break-words">{comment.comment}</p>
                      </div>
                      <button
                        onClick={() => pinComment(comment.id)}
                        className={`p-6 rounded-lg transition-colors flex-shrink-0 ${comment.isPinned ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                        title={comment.isPinned ? 'Unpin' : 'Pin message'}
                      >
                        <FuseSvgIcon size={16}>heroicons-outline:bookmark</FuseSvgIcon>
                      </button>
                    </motion.div>
                  ))}
                  <div ref={commentsEndRef} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget Footer */}
      {isExpanded && (
        <div className="p-16 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={() => navigate('/station-owner/engagement')}
            className="w-full px-16 py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-8 font-bold"
          >
            <FuseSvgIcon size={20}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>
            View Full Engagement Dashboard
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default LiveChatWidget;
