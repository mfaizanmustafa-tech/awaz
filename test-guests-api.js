const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testGuestsAPI() {
  try {
    // First, login to get a token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@awazpulse.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, token received');
    
    // Now fetch guests
    console.log('\n2. Fetching guests...');
    const guestsResponse = await axios.get(`${API_URL}/guests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Guests fetched: ${guestsResponse.data.length} guests`);
    console.log('\nGuests:');
    guestsResponse.data.forEach((guest, index) => {
      console.log(`\n${index + 1}. ${guest.displayName || `${guest.firstName} ${guest.lastName}`}`);
      console.log(`   ID: ${guest.id}`);
      console.log(`   Type: ${guest.guestType}`);
      console.log(`   Purpose: ${guest.guestPurpose || 'N/A'}`);
      console.log(`   Organization: ${guest.organization || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGuestsAPI();
