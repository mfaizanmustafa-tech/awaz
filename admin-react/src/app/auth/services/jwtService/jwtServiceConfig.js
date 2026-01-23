const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const jwtServiceConfig = {
  signIn: `${API_URL}/auth/login`,
  signUp: `${API_URL}/auth/register`,
  accessToken: `${API_URL}/auth/profile`,
  updateUser: `${API_URL}/auth/profile`,
};

export default jwtServiceConfig;
