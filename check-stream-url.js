const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });
    
    // Get the NEWS channel
    const [channels] = await connection.execute(
      "SELECT * FROM channels WHERE name = 'NEWS'"
    );
    
    if (channels.length === 0) {
      console.log('NEWS channel not found');
      await connection.end();
      return;
    }
    
    const channel = channels[0];
    console.log('Channel:', channel.name);
    console.log('Channel ID:', channel.id);
    console.log('Status:', channel.status);
    console.log('');
    
    // Get streams for this channel
    const [streams] = await connection.execute(
      'SELECT * FROM streams WHERE channelId = ?',
      [channel.id]
    );
    
    console.log(`Streams for ${channel.name}:`);
    streams.forEach((stream, index) => {
      console.log(`\nStream ${index + 1}:`);
      console.log(`  ID: ${stream.id}`);
      console.log(`  Type: ${stream.type}`);
      console.log(`  Status: ${stream.status}`);
      console.log(`  Stream URL: ${stream.streamUrl}`);
      console.log(`  Current Track: ${stream.currentTrack}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
