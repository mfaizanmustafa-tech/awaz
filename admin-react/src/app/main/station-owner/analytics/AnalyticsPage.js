import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

// Mock analytics data
const mockAnalytics = {
  daily: { likes: 245, listeners: 1250, comments: 89, showsRatings: 4.5 },
  weekly: { likes: 1680, listeners: 8750, comments: 623, showsRatings: 4.6 },
  monthly: { likes: 7200, listeners: 37500, comments: 2680, showsRatings: 4.7 }
};

function AnalyticsPage() {
  console.log('AnalyticsPage component loaded');
  
  const [timeRange, setTimeRange] = useState('daily');
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([65, 80, 45, 90, 75, 60, 85]);
  const [chartLabels, setChartLabels] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt_access_token');
      const response = await axios.get(
        `http://localhost:3000/analytics?range=${timeRange}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(response.data || mockAnalytics);
      console.log('Loaded analytics:', response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use mock data on error
      setAnalytics(mockAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const updateChartLabels = () => {
    switch (timeRange) {
      default:
        break;
      case 'daily':
        setChartLabels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
        setChartData([65, 80, 45, 90, 75, 60, 85]);
        break;
      case 'weekly':
        setChartLabels(['W1', 'W2', 'W3', 'W4']);
        setChartData([65, 80, 45, 90]);
        break;
      case 'monthly':
        setChartLabels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
        setChartData([65, 80, 45, 90, 75, 60]);
        break;
    }
  };

  const getAnalyticsValue = (metric) => {
    return analytics[timeRange][metric];
  };

  useEffect(() => {
    loadAnalytics();
    updateChartLabels();
  }, [timeRange]);

  return (
    <div className="p-24 sm:p-32 w-full min-h-full">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-24 p-32 rounded-16 bg-gradient-to-r from-green-800 to-green-900 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="w-64 h-64 rounded-full bg-white flex items-center justify-center">
              <FuseSvgIcon className="text-green-600" size={32}>heroicons-outline:chart-bar</FuseSvgIcon>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Analytics Dashboard</h1>
              <p className="text-white opacity-90 text-sm">Track your channel's performance and growth</p>
            </div>
          </div>
          <div className="flex gap-8 bg-white rounded-lg p-4">
            {['daily', 'weekly', 'monthly'].map((range) => (
              <button type="button" type="button"
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-20 py-10 rounded-lg text-sm font-bold transition-all ${
                  timeRange === range
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
        {[
          { label: 'Likes', value: getAnalyticsValue('likes'), icon: 'heroicons-outline:heart', color: 'red', trend: '+12%' },
          { label: 'Listeners', value: getAnalyticsValue('listeners'), icon: 'heroicons-outline:users', color: 'blue', trend: '+8%' },
          { label: 'Comments', value: getAnalyticsValue('comments'), icon: 'heroicons-outline:chat-bubble-left-right', color: 'purple', trend: '+15%' },
          { label: 'Show Ratings', value: getAnalyticsValue('showsRatings').toFixed(1), icon: 'heroicons-outline:star', color: 'yellow', trend: '+0.3' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="p-24 bg-white rounded-12 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-16">
              <div>
                <p className="text-sm text-gray-600 mb-4">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-600`}>
                  {typeof stat.value === 'number' && stat.value >= 1000
                    ? (stat.value / 1000).toFixed(1) + 'K'
                    : stat.value}
                </p>
              </div>
              <div className={`w-56 h-56 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                <FuseSvgIcon className={`text-${stat.color}-600`} size={28}>{stat.icon}</FuseSvgIcon>
              </div>
            </div>
            <div className="flex items-center gap-4 text-green-600 text-sm">
              <FuseSvgIcon size={16}>heroicons-outline:arrow-trending-up</FuseSvgIcon>
              <span className="font-bold">{stat.trend}</span>
              <span className="text-gray-500">from last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
        {/* Performance Trends Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-24 bg-white rounded-16 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
            <FuseSvgIcon size={24}>heroicons-outline:chart-bar</FuseSvgIcon>
            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Performance Trends
          </h3>
          
          {/* Custom Bar Chart */}
          <div className="h-320">
            <div className="h-full flex items-end justify-between gap-8 px-16">
              {chartData.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-8">
                  <div className="w-full relative group">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${value}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg cursor-pointer hover:from-green-700 hover:to-green-500 transition-colors relative"
                      style={{ minHeight: '20px' }}
                    >
                      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-8 py-4 rounded whitespace-nowrap">
                        {value}%
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{chartLabels[index]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-24 p-16 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-8">
                <div className="w-12 h-12 bg-green-600 rounded"></div>
                <span className="text-gray-600">Engagement Rate</span>
              </div>
              <span className="font-bold text-gray-900">Average: {(chartData.reduce((a, b) => a + b, 0) / chartData.length).toFixed(1)}%</span>
            </div>
          </div>
        </motion.div>

        {/* Top Shows Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-24 bg-white rounded-16 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-20 flex items-center gap-8">
            <FuseSvgIcon size={24}>heroicons-outline:fire</FuseSvgIcon>
            Top Shows
          </h3>

          <div className="space-y-12">
            {[
              { title: 'Morning Drive', listeners: 1250, trend: '+15%' },
              { title: 'Evening Talk', listeners: 980, trend: '+12%' },
              { title: 'Night Beats', listeners: 850, trend: '+8%' },
              { title: 'Weekend Special', listeners: 720, trend: '+5%' },
              { title: 'Lunch Hour', listeners: 650, trend: '+3%' }
            ].map((show, index) => (
              <div key={index} className="p-16 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold text-gray-900">{show.title}</h4>
                  <span className="text-xs font-bold text-green-600">{show.trend}</span>
                </div>
                <div className="flex items-center gap-8">
                  <FuseSvgIcon className="text-gray-400" size={14}>heroicons-outline:users</FuseSvgIcon>
                  <span className="text-sm text-gray-600">{show.listeners.toLocaleString()} listeners</span>
                </div>
                <div className="mt-8 w-full bg-gray-200 rounded-full h-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(show.listeners / 1250) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="bg-gradient-to-r from-green-600 to-green-400 h-6 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-16 shadow-lg"
        >
          <FuseSvgIcon className="mb-16" size={32}>heroicons-outline:clock</FuseSvgIcon>
          <h4 className="text-lg font-bold mb-8">Avg. Listen Time</h4>
          <p className="text-3xl font-bold mb-4">24.5 min</p>
          <p className="text-sm opacity-90">+3.2 min from last period</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-24 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-16 shadow-lg"
        >
          <FuseSvgIcon className="mb-16" size={32}>heroicons-outline:arrow-trending-up</FuseSvgIcon>
          <h4 className="text-lg font-bold mb-8">Growth Rate</h4>
          <p className="text-3xl font-bold mb-4">+18.5%</p>
          <p className="text-sm opacity-90">Compared to last period</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-24 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-16 shadow-lg"
        >
          <FuseSvgIcon className="mb-16" size={32}>heroicons-outline:user-group</FuseSvgIcon>
          <h4 className="text-lg font-bold mb-8">Active Users</h4>
          <p className="text-3xl font-bold mb-4">3,247</p>
          <p className="text-sm opacity-90">+425 new this period</p>
        </motion.div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
