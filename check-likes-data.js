const mysql = require('mysql2/promise');

async function checkLikes() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'awaz_user',
    password: 'awaz_pass_2024',
    database: 'awaz_pulse'
  });

  console.log('📊 Checking stream_likes table...\n');
  
  const [likes] = await connection.execute('SELECT * FROM stream_likes ORDER BY createdAt DESC LIMIT 10');
  console.log('Total likes found:', likes.length);
  console.log('\nLikes data:');
  console.table(likes);
  
  const [channels] = await connection.execute('SELECT id, name FROM channels');
  console.log('\n📻 Available channels:');
  console.table(channels);
  
  // Check likes per channel
  const [likesPerChannel] = await connection.execute(`
    SELECT channelId, COUNT(*) as count 
    FROM stream_likes 
    GROUP BY channelId
  `);
  console.log('\n💖 Likes per channel:');
  console.table(likesPerChannel);
  
  await connection.end();
}

checkLikes().catch(console.error);
