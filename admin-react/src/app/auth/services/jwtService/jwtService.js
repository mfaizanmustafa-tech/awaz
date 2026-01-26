import FuseUtils from '@fuse/utils/FuseUtils';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import jwtServiceConfig from './jwtServiceConfig';

/* eslint-disable camelcase */

class JwtService extends FuseUtils.EventEmitter {
  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  setInterceptors = () => {
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (err) => {
        return new Promise((resolve, reject) => {
          // Check if response exists before accessing status
          if (err.response && err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
            // if you ever get an unauthorized response, logout the user
            this.emit('onAutoLogout', 'Invalid access_token');
            this.setSession(null);
          }
          throw err;
        });
      }
    );
  };

  handleAuthentication = () => {
    const access_token = this.getAccessToken();

    if (!access_token) {
      this.emit('onNoAccessToken');

      return;
    }

    if (this.isAuthTokenValid(access_token)) {
      this.setSession(access_token);
      this.emit('onAutoLogin', true);
    } else {
      this.setSession(null);
      this.emit('onAutoLogout', 'access_token expired');
    }
  };

  createUser = (data) => {
    return new Promise((resolve, reject) => {
      axios.post(jwtServiceConfig.signUp, data).then((response) => {
        if (response.data.user) {
          this.setSession(response.data.access_token);
          resolve(response.data.user);
          this.emit('onLogin', response.data.user);
        } else {
          reject(response.data.error);
        }
      });
    });
  };

  signInWithEmailAndPassword = (email, password) => {
    console.log('JwtService - signInWithEmailAndPassword called:', { email });
    console.log('JwtService - API URL:', jwtServiceConfig.signIn);
    
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.signIn, {
          email,
          password,
        })
        .then((response) => {
          console.log('JwtService - Response received:', response.data);
          
          if (response.data.user) {
            // Backend returns 'token' not 'access_token'
            const { token: responseToken, access_token: accessToken, user } = response.data;
            const token = responseToken || accessToken;
            
            // Convert role string to array format expected by Fuse
            if (user.role && typeof user.role === 'string') {
              user.role = [user.role];
            }
            
            console.log('JwtService - Token:', token);
            console.log('JwtService - User:', user);
            
            this.setSession(token);
            resolve(user);
            this.emit('onLogin', user);
          } else {
            console.error('JwtService - No user in response');
            reject(response.data.error || 'No user data received');
          }
        })
        .catch((error) => {
          console.error('JwtService - Error:', error);
          console.error('JwtService - Error message:', error.message);
          console.error('JwtService - Error response:', error.response);
          console.error('JwtService - Error request:', error.request);
          console.error('JwtService - Error config:', error.config);
          
          if (error.response) {
            // Server responded with error
            reject(error.response.data?.message || 'Login failed');
          } else if (error.request) {
            // Request made but no response
            reject('No response from server. Please check if backend is running.');
          } else {
            // Error setting up request
            reject(error.message || 'Login failed');
          }
        });
    });
  };

  signInWithToken = () => {
    return new Promise((resolve, reject) => {
      axios
        .get(jwtServiceConfig.accessToken)
        .then((response) => {
          if (response.data) {
            const user = response.data;
            
            // Convert role string to array format expected by Fuse
            if (user.role && typeof user.role === 'string') {
              user.role = [user.role];
            }
            
            console.log('JwtService - signInWithToken - User:', user);
            
            // Keep the existing token
            resolve(user);
          } else {
            this.logout();
            reject(new Error('Failed to login with token.'));
          }
        })
        .catch((error) => {
          console.error('JwtService - signInWithToken error:', error);
          this.logout();
          reject(new Error('Failed to login with token.'));
        });
    });
  };

  updateUserData = (user) => {
    return axios.post(jwtServiceConfig.updateUser, {
      user,
    });
  };

  setSession = (access_token) => {
    if (access_token) {
      localStorage.setItem('jwt_access_token', access_token);
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      localStorage.removeItem('jwt_access_token');
      delete axios.defaults.headers.common.Authorization;
    }
  };

  logout = () => {
    this.setSession(null);
    this.emit('onLogout', 'Logged out');
  };

  isAuthTokenValid = (access_token) => {
    if (!access_token) {
      return false;
    }
    const decoded = jwtDecode(access_token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('access token expired');
      return false;
    }

    return true;
  };

  getAccessToken = () => {
    return window.localStorage.getItem('jwt_access_token');
  };
}

const instance = new JwtService();

export default instance;
