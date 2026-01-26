const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });
    
    // First, get the user ID for station@gmail.com
    const [users] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['station@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('User station@gmail.com not found');
      await connection.end();
      return;
    }
    
    const user = users[0];
    console.log(`User: ${user.email} (ID: ${user.id})`);
    console.log(`Role: ${user.role}\n`);
    
    // Get all channels owned by this user
    const [channels] = await connection.execute(
      'SELECT * FROM channels WHERE ownerId = ? ORDER BY createdAt DESC',
      [user.id]
    );
    
    console.log(`Total channels owned: ${channels.length}\n`);
    
    if (channels.length > 0) {
      channels.forEach((channel, index) => {
        console.log(`Channel ${index + 1}:`);
        console.log(`  Name: ${channel.name}`);
        console.log(`  ID: ${channel.id}`);
        console.log(`  Status: ${channel.status}`);
        console.log(`  Category: ${channel.category}`);
        console.log(`  Created: ${channel.createdAt}`);
        console.log('');
      });
    } else {
      console.log('No channels found for this user');
    }
    
    // Also check all channels in the database
    const [allChannels] = await connection.execute(
      'SELECT c.*, u.email as ownerEmail FROM channels c LEFT JOIN users u ON c.ownerId = u.id ORDER BY c.createdAt DESC LIMIT 10'
    );
    
    console.log(`\nAll channels in database (last 10):`);
    allChannels.forEach((channel, index) => {
      console.log(`${index + 1}. ${channel.name} - Owner: ${channel.ownerEmail || 'Unknown'} - Status: ${channel.status}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
