const mysql = require('mysql2/promise');

async function getStreamCredentials() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'awaz_user',
    password: 'awaz_pass_2024',
    database: 'awaz_pulse'
  });

  console.log('🔌 Connected to database\n');

  // Get channels with stream keys
  const [channels] = await connection.execute(`
    SELECT 
      c.id,
      c.name,
      c.streamKey,
      c.status,
      u.email as ownerEmail,
      u.name as ownerName
    FROM channels c
    JOIN users u ON c.ownerId = u.id
    ORDER BY c.createdAt DESC
  `);

  console.log('📡 STREAMING CREDENTIALS\n');
  console.log('='.repeat(80));

  if (channels.length === 0) {
    console.log('❌ No channels found. Create a channel first!');
  } else {
    channels.forEach((channel, index) => {
      console.log(`\n📻 Channel ${index + 1}: ${channel.name}`);
      console.log(`   Owner: ${channel.ownerName} (${channel.ownerEmail})`);
      console.log(`   Status: ${channel.status}`);
      console.log(`   Stream Key: ${channel.streamKey || 'NOT GENERATED YET'}`);
      console.log(`\n   🎥 OBS Settings:`);
      console.log(`   Server: rtmp://localhost:1935/live`);
      console.log(`   Stream Key: ${channel.streamKey || 'GENERATE IN DASHBOARD'}`);
      console.log(`\n   🎧 Playback URL (after streaming):`);
      console.log(`   http://localhost:8088/hls/${channel.streamKey || 'YOUR_KEY'}.m3u8`);
      console.log('-'.repeat(80));
    });
  }

  await connection.end();
}

getStreamCredentials().catch(console.error);
