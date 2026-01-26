const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });
    
    const [rows] = await connection.execute('SELECT * FROM guests ORDER BY createdAt DESC LIMIT 10');
    console.log('Total guests in database:', rows.length);
    console.log('\nGuests:');
    rows.forEach((guest, index) => {
      console.log(`\n${index + 1}. ${guest.firstName} ${guest.lastName}`);
      console.log(`   ID: ${guest.id}`);
      console.log(`   Type: ${guest.guestType}`);
      console.log(`   Status: ${guest.status}`);
      console.log(`   Created: ${guest.createdAt}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
